/**
 * Bikram Sambat GenerateConfig for antd's `generatePicker` (rc-picker engine).
 *
 * Uses dynamic `getMinBsYear()` and `getMaxBsYear()` bounds from `CALENDAR_DATA`,
 * so any future BS years added at runtime via `registerBsYear` / `registerBsYears`
 * immediately become selectable in `BsDatePicker` and `NewNepaliDatePicker`.
 */
import type { GenerateConfig } from "rc-picker/es/generate";
import {
  CALENDAR_DATA,
  NEPALI_DAYS,
  NEPALI_MONTHS,
  NepaliDate,
  getMaxBsYear,
  getMinBsYear,
  isValidDate,
  parseNepaliDate,
} from "../date-utils/index.js";

/** Days in a BS month (0-indexed), or undefined outside the calendar table. */
const daysInMonth = (year: number, month0: number): number | undefined =>
  CALENDAR_DATA[year]?.[month0];

const minDate = (): NepaliDate => new NepaliDate(getMinBsYear(), 0, 1);
const maxDate = (): NepaliDate => {
  const maxY = getMaxBsYear();
  return new NepaliDate(maxY, 11, daysInMonth(maxY, 11) ?? 30);
};

/**
 * Build a date from parts, normalizing month overflow into the year, then
 * clamping the year into the active calendar table and the day into the target month.
 */
const makeClamped = (year: number, month0: number, day: number): NepaliDate => {
  year += Math.floor(month0 / 12);
  month0 = ((month0 % 12) + 12) % 12;
  const minY = getMinBsYear();
  const maxY = getMaxBsYear();
  if (year < minY) return minDate();
  if (year > maxY) return maxDate();
  const len = daysInMonth(year, month0) ?? 30;
  return new NepaliDate(year, month0, Math.min(Math.max(day, 1), len));
};

/** Comparable scalar for a date-only value (ms of its AD local midnight). */
const serialOf = (d: NepaliDate): number => d.toJsDate().getTime();

/**
 * The Bikram Sambat date-operations plugin for antd's picker engine.
 *
 * Feed it to `generatePicker` or `generateCalendar` to create BS-aware antd
 * components beyond the shipped `BsDatePicker`.
 */
export const bsGenerateConfig: GenerateConfig<NepaliDate> = {
  getNow: () => new NepaliDate(),
  getFixedDate: (str) => {
    const [y = getMinBsYear(), m = 1, d = 1] = str.split("-").map((p) => parseInt(p, 10));
    return makeClamped(y, m - 1, d);
  },
  getEndDate: (v) => makeClamped(v.getYear(), v.getMonth(), 32),

  getWeekDay: (v) => v.getDay(),
  getYear: (v) => v.getYear(),
  getMonth: (v) => v.getMonth(),
  getDate: (v) => v.getDate(),
  getHour: () => 0,
  getMinute: () => 0,
  getSecond: () => 0,
  getMillisecond: () => 0,

  addYear: (v, diff) => makeClamped(v.getYear() + diff, v.getMonth(), v.getDate()),
  addMonth: (v, diff) => makeClamped(v.getYear(), v.getMonth() + diff, v.getDate()),
  addDate: (v, diff) => {
    try {
      return new NepaliDate(v.getYear(), v.getMonth(), v.getDate() + diff);
    } catch {
      return diff > 0 ? maxDate() : minDate();
    }
  },
  setYear: (v, year) => makeClamped(year, v.getMonth(), v.getDate()),
  setMonth: (v, month0) => makeClamped(v.getYear(), month0, v.getDate()),
  setDate: (v, day) => makeClamped(v.getYear(), v.getMonth(), day),
  setHour: (v) => new NepaliDate(v),
  setMinute: (v) => new NepaliDate(v),
  setSecond: (v) => new NepaliDate(v),
  setMillisecond: (v) => new NepaliDate(v),

  isAfter: (a, b) => serialOf(a) > serialOf(b),
  isValidate: (v) => isValidDate(v.getYear(), v.getMonth() + 1, v.getDate()),

  locale: {
    getWeekFirstDay: () => 0,
    getWeekFirstDate: (_locale, v) => bsGenerateConfig.addDate(v, -v.getDay()),
    getWeek: (_locale, v) => {
      const newYear = new NepaliDate(v.getYear(), 0, 1);
      const dayOfYear = Math.round((serialOf(v) - serialOf(newYear)) / 86_400_000);
      return Math.floor((dayOfYear + newYear.getDay()) / 7) + 1;
    },
    format: (_locale, v, format) => v.format(format),
    parse: (_locale, text) => parseNepaliDate(text),
    getShortWeekDays: () => NEPALI_DAYS,
    getShortMonths: () => NEPALI_MONTHS,
  },
};
