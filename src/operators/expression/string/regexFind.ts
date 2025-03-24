/**
 * String Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#string-expression-operators
 */

import { ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { regexSearch } from "./_internal";

/**
 * Applies a regular expression (regex) to a string and returns information on the first matched substring.
 *
 * @param obj
 * @param expr
 */
export const $regexFind: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const result = regexSearch(obj, expr, options, { global: false });
  return result && result.length > 0 ? result[0] : null;
};
