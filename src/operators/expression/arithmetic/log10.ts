// Arithmetic Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#arithmetic-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";

/**
 * Calculates the log base 10 of a number and returns the result as a double.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $log10: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;

  assert(
    isNumber(n) || isNaN(n),
    "$log10 expression must resolve to a number."
  );

  return Math.log10(n);
};
