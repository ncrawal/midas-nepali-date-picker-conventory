/**
 * Bikram Sambat (BS) month-length table — the single source of truth for all
 * BS↔AD conversion, plus runtime registration for future BS years.
 *
 * Row format: 12 month lengths followed by the year total (13 numbers).
 *
 * Built-in coverage: BS 1970–2099 (AD 1913–2043).
 * Anchor: BS 1970-01-01 = AD 1913-04-13 (Sunday, weekday 0).
 *
 * Because the official Nepali calendar (Panchanga Nirnayak Samiti) is only
 * published 1–2 years ahead, you can update projected years or add future
 * years (e.g. BS 2100+) at runtime without rebuilding the library using
 * {@link registerBsYear} or {@link registerBsYears}.
 */

export const BS_EPOCH_YEAR = 1970;
export const AD_EPOCH_UTC = Date.UTC(1913, 3, 13);
export const EPOCH_DAY_OF_WEEK = 0;

/** 12 BS month lengths `[Baishakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra]`. */
export type BsMonthLengths =
  | readonly [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
  | readonly number[];

/** 13-element BS calendar table row: 12 month lengths followed by the year total. */
export type BsYearRow =
  | readonly [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
  | readonly number[];

/** Supported BS year range `{ minYear, maxYear }`. */
export interface BsYearRange {
  minYear: number;
  maxYear: number;
}

/** Supported locale language codes (`"en"` for English, `"np"` for Nepali/Devanagari). */
export type NepaliLanguage = "en" | "np";

const DEFAULT_CALENDAR_DATA: Readonly<Record<number, readonly number[]>> = {
  1970: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1971: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30, 365],
  1972: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  1973: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  1974: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1975: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  1976: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  1977: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365],
  1978: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1979: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  1980: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  1981: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  1982: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1983: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  1984: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  1985: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  1986: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1987: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  1988: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  1989: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1990: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1991: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  1992: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  1993: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1994: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1995: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  1996: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  1997: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1998: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  1999: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30, 365],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30, 365],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 365],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31, 365],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31, 365],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30, 365],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30, 365],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31, 366],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30, 365],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31, 366],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30, 365],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30, 366],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30, 366],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30, 365],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30, 366],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30, 365],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30, 366],
  2096: [30, 31, 32, 32, 31, 30, 30, 30, 30, 29, 30, 30, 365],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30, 366],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31, 365],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30, 365],
};

/**
 * Active Bikram Sambat (BS) month-length table `{ [bsYear]: [m1..m12, yearTotal] }`.
 * Can be extended or updated at runtime via {@link registerBsYear} or {@link registerBsYears}.
 */
export const CALENDAR_DATA: Record<number, number[]> = {};

/** First BS year with calendar data (inclusive). */
export let MIN_BS_YEAR = BS_EPOCH_YEAR;

/** Last BS year with calendar data (inclusive). Updates dynamically when future years are registered. */
export let MAX_BS_YEAR = 2099;

/** Cumulative day offset before the 1st of Baishakh of each BS year (relative to BS 1970-01-01 = 0). */
export const DAYS_BEFORE_YEAR: Record<number, number> = {};

/** Total number of BS days across all registered years in `CALENDAR_DATA`. */
export let TOTAL_BS_DAYS = 0;

/**
 * Weekday of the 1st of every BS month (0 = Sunday), as `{ [bsYear]: number[12] }`.
 * Precomputed from `CALENDAR_DATA` and automatically updated when new years are registered.
 */
export const FIRST_DAY_OF_MONTH: Record<number, number[]> = {};

/**
 * Validates a 12-month (or 13-element with year sum) BS year array and returns a normalized
 * 13-element array `[m1, m2, ..., m12, yearTotal]`.
 */
function normalizeYearMonths(year: number, monthLengths: readonly number[]): number[] {
  if (!Number.isInteger(year) || year < 1900 || year > 2500) {
    throw new Error(`Invalid BS year "${year}": must be an integer between 1900 and 2500.`);
  }
  if (!Array.isArray(monthLengths) || (monthLengths.length !== 12 && monthLengths.length !== 13)) {
    throw new Error(
      `Invalid month lengths for BS year ${year}: expected an array of 12 month lengths (or 13 including total), received length ${
        (monthLengths as unknown[])?.length
      }.`,
    );
  }
  let sum = 0;
  const normalized: number[] = [];
  for (let m = 0; m < 12; m++) {
    const days = monthLengths[m];
    if (!Number.isInteger(days) || days < 28 || days > 33) {
      throw new Error(
        `Invalid month length for BS year ${year} month ${m + 1}: expected integer between 28 and 33, got ${days}.`,
      );
    }
    normalized.push(days);
    sum += days;
  }
  if (monthLengths.length === 13 && monthLengths[12] !== sum) {
    throw new Error(
      `Invalid year total for BS year ${year}: 13th element (${monthLengths[12]}) does not match sum of 12 months (${sum}).`,
    );
  }
  normalized.push(sum);
  return normalized;
}

