// Array Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#array-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, flatten, isArray, isNil } from "../../../util";
import { $first as __first } from "../../accumulator/first";

/**
 * Returns the first element in an array.
 */
export const $first: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  if (isArray(obj)) return __first(obj, expr, options);
  const arr = computeValue(obj, expr, null, options) as Any[];
  if (isNil(arr)) return null;
  assert(
    isArray(arr) && arr.length > 0,
    "$first must resolve to a non-empty array."
  );
  return flatten(arr)[0];
};
