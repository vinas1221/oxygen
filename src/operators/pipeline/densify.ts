import { ComputeOptions, Options, PipelineOperator } from "../../core";
import { concat, Iterator, IteratorResult, Lazy } from "../../lazy";
import { AnyObject, TIME_UNITS, TimeUnit } from "../../types";
import {
  assert,
  isArray,
  isDate,
  isNil,
  isNumber,
  isObject,
  isString,
  resolve,
  ValueMap
} from "../../util";
import { $dateAdd } from "../expression/date/dateAdd";
import { $sort } from "./sort";

interface InputExpr {
  /**
   * The field to densify. The values of the specified field must either be all numeric values or all dates.
   * AnyObjects that do not contain the specified field continue through the pipeline unmodified.
   * To specify a <field> in an embedded document or in an array, use dot notation.
   */
  field: string;
  range: {
    step: number;
    bounds: "full" | "partition" | [number, number] | [Date, Date];
    // Required if field is a date.
    unit?: TimeUnit;
  };
  partitionByFields?: string[];
}

type DateOrNumber = number | Date;

const EMPTY_OBJECT = Object.freeze({}) as Readonly<AnyObject>;

/**
 * Creates new documents in a sequence of documents where certain values in a field are missing.
 *
 * {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/densify usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $densify: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  const { step, bounds, unit } = expr.range;
  // If range.unit is specified, step must be an integer. Otherwise, step can be any numeric value.
  if (unit) {
    assert(TIME_UNITS.includes(unit), "");
    assert(
      Number.isInteger(step) && step > 0,
      "The step parameter in a range statement must be a whole number when densifying a date range."
    );
  } else {
    assert(
      isNumber(step) && step > 0,
      "The step parameter in a range statement must be a strictly positive numeric value."
    );
  }

  if (isArray(bounds)) {
    assert(
      !!bounds && bounds.length === 2,
      "A bounding array in a range statement must have exactly two elements."
    );
    assert(
      (bounds.every(isNumber) || bounds.every(isDate)) && bounds[0] < bounds[1],
      "A bounding array must be an ascending array of either two dates or two numbers."
    );
    assert(
      unit && !bounds.some(isNumber),
      "Numeric bounds may not have unit parameter."
    );
  }

  if (expr.partitionByFields) {
    assert(
      isArray(expr.partitionByFields),
      "$densify: `partitionByFields` must be an array of strings"
    );
  }

  // sort by `expr.field` for densification.
  collection = $sort(collection, { [expr.field]: 1 }, options);

  // empty options used for date range calculation.
  const nilOptions = ComputeOptions.init(options, null);

  // Compute the next value in the densify sequence for the given partition key.
  const computeNextValue = (value: DateOrNumber) => {
    return isNumber(value)
      ? value + step
      : $dateAdd(
          EMPTY_OBJECT,
          { startDate: value, unit, amount: step },
          nilOptions
        );
  };

  const isValidUnit = !!unit && TIME_UNITS.includes(unit);
  const getFieldValue = (o: AnyObject): DateOrNumber => {
    const v = resolve(o, expr.field);
    // return nil values
    if (isNil(v)) return v as DateOrNumber;

    if (isNumber(v)) {
      assert(
        !isValidUnit,
        "$densify: Encountered non-date value in collection when step has a date unit."
      );
    } else if (isDate(v)) {
      assert(
        isValidUnit,
        "$densify: Encountered date value in collection when step does not have a date unit."
      );
    } else {
      assert(false, "$densify: Densify field type must be numeric or a date");
    }
    return v as DateOrNumber;
  };

  // Algorithm
  // ==========
  // 1. sort collection. (DONE)
  // 2. create `nilIterator` to yield all nil values from collection.
  // 3. create a `densifyIterator` to yield non-nil collection items or generate values to fill within the bounds.
  // 4. return a new iterator that combines the two iterators.
  // 5. If bounds == "full": create a `fullBoundIterator` that yields remaining dense values based on the maximum in the collection.

  // bag to hold the peeked object from the collection
  const peekItem = new Array<IteratorResult>();

  // The nil fields iterator yields items from the collection whose field value is nil.
  const nilFieldsIterator = Lazy(() => {
    const item = collection.next();
    const fieldValue = getFieldValue(item.value as AnyObject);
    if (isNil(fieldValue)) return item;
    // found the first non-nil value. store and exit nil iterator
    peekItem.push(item);
    return { done: true };
  });

  // Map of (partitionKey -> nextDensifyValue).
  // We cannot use $group to partition fields here since we need extract the raw fields and validate their values.
  // Rather than try to partition upfront, process the collection in sorted order and compute the next document using
  // the last value for the given partition.
  const nextDensifyValueMap = ValueMap.init<string[], DateOrNumber>(
    options.hashFunction
  );

  const [lower, upper] = isArray(bounds) ? bounds : [bounds, bounds];

  // tracks the maximum field value seen across the entire collection
  let maxFieldValue: DateOrNumber = undefined;
  // updates the maximum field value across the entire collection.
  const updateMaxFieldValue = (value: DateOrNumber) => {
    maxFieldValue =
      maxFieldValue === undefined || maxFieldValue < value
        ? value
        : maxFieldValue;
  };

  // represents a partition over the entire collection
  const rootKey: string[] = [] as const;

  // An iterator that yields objects from the collection or add a densified object.
  const densifyIterator = Lazy(() => {
    const item = peekItem.length > 0 ? peekItem.pop() : collection.next();
    // nothing more to process
    if (item.done) return item;

    // compute partition key and values. default to null partition key for entire collection.
    let partitionKey: string[] = rootKey;
    if (isArray(expr.partitionByFields)) {
      partitionKey = expr.partitionByFields.map(k =>
        resolve(item.value as AnyObject, k)
      ) as string[];
      assert(
        partitionKey.every(isString),
        "$densify: Partition fields must evaluate to string values."
      );
    }

    // get the item field value
    assert(isObject(item.value), "$densify: collection must contain documents");
    const itemValue = getFieldValue(item.value as AnyObject);

    // first time, there is no minimum value so we determine it.
    if (!nextDensifyValueMap.has(partitionKey)) {
      // If bounds is "full": $densify adds documents spanning the full range of values of the field being densified.
      // We use the smallest value from the entire collection as the start value for each partition.
      if (lower == "full") {
        // smallest value is always stored with 'null' partition.
        // first check if we already have that value.
        if (!nextDensifyValueMap.has(rootKey)) {
          // initialize the start value.
          nextDensifyValueMap.set(rootKey, itemValue);
        }
        // set the start value for the partition.
        nextDensifyValueMap.set(partitionKey, nextDensifyValueMap.get(rootKey));
      } else if (lower == "partition") {
        // If bounds is "partition": $densify adds documents to each partition, similar to if you had run a full range densification on each partition individually.
        // We use the smallest value within each partition as the start value.
        nextDensifyValueMap.set(partitionKey, itemValue);
      } else {
        // If bounds is an array:
        //    $densify adds documents spanning the range of values within the specified bounds.
        //    The data type for the bounds must correspond to the data type in the field being densified.
        // We start from the 'lower' value.
        nextDensifyValueMap.set(partitionKey, lower);
      }
    }

    // fetch value for partition.
    const densifyValue = nextDensifyValueMap.get(partitionKey);
    // return the item if...
    if (
      // current item field value is lower than current densify value.
      itemValue <= densifyValue ||
      // range value equals or exceeds upper bound
      (upper != "full" && upper != "partition" && densifyValue >= upper)
    ) {
      // compute next densify value if smaller or equal.
      if (densifyValue <= itemValue) {
        nextDensifyValueMap.set(partitionKey, computeNextValue(densifyValue));
      }
      updateMaxFieldValue(itemValue);
      return item;
    }

    // compute next densify value since the current one will be used in next two cases.
    nextDensifyValueMap.set(partitionKey, computeNextValue(densifyValue));

    // (itemValue > rangeValue): range is bounded only by max item value (i.e. 'full' or 'partition').
    updateMaxFieldValue(densifyValue);
    const denseObj: AnyObject = { [expr.field]: densifyValue };
    // add extra partition field values.
    if (partitionKey) {
      partitionKey.forEach((v, i) => {
        denseObj[expr.partitionByFields[i]] = v;
      });
    }
    peekItem.push(item);
    // this is an added dense object
    return { done: false, value: denseObj };
  });

  // handles normal bounds and partition.
  if (lower !== "full") return concat(nilFieldsIterator, densifyIterator);

  // used to iterate through the partitions
  let paritionIndex = -1;
  let partitionKeysSet: string[][] = undefined;
  // An iterator to return remaining densify values for 'full' bounds.
  const fullBoundsIterator = Lazy(() => {
    if (paritionIndex === -1) {
      const fullDensifyValue = nextDensifyValueMap.get(rootKey);
      nextDensifyValueMap.delete(rootKey);
      // insertion order of keys is preserved so will be stable.
      partitionKeysSet = Array.from(nextDensifyValueMap.keys());
      // if there are no partitions, then we have a single collection so restore the `fullDensifyValue`
      if (partitionKeysSet.length === 0) {
        partitionKeysSet.push(rootKey);
        nextDensifyValueMap.set(rootKey, fullDensifyValue);
      }
      paritionIndex++;
    }

    do {
      const partitionKey = partitionKeysSet[paritionIndex];
      const partitionMaxValue = nextDensifyValueMap.get(partitionKey);

      // this partition needs extra documents.
      if (partitionMaxValue < maxFieldValue) {
        nextDensifyValueMap.set(
          partitionKey,
          computeNextValue(partitionMaxValue)
        );
        const denseObj: AnyObject = { [expr.field]: partitionMaxValue };
        partitionKey.forEach((v, i) => {
          denseObj[expr.partitionByFields[i]] = v;
        });
        // this is an added dense object
        return { done: false, value: denseObj };
      }
      // go to next partition
      paritionIndex++;
    } while (paritionIndex < partitionKeysSet.length);

    return { done: true };
  });

  return concat(nilFieldsIterator, densifyIterator, fullBoundsIterator);
};