/**
 * Rebuilds `MIN_BS_YEAR`, `MAX_BS_YEAR`, `DAYS_BEFORE_YEAR`, `FIRST_DAY_OF_MONTH`,
 * and `TOTAL_BS_DAYS` from `CALENDAR_DATA`.
 */
function recomputeCalendarTables(): void {
  const years = Object.keys(CALENDAR_DATA)
    .map(Number)
    .sort((a, b) => a - b);

  if (years.length === 0) return;

  const minY = years[0];
  const maxY = years[years.length - 1];

  // Ensure contiguous year coverage
  for (let y = minY; y <= maxY; y++) {
    if (!CALENDAR_DATA[y]) {
      throw new Error(
        `BS calendar table has a gap at year ${y}. Years must be contiguous from ${minY} to ${maxY}.`,
      );
    }
  }

  MIN_BS_YEAR = minY;
  MAX_BS_YEAR = maxY;

  // Clear old keys if years were removed on reset
  for (const key of Object.keys(DAYS_BEFORE_YEAR)) {
    const numKey = Number(key);
    if (numKey < minY || numKey > maxY) {
      delete DAYS_BEFORE_YEAR[numKey];
      delete FIRST_DAY_OF_MONTH[numKey];
    }
  }

  // Note: Anchor is BS_EPOCH_YEAR (1970) = serial 0.
  // If years >= 1970, accumulate forward from 1970.
  let acc = 0;
  for (let y = BS_EPOCH_YEAR; y <= maxY; y++) {
    DAYS_BEFORE_YEAR[y] = acc;
    const row = CALENDAR_DATA[y];
    const firstDays: number[] = [];
    for (let m = 0; m < 12; m++) {
      const dow = (((EPOCH_DAY_OF_WEEK + acc) % 7) + 7) % 7;
      firstDays.push(dow);
      acc += row[m];
    }
    FIRST_DAY_OF_MONTH[y] = firstDays;
  }
  TOTAL_BS_DAYS = acc;

  // If any years before BS_EPOCH_YEAR (1970) were registered, accumulate backward from 1970
  let backAcc = 0;
  for (let y = BS_EPOCH_YEAR - 1; y >= minY; y--) {
    const row = CALENDAR_DATA[y];
    const yearTotal = row[12];
    backAcc -= yearTotal;
    DAYS_BEFORE_YEAR[y] = backAcc;
    let mAcc = backAcc;
    const firstDays: number[] = [];
    for (let m = 0; m < 12; m++) {
      const dow = (((EPOCH_DAY_OF_WEEK + mAcc) % 7) + 7) % 7;
      firstDays.push(dow);
      mAcc += row[m];
    }
    FIRST_DAY_OF_MONTH[y] = firstDays;
  }
}

/**
 * Restores `CALENDAR_DATA` to the built-in default BS 1970–2099 table and
 * recomputes all lookup tables.
 */
export function resetCalendarData(): void {
  for (const key of Object.keys(CALENDAR_DATA)) {
    delete CALENDAR_DATA[Number(key)];
  }
  for (const [yearStr, months] of Object.entries(DEFAULT_CALENDAR_DATA)) {
    CALENDAR_DATA[Number(yearStr)] = [...months];
  }
  recomputeCalendarTables();
}

// Initialize on module load
resetCalendarData();

/**
 * Registers or updates a single BS year's month lengths at runtime and
 * immediately updates all conversion and datepicker lookup tables.
 *
 * Since Nepal's official calendar is only published 1–2 years in advance,
 * use this function to override a projected year (e.g. `2085`) with official
 * data or append future BS years (e.g. `2100`, `2101`) without rebuilding the package.
 *
 * @param year - BS year (must update an existing year or extend the current range contiguously)
 * @param monthLengths - Array of 12 month lengths `[Baishakh, Jestha, ..., Chaitra]` (each 29–32 days), or 13 elements including the year total
 *
 * @example
 * // Override a projected year or add a new future year (BS 2100)
 * registerBsYear(2100, [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31]);
 */
