import {
   BsDateString,
  formatDate,
  isValidDate,
  isValidDateString,
  parseDateString,
} from "./bs-string.js";
import { CALENDAR_DATA, LOCALE } from "./calendar-data.js";
import { NepaliDate, adToBs, bsToAd } from "./nepali-date.js";

const MS_PER_DAY = 86_400_000;

/**
 * Returns `true` when two BS dates represent the same calendar day.
 */
export function isSameDay(a: NepaliDate, b: NepaliDate): boolean {
  return a.getYear() === b.getYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Returns `true` when two BS dates fall in the same year and month.
 */
export function isSameMonth(a: NepaliDate, b: NepaliDate): boolean {
  return a.getYear() === b.getYear() && a.getMonth() === b.getMonth();
}

/**
 * Returns `true` when `a` is strictly earlier than `b`.
 */
export function isBefore(a: NepaliDate, b: NepaliDate): boolean {
  if (a.getYear() !== b.getYear()) return a.getYear() < b.getYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() < b.getMonth();
  return a.getDate() < b.getDate();
}

/**
 * Returns `true` when `a` is strictly later than `b`.
 */
export function isAfter(a: NepaliDate, b: NepaliDate): boolean {
  return isBefore(b, a);
}

/**
 * Returns a new `NepaliDate` offset by `n` days (negative moves backwards). O(1).
 */
export function addDays(date: NepaliDate, n: number): NepaliDate {
  return new NepaliDate(date.getYear(), date.getMonth(), date.getDate() + n);
}

/**
 * Returns a new `NepaliDate` offset by `n` months (negative moves backwards),
 * clamping the day to the target month's length when needed.
 */
export function addMonths(date: NepaliDate, n: number): NepaliDate {
  const total = date.getMonth() + n;
  const year = date.getYear() + Math.floor(total / 12);
  const month0 = ((total % 12) + 12) % 12;
  const monthLength = CALENDAR_DATA[year]?.[month0];
  if (monthLength === undefined) return new NepaliDate(year, month0, 1);
  return new NepaliDate(year, month0, Math.min(date.getDate(), monthLength));
}

/**
 * Returns the Sunday beginning the week containing `date` (Nepali week starts on Sunday / Aaitabar).
 */
export function startOfWeek(date: NepaliDate): NepaliDate {
  return addDays(date, -date.getDay());
}

/**
 * Returns the Saturday ending the week containing `date`.
 */
export function endOfWeek(date: NepaliDate): NepaliDate {
  return addDays(date, 6 - date.getDay());
}

/**
 * Absolute number of days between two BS dates (order doesn't matter). O(1).
 */
export function daysBetween(a: NepaliDate, b: NepaliDate): number {
  return Math.abs(Math.round((a.toJsDate().getTime() - b.toJsDate().getTime()) / MS_PER_DAY));
}

/**
 * Parses a BS date string into a `NepaliDate`, tolerating unpadded parts and
 * `-`, `/` or space separators. Also accepts Devanagari digits (e.g. `"२०८१-०३-०५"`).
 * Returns `null` for anything that doesn't name a real BS day.
 *
 * @example
 * parseNepaliDate("2081-03-05") // → NepaliDate for BS 2081-03-05
 * parseNepaliDate("2081/3/5")   // → NepaliDate for BS 2081-03-05
 * parseNepaliDate("२०८१-०३-०५") // → NepaliDate for BS 2081-03-05
 * parseNepaliDate("2081-02-33") // → null
 */
export function parseNepaliDate(text: string): NepaliDate | null {
  if (typeof text !== "string") return null;
  const normalized = toEnglishNumerals(text).trim();
  const parts = normalized.split(/[-/\s]+/);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  return isValidDate(year, month, day) ? new NepaliDate(year, month - 1, day) : null;
}

/**
 * Converts an AD `Date` straight to a zero-padded BS "YYYY-MM-DD" string.
 *
 * @example
 * adToBsString(new Date(2024, 3, 13)) // → "2081-01-01"
 */
export function adToBsString(adDate: Date): BsDateString {
  const { year, month, day } = adToBs(adDate);
  return formatDate(year, month, day);
}

/**
 * Converts a BS "YYYY-MM-DD" string straight to a zero-padded AD "YYYY-MM-DD" string.
 * Returns `null` when the input isn't a valid BS date.
 *
 * @example
 * bsToAdString("2081-01-01") // → "2024-04-13"
 * bsToAdString("2081-02-33") // → null
 */
export function bsToAdString(bsDate: BsDateString): string | null {
  if (!isValidDateString(bsDate)) return null;
  const [year, month, day] = parseDateString(bsDate);
  const ad = bsToAd(year, month, day);
  return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, "0")}-${String(ad.getDate()).padStart(2, "0")}`;
}

/**
 * Converts ASCII digits in a number or string to Devanagari numerals.
 * Non-digit characters pass through unchanged.
 *
 * @example
 * toNepaliNumerals(2082)         // → "२०८२"
 * toNepaliNumerals("2081-01-15") // → "२०८१-०१-१५"
 */
export function toNepaliNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => LOCALE.np.digits[Number(digit)]);
}

/**
 * Converts Devanagari numerals in a string back to ASCII digits.
 * Non-numeral characters pass through unchanged.
 *
 * @example
 * toEnglishNumerals("२०८२")      // → "2082"
 * toEnglishNumerals("मिति २०८१") // → "मिति 2081"
 */
export function toEnglishNumerals(text: string): string {
  return String(text).replace(/[०-९]/g, (numeral) =>
    String((LOCALE.np.digits as readonly string[]).indexOf(numeral)),
  );
}
