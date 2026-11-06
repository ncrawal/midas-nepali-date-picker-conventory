import {
  AD_EPOCH_UTC,
  BS_EPOCH_YEAR,
  CALENDAR_DATA,
  DAYS_BEFORE_YEAR,
  EPOCH_DAY_OF_WEEK,
  FIRST_DAY_OF_MONTH,
  LOCALE,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  TOTAL_BS_DAYS,
} from "./calendar-data.js";

export { FIRST_DAY_OF_MONTH, MAX_BS_YEAR, MIN_BS_YEAR };

const MS_PER_DAY = 86_400_000;

/** A BS date as plain numeric parts — what {@link adToBs} returns. */
export interface BsDateParts {
  /** BS year, e.g. 2081. */
  year: number;
  /** 1-indexed month (1 = Baishakh). */
  month: number;
  /** Day of month, 1-indexed. */
  day: number;
}

function minSerial(): number {
  return DAYS_BEFORE_YEAR[MIN_BS_YEAR] ?? 0;
}

function rangeError(detail: string): Error {
  const maxDay = CALENDAR_DATA[MAX_BS_YEAR]?.[11] ?? 30;
  return new Error(
    `NepaliDate: ${detail} — supported range is BS ${MIN_BS_YEAR}-01-01 to ${MAX_BS_YEAR}-12-${maxDay} (use registerBsYear / registerBsYears to extend future years)`,
  );
}

/** Serial = whole days since BS 1970-01-01. Accepts out-of-range month/day and normalizes JS-Date-style. */
function bsToSerial(year: number, month0: number, day: number): number {
  year += Math.floor(month0 / 12);
  month0 = ((month0 % 12) + 12) % 12;
  const yearMonths = CALENDAR_DATA[year];
  if (!yearMonths) throw rangeError(`BS year ${year} is out of range`);

  let serial = DAYS_BEFORE_YEAR[year];
  for (let m = 0; m < month0; m++) {
    serial += yearMonths[m];
  }
  serial += day - 1;

  if (serial < minSerial() || serial >= TOTAL_BS_DAYS) {
    throw rangeError(`BS ${year}-${month0 + 1}-${day} is out of range`);
  }
  return serial;
}

/** O(1) conversion from serial day offset back to BS `{ year, month, day }`. */
function serialToBs(serial: number): BsDateParts {
  if (serial < minSerial() || serial >= TOTAL_BS_DAYS) {
    throw rangeError(`day offset ${serial} is out of range`);
  }
  let year = Math.min(
    MAX_BS_YEAR,
    Math.max(MIN_BS_YEAR, BS_EPOCH_YEAR + Math.floor(serial / 365.25)),
  );
  while (year > MIN_BS_YEAR && serial < DAYS_BEFORE_YEAR[year]) year--;
  while (year < MAX_BS_YEAR && serial >= DAYS_BEFORE_YEAR[year + 1]) year++;

  let rest = serial - DAYS_BEFORE_YEAR[year];
  let month0 = 0;
  const yearMonths = CALENDAR_DATA[year];
  while (month0 < 11 && rest >= yearMonths[month0]) {
    rest -= yearMonths[month0];
    month0++;
  }
  return {
    year,
    month: month0 + 1,
    day: rest + 1,
  };
}

function adToSerial(adYear: number, adMonth0: number, adDay: number): number {
  const serial = Math.round((Date.UTC(adYear, adMonth0, adDay) - AD_EPOCH_UTC) / MS_PER_DAY);
  if (serial < minSerial() || serial >= TOTAL_BS_DAYS) {
    throw rangeError(`AD ${adYear}-${adMonth0 + 1}-${adDay} is out of range`);
  }
  return serial;
}

/**
 * Converts a BS date (month **1-indexed**) to an AD `Date` at local midnight.
 * Throws when the date is outside the registered BS calendar table.
 *
 * @example
 * bsToAd(2081, 1, 1) // → Date: Sat Apr 13 2024 (BS new year 2081)
 */