export function registerBsYear(year: number, monthLengths: BsMonthLengths): void {
  const normalized = normalizeYearMonths(year, monthLengths);
  if (year < MIN_BS_YEAR - 1 || year > MAX_BS_YEAR + 1) {
    throw new Error(
      `Cannot register BS year ${year}: current supported range is ${MIN_BS_YEAR}–${MAX_BS_YEAR}. New years must be contiguous (next year to add is ${MAX_BS_YEAR + 1}).`,
    );
  }
  CALENDAR_DATA[year] = normalized;
  recomputeCalendarTables();
}

/**
 * Registers or updates multiple BS years at once and rebuilds the lookup tables.
 *
 * @param yearsData - Object mapping BS year numbers to their 12 month lengths
 *
 * @example
 * registerBsYears({
 *   2100: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
 *   2101: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
 * });
 */
export function registerBsYears(yearsData: Record<number, BsMonthLengths>): void {
  const entries = Object.entries(yearsData)
    .map(([y, months]) => [Number(y), normalizeYearMonths(Number(y), months)] as const)
    .sort((a, b) => a[0] - b[0]);

  if (entries.length === 0) return;

  // Apply to a shallow clone first so if there is a gap we don't leave partial state
  const backup: Record<number, number[]> = {};
  for (const [k, v] of Object.entries(CALENDAR_DATA)) {
    backup[Number(k)] = v;
  }

  try {
    for (const [year, normalized] of entries) {
      CALENDAR_DATA[year] = normalized;
    }
    recomputeCalendarTables();
  } catch (err) {
    // Rollback on gap error
    for (const key of Object.keys(CALENDAR_DATA)) {
      delete CALENDAR_DATA[Number(key)];
    }
    for (const [k, v] of Object.entries(backup)) {
      CALENDAR_DATA[Number(k)] = v;
    }
    recomputeCalendarTables();
    throw err;
  }
}

/** Returns the 13-element `[m1..m12, yearTotal]` array for a BS year, or `undefined` if not in table. */
export function getBsYearData(year: number): readonly number[] | undefined {
  return CALENDAR_DATA[year];
}

/** Returns the minimum supported BS year currently in `CALENDAR_DATA`. */
export function getMinBsYear(): number {
  return MIN_BS_YEAR;
}

/** Returns the maximum supported BS year currently in `CALENDAR_DATA`. */
export function getMaxBsYear(): number {
  return MAX_BS_YEAR;
}

/** Returns the current `{ minYear, maxYear }` bounds of `CALENDAR_DATA`. */
export function getSupportedBsYearRange(): BsYearRange {
  return { minYear: MIN_BS_YEAR, maxYear: MAX_BS_YEAR };
}

/** Two-letter weekday labels (0 = Sunday) — what the datepicker grids' header row shows. */
export const NEPALI_DAYS: string[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Romanized BS month names (index 0 = Baishakh) — what the datepicker headers display. */
export const NEPALI_MONTHS: string[] = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

/**
 * Locale tables for `NepaliDate.format()` — month/weekday names and digits per
 * language (`en`, `np`).
 */
export const LOCALE = {
  en: {
    dayShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthShort: ["Bai", "Jes", "Asa", "Shr", "Bhd", "Asw", "Kar", "Man", "Pou", "Mag", "Fal", "Cha"],
    monthLong: [
      "Baisakh",
      "Jestha",
      "Asar",
      "Shrawan",
      "Bhadra",
      "Aswin",
      "Kartik",
      "Mangsir",
      "Poush",
      "Magh",
      "Falgun",
      "Chaitra",
    ],
    digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  np: {
    dayShort: ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"],
    dayLong: ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"],
    monthShort: ["बै", "जे", "अ", "श्रा", "भा", "आ", "का", "मं", "पौ", "मा", "फा", "चै"],
    monthLong: [
      "बैशाख",
      "जेठ",
      "असार",
      "श्रावण",
      "भाद्र",
      "आश्विन",
      "कार्तिक",
      "मंसिर",
      "पौष",
      "माघ",
      "फाल्गुण",
      "चैत्र",
    ],
    digits: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
  },
} as const;

