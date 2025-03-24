/**
 * Type Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#type-expression-operators
 */

import { ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { MAX_INT, MIN_INT, toInteger } from "./_internal";

/**
 * Converts a value to an integer. If the value cannot be converted to an integer, $toInt errors. If the value is null or missing, $toInt returns null.
 * @param obj
 * @param expr
 */
export const $toInt: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => toInteger(obj, expr, options, MIN_INT, MAX_INT);
