import { CALENDAR_DATA, FIRST_DAY_OF_MONTH } from "./calendar-data.js";
import { NepaliDate } from "./nepali-date.js";

/** A BS date in zero-padded "YYYY-MM-DD" form, e.g. "2083-03-22". */
export type BsDateString = string;

export interface BsMonthData {
  /** Number of days in the month, or undefined when the year is outside the calendar table. */
  totalDays: number | undefined;
  /** Weekday of the 1st of the month (0 = Sunday), or undefined when the year is out of range. */
  startDay: number | undefined;
}

/**
 * Splits a "YYYY-MM-DD" string into `[year, month, day]` numbers (month 1-indexed).
 *
 * Does **not** validate — parts may be `NaN` for malformed input; guard with
 * {@link isValidDateString} first when the source is user-typed.
 *
 * @example
 * parseDateString("2081-03-05") // → [2081, 3, 5]
 */
export const parseDateString = (dateString: string): [number, number, number] => {
  const [year, month, day] = dateString.split("-").map((part) => parseInt(part, 10));
  return [year, month, day];
};

/**
 * Returns `true` when year/month/day name a real day in the BS calendar table (month 1-indexed).
 *
 * @example
 * isValidDate(2081, 2, 32) // → true  (Jestha 2081 has 32 days)
 * isValidDate(2081, 2, 33) // → false
 */
export const isValidDate = (year: number, month: number, day: number): boolean => {
  if (!year || !month || !day) return false;
  const months = CALENDAR_DATA[year];
  return Boolean(months) && month >= 1 && month <= 12 && day >= 1 && day <= months[month - 1];
};

/**
 * Returns `true` when the string is strictly zero-padded "YYYY-MM-DD" **and**
 * names a real BS day in the calendar table.
 *
 * @example
 * isValidDateString("2081-02-32") // → true
 * isValidDateString("2081-2-05")  // → false (not zero-padded)
 * isValidDateString("2081-02-33") // → false
 */
export const isValidDateString = (dateString: string): boolean => {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const [year, month, day] = parseDateString(dateString);
  return isValidDate(year, month, day);
};

/**
 * Formats BS date parts (month 1-indexed) as a zero-padded "YYYY-MM-DD" string.
 *
 * @example
 * formatDate(2081, 3, 5) // → "2081-03-05"
 */
export const formatDate = (year: number, month: number, day: number): BsDateString =>
  `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

/**
 * Compare two parsed BS dates: negative when a < b, 0 when equal, positive when a > b.
 */
const compare = (a: [number, number, number], b: [number, number, number]): number =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * Returns `true` when `date` falls inside `[startDate, endDate]`, **both bounds inclusive**.
 * A missing or malformed bound means "unbounded on that side"; a malformed `date` is never in range.
 *
 * @example
 * isBetween("2081-03-15", "2081-03-15", "2081-03-20") // → true
 */
export const isBetween = (date: BsDateString, startDate?: BsDateString, endDate?: BsDateString): boolean => {
  if (!isValidDateString(date)) return false;
  const target = parseDateString(date);
  if (startDate && isValidDateString(startDate) && compare(target, parseDateString(startDate)) < 0) return false;
  if (endDate && isValidDateString(endDate) && compare(target, parseDateString(endDate)) > 0) return false;
  return true;
};

/**
 * Month length + starting weekday for one BS month (month 1-indexed).
 * Both fields are `undefined` outside the calendar table's year range.
 *
 * @example
 * getMonthData(2081, 1) // → { totalDays: 31, startDay: 6 }
 */
export const getMonthData = (year: number, month: number): BsMonthData => ({
  totalDays: CALENDAR_DATA[year] ? CALENDAR_DATA[year][month - 1] : undefined,
  startDay: FIRST_DAY_OF_MONTH[year] ? FIRST_DAY_OF_MONTH[year][month - 1] : undefined,
});

/**
 * Today's BS date as "YYYY-MM-DD" (device clock, local time).
 */
export const getTodayBs = (): BsDateString => {
  const today = new NepaliDate();
  return formatDate(today.getYear(), today.getMonth() + 1, today.getDate());
};
