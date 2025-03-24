// Array Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#array-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";

/**
 * Returns an array whose elements are a generated sequence of numbers.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $range: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const arr = computeValue(obj, expr, null, options);
  const start = arr[0] as number;
  const end = arr[1] as number;
  const step = (arr[2] as number) || 1;

  const result = new Array<number>();
  let counter = start;
  while ((counter < end && step > 0) || (counter > end && step < 0)) {
    result.push(counter);
    counter += step;
  }

  return result;
};
