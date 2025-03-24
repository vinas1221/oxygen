/**
 * String Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#string-expression-operators
 */

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";

/**
 * Returns the number of UTF-8 encoded bytes in the specified string.
 *
 * @param  {AnyObject} obj
 * @param  {String} expr
 * @return {Number}
 */
export const $strLenBytes: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  return ~-encodeURI(computeValue(obj, expr, null, options) as string).split(
    /%..|./
  ).length;
};
