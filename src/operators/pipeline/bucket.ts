import { computeValue, Options, PipelineOperator } from "../../core";
import { Iterator, Lazy } from "../../lazy";
import { Any, AnyObject } from "../../types";
import { assert, compare, findInsertIndex, isNil, typeOf } from "../../util";

interface InputExpr {
  groupBy: Any;
  boundaries: Any[];
  default: Any;
  output?: AnyObject;
}

/**
 * Categorizes incoming documents into groups, called buckets, based on a specified
 * expression and bucket boundaries and outputs a document per each bucket.
 *
 * See {@link https://docs.mongodb.com/manual/reference/operator/aggregation/bucket/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $bucket: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  const bounds = [...expr.boundaries];
  const defaultKey = expr.default;
  const lower = bounds[0]; // inclusive
  const upper = bounds[bounds.length - 1]; // exclusive
  const outputExpr = expr.output || { count: { $sum: 1 } };

  assert(bounds.length > 1, "$bucket must specify at least two boundaries.");
  const isValid = bounds.every(
    (v, i) =>
      i === 0 ||
      (typeOf(v) === typeOf(bounds[i - 1]) && compare(v, bounds[i - 1]) > 0)
  );
  assert(
    isValid,
    `$bucket: bounds must be of same type and in ascending order`
  );

  if (!isNil(defaultKey) && typeOf(defaultKey) === typeOf(lower)) {
    assert(
      compare(defaultKey, upper) >= 0 || compare(defaultKey, lower) < 0,
      "$bucket 'default' expression must be out of boundaries range"
    );
  }

  const createBuckets = () => {
    const buckets = new Map<Any, Any[]>();
    for (let i = 0; i < bounds.length - 1; i++) {
      buckets.set(bounds[i], []);
    }

    // add default key if provided
    if (!isNil(defaultKey)) buckets.set(defaultKey, []);

    collection.each((obj: AnyObject) => {
      const key = computeValue(obj, expr.groupBy, null, options);

      if (isNil(key) || compare(key, lower) < 0 || compare(key, upper) >= 0) {
        assert(
          !isNil(defaultKey),
          "$bucket require a default for out of range values"
        );
        buckets.get(defaultKey).push(obj);
      } else {
        assert(
          compare(key, lower) >= 0 && compare(key, upper) < 0,
          "$bucket 'groupBy' expression must resolve to a value in range of boundaries"
        );
        const index = findInsertIndex(bounds, key);
        const boundKey = bounds[Math.max(0, index - 1)] as string;
        buckets.get(boundKey).push(obj);
      }
    });

    // upper bound is exclusive so we remove it
    bounds.pop();
    if (!isNil(defaultKey)) bounds.push(defaultKey);

    assert(
      buckets.size === bounds.length,
      "bounds and groups must be of equal size."
    );

    return Lazy(bounds).map((key: string) => {
      return {
        ...(computeValue(
          buckets.get(key),
          outputExpr,
          null,
          options
        ) as AnyObject[]),
        _id: key
      };
    });
  };

  let iterator: Iterator;
  return Lazy(() => {
    if (!iterator) iterator = createBuckets();
    return iterator.next();
  });
};
