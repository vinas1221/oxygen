import { computeValue, Options } from "../../../core";
import { Any, TimeUnit } from "../../../types";
import { isDate, isNil, isNumber, MingoError } from "../../../util";

export const LEAP_YEAR_REF_POINT = -1000000000;
export const DAYS_PER_WEEK = 7;

export const isLeapYear = (y: number): boolean =>
  (y & 3) == 0 && (y % 100 != 0 || y % 400 == 0);

const DAYS_IN_YEAR = [365 /*common*/, 366 /*leap*/] as const;
export const daysInYear = (year: number): number =>
  DAYS_IN_YEAR[+isLeapYear(year)];

// common months of year. 0-based month
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
export const daysInMonth = (d: Date): number =>
  DAYS_IN_MONTH[d.getUTCMonth()] +
  Number(
    d.getUTCMonth() === 1 && isLeapYear(d.getUTCFullYear())
  ); /*leap adjust for FEB*/

const YEAR_DAYS_OFFSET = [
  [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const /*common*/,
  [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335] as const /*leap*/
] as const;
export const dayOfYear = (d: Date) =>
  YEAR_DAYS_OFFSET[+isLeapYear(d.getUTCFullYear())][d.getUTCMonth()] +
  d.getUTCDate();

/** Returns the ISO day of week. Mon=1,Tue=2,...,Sun=7 */
export const isoWeekday = (
  date: Date,
  startOfWeek: DayOfWeek = "sun"
): number => {
  const dow = date.getUTCDay() || 7;
  return (dow - ISO_WEEKDAY_MAP[startOfWeek] + DAYS_PER_WEEK) % DAYS_PER_WEEK;
};

// https://en.wikipedia.org/wiki/ISO_week_date
const p = (y: number): number =>
  (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;

const weeks = (y: number): number => 52 + Number(p(y) == 4 || p(y - 1) == 3);

export function isoWeek(d: Date): number {
  // algorithm based on https://en.wikipedia.org/wiki/ISO_week_date
  const dow = d.getUTCDay() || 7;
  const w = Math.floor((10 + dayOfYear(d) - dow) / 7);
  if (w < 1) return weeks(d.getUTCFullYear() - 1);
  if (w > weeks(d.getUTCFullYear())) return 1;
  return w;
}

export function isoWeekYear(d: Date): number {
  return (
    d.getUTCFullYear() -
    Number(d.getUTCMonth() === 0 && d.getUTCDate() == 1 && d.getUTCDay() < 1)
  );
}

export const MINUTES_PER_HOUR = 60;
export const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
export const TIMEUNIT_IN_MILLIS: Record<
  Exclude<TimeUnit, "year" | "quarter" | "month">,
  number
> = {
  week: MILLIS_PER_DAY * DAYS_PER_WEEK,
  day: MILLIS_PER_DAY,
  hour: 1000 * 60 * 60,
  minute: 1000 * 60,
  second: 1000,
  millisecond: 1
};

export const DAYS_OF_WEEK = [
  "monday",
  "mon",
  "tuesday",
  "tue",
  "wednesday",
  "wed",
  "thursday",
  "thu",
  "friday",
  "fri",
  "saturday",
  "sat",
  "sunday",
  "sun"
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAYS_OF_WEEK_SET = new Set(DAYS_OF_WEEK);

const ISO_WEEKDAY_MAP: Record<
  Extract<DayOfWeek, "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">,
  number
> = Object.freeze({
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
});

// default format if unspecified
export const DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%LZ";

// Inclusive interval of date parts
export const DATE_PART_INTERVAL = [
  ["year", 0, 9999] as const,
  ["month", 1, 12] as const,
  ["day", 1, 31] as const,
  ["hour", 0, 23] as const,
  ["minute", 0, 59] as const,
  ["second", 0, 59] as const,
  ["millisecond", 0, 999] as const
] as const;

export interface DatePartFormatter {
  name: string;
  padding: number;
  re: RegExp;
}

// used for formatting dates in $dateToString operator
export const DATE_SYM_TABLE = Object.freeze({
  "%Y": { name: "year", padding: 4, re: /([0-9]{4})/ },
  "%G": { name: "year", padding: 4, re: /([0-9]{4})/ },
  "%m": { name: "month", padding: 2, re: /(0[1-9]|1[012])/ },
  "%d": { name: "day", padding: 2, re: /(0[1-9]|[12][0-9]|3[01])/ },
  "%H": { name: "hour", padding: 2, re: /([01][0-9]|2[0-3])/ },
  "%M": { name: "minute", padding: 2, re: /([0-5][0-9])/ },
  "%S": { name: "second", padding: 2, re: /([0-5][0-9]|60)/ },
  "%L": { name: "millisecond", padding: 3, re: /([0-9]{3})/ },
  "%u": { name: "weekday", padding: 1, re: /([1-7])/ },
  "%U": { name: "week", padding: 2, re: /([1-4][0-9]?|5[0-3]?)/ },
  "%V": { name: "isoWeek", padding: 2, re: /([1-4][0-9]?|5[0-3]?)/ },
  "%z": {
    name: "timezone",
    padding: 2,
    re: /(([+-][01][0-9]|2[0-3]):?([0-5][0-9])?)/
  },
  "%Z": { name: "minuteOffset", padding: 3, re: /([+-][0-9]{3})/ }
  // "%%": "%",
}) as Record<string, DatePartFormatter>;

const TIMEZONE_RE = /^[a-zA-Z_]+\/[a-zA-Z_]+$/;

/**
 * Parse and return the timezone string as a number
 * @param tzstr Timezone string matching '+/-hh[:][mm]' or Olson name.
 */
export function parseTimezone(tzstr?: string): number {
  if (isNil(tzstr)) return 0;

  if (TIMEZONE_RE.test(tzstr)) {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tzstr }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
  }

  const m = DATE_SYM_TABLE["%z"].re.exec(tzstr);
  if (!m) {
    throw new MingoError(`Timezone '${tzstr}' is invalid or not supported`);
  }

  const hr = parseInt(m[2]) || 0;
  const min = parseInt(m[3]) || 0;

  return (Math.abs(hr * MINUTES_PER_HOUR) + min) * (hr < 0 ? -1 : 1);
}

/**
 * Formats the timezone for output
 * @param tz A timezone object
 */
export function formatTimezone(minuteOffset: number): string {
  return (
    (minuteOffset < 0 ? "-" : "+") +
    padDigits(Math.abs(Math.floor(minuteOffset / MINUTES_PER_HOUR)), 2) +
    padDigits(Math.abs(minuteOffset) % MINUTES_PER_HOUR, 2)
  );
}

/**
 * Adjust the date by the given timezone
 * @param d Date object
 * @param minuteOffset number
 */
export function adjustDate(d: Date, minuteOffset: number): void {
  d.setUTCMinutes(d.getUTCMinutes() + minuteOffset);
}

/**
 * Computes a date expression
 * @param obj The target object
 * @param expr Any value that resolves to a valid date expression. Valid expressions include a number, Date, or Object{date: number|Date, timezone?: string}
 */
export function computeDate(obj: Any, expr: Any, options: Options): Date {
  if (isDate(obj)) return obj;

  const d = computeValue(obj, expr, null, options) as
    | Date
    | number
    | { date: Date | number; timezone?: string };

  if (isDate(d)) return new Date(d);
  // timestamp is in seconds
  if (isNumber(d)) return new Date(d * 1000);

  if (d.date) {
    const date = isDate(d.date) ? new Date(d.date) : new Date(d.date * 1000);

    if (d.timezone) {
      adjustDate(date, parseTimezone(d.timezone));
    }

    return date;
  }

  throw Error(`cannot convert ${JSON.stringify(expr)} to date`);
}

export function padDigits(n: number, digits: number): string {
  return (
    new Array(Math.max(digits - String(n).length + 1, 0)).join("0") +
    n.toString()
  );
}

/**
 * Determines a number of leap years in a year range (leap year reference point; 'year'].
 *
 * See {@link https://github.com/mongodb/mongo/blob/master/src/mongo/db/query/datetime/date_time_support.cpp#L749}
 */
const leapYearsSinceReferencePoint = (year: number): number => {
  // leapYearsSinceReferencePoint
  // Count a number of leap years that happened since the reference point, where a leap year is
  // when year%4==0, excluding years when year%100==0, except when year%400==0.
  const yearsSinceReferencePoint = year - LEAP_YEAR_REF_POINT;
  return (
    Math.trunc(yearsSinceReferencePoint / 4) -
    Math.trunc(yearsSinceReferencePoint / 100) +
    Math.trunc(yearsSinceReferencePoint / 400)
  );
};

/**
 * Sums the number of days in the Gregorian calendar in years: 'startYear',
 * 'startYear'+1, .., 'endYear'-1. 'startYear' and 'endYear' are expected to be from the range
 * (-1000'000'000; +1000'000'000).
 *
 * See {@link https://github.com/mongodb/mongo/blob/master/src/mongo/db/query/datetime/date_time_support.cpp#L762}
 */
export function daysBetweenYears(startYear: number, endYear: number): number {
  return Math.trunc(
    leapYearsSinceReferencePoint(endYear - 1) -
      leapYearsSinceReferencePoint(startYear - 1) +
      (endYear - startYear) * DAYS_IN_YEAR[0]
  );
}

export const dateDiffYear = (start: Date, end: Date): number =>
  end.getUTCFullYear() - start.getUTCFullYear();

export const dateDiffMonth = (start: Date, end: Date): number =>
  end.getUTCMonth() - start.getUTCMonth() + dateDiffYear(start, end) * 12;

export const dateDiffQuarter = (start: Date, end: Date): number => {
  const a = Math.trunc(start.getUTCMonth() / 3);
  const b = Math.trunc(end.getUTCMonth() / 3);
  return b - a + dateDiffYear(start, end) * 4;
};

export const dateDiffDay = (start: Date, end: Date): number =>
  dayOfYear(end) -
  dayOfYear(start) +
  daysBetweenYears(start.getUTCFullYear(), end.getUTCFullYear());

export const dateDiffWeek = (
  start: Date,
  end: Date,
  startOfWeek?: DayOfWeek
): number => {
  const wk = (startOfWeek || "sun").substring(0, 3) as DayOfWeek;
  return Math.trunc(
    (dateDiffDay(start, end) + isoWeekday(start, wk) - isoWeekday(end, wk)) /
      DAYS_PER_WEEK
  );
};

export const dateDiffHour = (start: Date, end: Date): number =>
  end.getUTCHours() - start.getUTCHours() + dateDiffDay(start, end) * 24;

const addMonth = (d: Date, amount: number): void => {
  // months start from 0 to 11.
  const m = d.getUTCMonth() + amount;
  const yearOffset = Math.floor(m / 12);
  if (m < 0) {
    const month = (m % 12) + 12;
    d.setUTCFullYear(d.getUTCFullYear() + yearOffset, month, d.getUTCDate());
  } else {
    d.setUTCFullYear(d.getUTCFullYear() + yearOffset, m % 12, d.getUTCDate());
  }
};

export const dateAdd = (
  date: Date,
  unit: TimeUnit,
  amount: number,
  _timezone?: string
): Date => {
  const d = new Date(date);
  switch (unit) {
    case "year":
      d.setUTCFullYear(d.getUTCFullYear() + amount);
      break;
    case "quarter":
      addMonth(d, 3 * amount);
      break;
    case "month":
      addMonth(d, amount);
      break;
    default:
      d.setTime(d.getTime() + TIMEUNIT_IN_MILLIS[unit] * amount);
  }

  return d;
};
