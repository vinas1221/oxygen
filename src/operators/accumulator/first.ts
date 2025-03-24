import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core";
import { Any, AnyObject } from "../../types";

/**
 * Returns the first value in a group.
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @returns {*}
 */
export const $first: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  if (collection.length === 0) return undefined;
  const copts = ComputeOptions.init(options).update(collection[0]);
  return computeValue(collection[0], expr, null, copts);
};
