/**
 * Set Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#set-expression-operators
 */

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { truthy } from "../../../util";

/**
 * Returns true if any elements of a set evaluate to true, and false otherwise.
 * @param obj
 * @param expr
 */
export const $anyElementTrue: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  // mongodb nests the array expression in another
  const args = computeValue(obj, expr, null, options)[0] as Any[];
  return args.some(v => truthy(v, options.useStrictMode));
};
