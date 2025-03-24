// Date Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#date-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject, TimeUnit } from "../../../types";
import {
  adjustDate,
  dateDiffDay,
  dateDiffHour,
  dateDiffMonth,
  dateDiffQuarter,
  dateDiffWeek,
  dateDiffYear,
  DayOfWeek,
  parseTimezone,
  TIMEUNIT_IN_MILLIS
} from "./_internal";

/**
 * Returns the difference between two dates.
 * @param obj
 * @param expr
 * @param options Options
 */
export const $dateDiff: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const { startDate, endDate, unit, timezone, startOfWeek } = computeValue(
    obj,
    expr,
    null,
    options
  ) as {
    startDate: Date;
    endDate: Date;
    unit: TimeUnit;
    timezone?: string;
    startOfWeek?: DayOfWeek;
  };

  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  const minuteOffset = parseTimezone(timezone);
  adjustDate(d1, minuteOffset);
  adjustDate(d2, minuteOffset);

  switch (unit) {
    case "year":
      return dateDiffYear(d1, d2);
    case "quarter":
      return dateDiffQuarter(d1, d2);
    case "month":
      return dateDiffMonth(d1, d2);
    case "week":
      return dateDiffWeek(d1, d2, startOfWeek);
    case "day":
      return dateDiffDay(d1, d2);
    case "hour":
      return dateDiffHour(d1, d2);
    case "minute":
      d1.setUTCSeconds(0);
      d1.setUTCMilliseconds(0);
      d2.setUTCSeconds(0);
      d2.setUTCMilliseconds(0);
      return Math.round(
        (d2.getTime() - d1.getTime()) / TIMEUNIT_IN_MILLIS[unit]
      );
    default:
      return Math.round(
        (d2.getTime() - d1.getTime()) / TIMEUNIT_IN_MILLIS[unit]
      );
  }
};
