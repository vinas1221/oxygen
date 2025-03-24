// Date Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#date-expression-operators

import { ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { computeDate, isoWeekYear } from "./_internal";

/**
 * Returns the year number in ISO 8601 format. The year starts with the Monday of week 1 and ends with the Sunday of the last week.
 * @param obj
 * @param expr
 */
export const $isoWeekYear: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => isoWeekYear(computeDate(obj, expr, options));
