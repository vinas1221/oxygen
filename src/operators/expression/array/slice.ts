// Array Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#array-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, isNil } from "../../../util";

/**
 * Returns a subset of an array.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $slice: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  const arr = args[0] as Any[];
  let skip = args[1] as number;
  let limit = args[2] as number;

  // MongoDB $slice works a bit differently from Array.slice
  // Uses single argument for 'limit' and array argument [skip, limit]
  if (isNil(limit)) {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    } else {
      limit = skip;
      skip = 0;
    }
  } else {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    }
    assert(
      limit > 0,
      `Invalid argument for $slice operator. Limit must be a positive number`
    );
    limit += skip;
  }

  return arr.slice(skip, limit);
};
