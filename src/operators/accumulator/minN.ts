// https://www.mongodb.com/docs/manual/reference/operator/aggregation/minN
import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core";
import { Any, AnyObject } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the minimum value n elements within a group.
 * If the group contains fewer than n elements, $minN returns all elements in the group.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $minN: AccumulatorOperator = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = ComputeOptions.init(options);
  const m = collection.length;
  const n = computeValue(copts?.local?.groupId, expr.n, null, copts) as number;
  const arr = $push(collection, expr.input, options).filter(o => !isNil(o));
  arr.sort(compare);
  return m <= n ? arr : arr.slice(0, n);
};
