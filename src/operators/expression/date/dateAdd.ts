// Date Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#date-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject, TimeUnit } from "../../../types";
import { dateAdd } from "./_internal";

/**
 * Increments a Date object by a specified number of time units.
 * @param obj
 * @param expr
 */
export const $dateAdd: ExpressionOperator<Date> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Date => {
  const args = computeValue(obj, expr, null, options) as {
    startDate: Date;
    unit: TimeUnit;
    amount: number;
    timezone?: string;
  };
  return dateAdd(args.startDate, args.unit, args.amount, args.timezone);
};