export function bsToAd(year: number, month: number, day: number): Date {
  const d = new Date(AD_EPOCH_UTC + bsToSerial(year, month - 1, day) * MS_PER_DAY);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Converts an AD `Date` (read in local time) to BS parts (month **1-indexed**).
 * Throws when the date falls outside the registered BS calendar table.
 *
 * @example
 * adToBs(new Date(2024, 3, 13)) // → { year: 2081, month: 1, day: 1 }
 */
export function adToBs(date: Date): BsDateParts {
  return serialToBs(adToSerial(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * High-performance Bikram Sambat (BS) date class backed by `CALENDAR_DATA`.
 * Drop-in replacement for `nepali-date-converter` default export.
 *
 * `getMonth()` is **0-indexed** (0 = Baishakh), matching JavaScript `Date`.
 * Constructor accepts `()`, `(Date)`, `(NepaliDate)`, or `(bsYear, bsMonth0, bsDay)`
 * with JS-Date-style day/month rollover.
 *
 * @example
 * const d = new NepaliDate(2081, 0, 15);    // BS 2081 Baishakh 15 (month is 0-indexed)
 * d.format("YYYY-MM-DD");                   // → "2081-01-15"
 * new NepaliDate();                         // today in BS
 * NepaliDate.fromAD(new Date(2024, 3, 13)); // → BS 2081-01-01
 */
export class NepaliDate {
  private serial: number;
  private parts: BsDateParts;

  constructor(yearOrSource?: number | Date | NepaliDate, month0?: number, day?: number) {
    if (yearOrSource instanceof NepaliDate) {
      this.serial = yearOrSource.serial;
    } else if (yearOrSource instanceof Date) {
      this.serial = adToSerial(
        yearOrSource.getFullYear(),
        yearOrSource.getMonth(),
        yearOrSource.getDate(),
      );
    } else if (typeof yearOrSource === "number") {
      this.serial = bsToSerial(yearOrSource, month0 ?? 0, day ?? 1);
    } else {
      const now = new Date();
      this.serial = adToSerial(now.getFullYear(), now.getMonth(), now.getDate());
    }
    this.parts = serialToBs(this.serial);
  }

  /**
   * Builds a `NepaliDate` from an AD `Date` (read in local time).
   *
   * @example
   * NepaliDate.fromAD(new Date(2024, 3, 13)) // → BS 2081-01-01
   */
  static fromAD(date: Date): NepaliDate {
    return new NepaliDate(date);
  }

  /** BS year, e.g. 2081. */
  getYear(): number {
    return this.parts.year;
  }

  /**
   * BS month, **0-indexed** (0 = Baishakh, 11 = Chaitra).
   *
   * @example
   * new NepaliDate(2081, 0, 15).getMonth() // → 0 (Baishakh)
   */
  getMonth(): number {
    return this.parts.month - 1;
  }

  /** Day of month, 1-indexed. */
  getDate(): number {
    return this.parts.day;
  }

  /**
   * Weekday, 0 = Sunday .. 6 = Saturday.
   *
   * @example
   * new NepaliDate(2081, 0, 1).getDay() // → 6 (Saturday)
   */
  getDay(): number {
    return (((EPOCH_DAY_OF_WEEK + this.serial) % 7) + 7) % 7;
  }

  /**
   * Sets the BS year, keeping month and day (mutates in place).
   */
  setYear(year: number): void {
    this.reset(year, this.parts.month - 1, this.parts.day);
  }

  /**
   * Sets the BS month (**0-indexed**, mutates in place) with JS-Date-style rollover.
   */
  setMonth(month0: number): void {
    this.reset(this.parts.year, month0, this.parts.day);
  }

  /**
   * Sets the day of month (mutates in place) with JS-Date-style rollover.
   */
  setDate(day: number): void {
    this.reset(this.parts.year, this.parts.month - 1, day);
  }

  /**
   * Returns the AD equivalent as a JS `Date` at local midnight.
   */
  toJsDate(): Date {
    const d = new Date(AD_EPOCH_UTC + this.serial * MS_PER_DAY);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  /**
   * Formats with dayjs-style tokens: `YYYY`, `YY`, `MMMM`, `MMM`, `MM`, `M`, `DD`, `D`, `dddd`, `ddd`, `dd`, `d`.
   * Pass `language = "np"` for Devanagari digits and Nepali month/weekday names.
   */
  format(pattern: string, language: keyof typeof LOCALE = "en"): string {
    const loc = LOCALE[language];
    const num = (value: number, pad: number) =>
      String(value)
        .padStart(pad, "0")
        .replace(/\d/g, (ch) => loc.digits[Number(ch)]);

    return pattern.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d/g, (token) => {
      switch (token) {
        case "YYYY":
          return num(this.parts.year, 4);
        case "YY":
          return num(this.parts.year % 100, 2);
        case "MMMM":
          return loc.monthLong[this.parts.month - 1];
        case "MMM":
          return loc.monthShort[this.parts.month - 1];
        case "MM":
          return num(this.parts.month, 2);
        case "M":
          return num(this.parts.month, 1);
        case "DD":
          return num(this.parts.day, 2);
        case "D":
          return num(this.parts.day, 1);
        case "dddd":
          return loc.dayLong[this.getDay()];
        case "ddd":
        case "dd":
          return loc.dayShort[this.getDay()];
        default:
          return num(this.getDay(), 1);
      }
    });
  }

  /**
   * Zero-padded `"YYYY-MM-DD"` string.
   */
  toString(): string {
    return this.format("YYYY-MM-DD");
  }

  private reset(year: number, month0: number, day: number): void {
    this.serial = bsToSerial(year, month0, day);
    this.parts = serialToBs(this.serial);
  }
}
