import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it, afterEach } from "node:test";
import {
  CALENDAR_DATA,
  FIRST_DAY_OF_MONTH,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  NepaliDate,
  adToBs,
  adToBsString,
  addDays,
  addMonths,
  bsToAd,
  bsToAdString,
  daysBetween,
  endOfWeek,
  formatDate,
  getBsYearData,
  getMaxBsYear,
  getMinBsYear,
  getMonthData,
  getSupportedBsYearRange,
  isAfter,
  isBefore,
  isBetween,
  isSameDay,
  isSameMonth,
  isValidDate,
  isValidDateString,
  parseDateString,
  parseNepaliDate,
  registerBsYear,
  registerBsYears,
  resetCalendarData,
  startOfWeek,
  toEnglishNumerals,
  toNepaliNumerals,
} from "../dist/esm/date-utils/index.js";
import { bsGenerateConfig } from "../dist/esm/picker/generateConfig.js";

describe("midas-nepali-date-picker-conventory", () => {
  afterEach(() => {
    resetCalendarData();
  });

  describe("Calendar Table Integrity (1970–2099)", () => {
    it("has contiguous years from 1970 to 2099 with valid 12-month sums", () => {
      assert.equal(getMinBsYear(), 1970);
      assert.equal(getMaxBsYear(), 2099);

      for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
        const row = CALENDAR_DATA[y];
        assert.ok(Array.isArray(row), `Missing year ${y}`);
        assert.equal(row.length, 13, `Year ${y} should have 13 elements`);
        const sum = row.slice(0, 12).reduce((a, b) => a + b, 0);
        assert.equal(row[12], sum, `Year ${y} total mismatch`);
        assert.equal(FIRST_DAY_OF_MONTH[y].length, 12);
      }
    });
  });

  describe("BS <-> AD Conversions & NepaliDate", () => {
    it("converts known anchor dates accurately", () => {
      // Epoch: BS 1970-01-01 = AD 1913-04-13 (Sunday)
      const epochAd = bsToAd(1970, 1, 1);
      assert.equal(epochAd.getFullYear(), 1913);
      assert.equal(epochAd.getMonth(), 3); // April (0-indexed)
      assert.equal(epochAd.getDate(), 13);

      // BS 2081-01-01 = AD 2024-04-13 (Saturday)
      const ny2081 = bsToAd(2081, 1, 1);
      assert.equal(ny2081.getFullYear(), 2024);
      assert.equal(ny2081.getMonth(), 3);
      assert.equal(ny2081.getDate(), 13);

      const bsParts = adToBs(new Date(2024, 3, 13));
      assert.deepEqual(bsParts, { year: 2081, month: 1, day: 1 });
    });

    it("formats English and Devanagari dates and numerals", () => {
      const d = new NepaliDate(2081, 2, 5); // 2081 Ashadh 5
      assert.equal(d.toString(), "2081-03-05");
      assert.equal(d.format("YYYY-MM-DD", "np"), "२०८१-०३-०५");
      assert.equal(toNepaliNumerals("2081-01-15"), "२०८१-०१-१५");
      assert.equal(toEnglishNumerals("२०८१-०१-१५"), "2081-01-15");
      assert.equal(bsToAdString("2081-01-01"), "2024-04-13");
      assert.equal(adToBsString(new Date(2024, 3, 13)), "2081-01-01");
    });

    it("supports arithmetic, comparisons, and string helpers", () => {
      const a = new NepaliDate(2081, 0, 31); // Baishakh 31, 2081
      const b = addDays(a, 1); // Jestha 1, 2081
      assert.equal(b.toString(), "2081-02-01");
      assert.ok(isBefore(a, b));
      assert.ok(isAfter(b, a));
      assert.ok(!isSameDay(a, b));
      assert.ok(!isSameMonth(a, b));
      assert.equal(daysBetween(a, b), 1);

      // Jestha 2081 has 32 days; adding 1 month clamps to Ashadh 31
      const jestha32 = new NepaliDate(2081, 1, 32);
      const ashadhClamped = addMonths(jestha32, 1);
      assert.equal(ashadhClamped.toString(), "2081-03-31");

      // Week helpers
      const wkStart = startOfWeek(new NepaliDate(2081, 0, 5));
      const wkEnd = endOfWeek(new NepaliDate(2081, 0, 5));
      assert.equal(wkStart.getDay(), 0);
      assert.equal(wkEnd.getDay(), 6);

      // String validation and parsing (including Devanagari input)
      assert.ok(isValidDate(2081, 2, 32));
      assert.ok(!isValidDate(2081, 2, 33));
      assert.ok(isValidDateString("2081-02-32"));
      assert.ok(!isValidDateString("2081-2-05"));
      assert.deepEqual(parseDateString("2081-03-05"), [2081, 3, 5]);
      assert.equal(formatDate(2081, 3, 5), "2081-03-05");
      assert.ok(isBetween("2081-03-15", "2081-03-15", "2081-03-20"));
      assert.equal(parseNepaliDate("२०८१-०३-०५")?.toString(), "2081-03-05");
      assert.deepEqual(getMonthData(2081, 1), { totalDays: 31, startDay: 6 });
    });
  });

  describe("Runtime Extensible Future BS Years (registerBsYear / registerBsYears)", () => {
    it("dynamically adds future BS years (e.g. 2100, 2101) and updates picker & conversions", () => {
      assert.equal(getMaxBsYear(), 2099);
      assert.ok(!isValidDate(2100, 1, 1));

      // Register BS 2100 with 12 month lengths (auto-calculates 13th yearTotal = 366)
      registerBsYear(2100, [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31]);

      assert.equal(getMaxBsYear(), 2100);
      assert.deepEqual(getSupportedBsYearRange(), { minYear: 1970, maxYear: 2100 });
      assert.equal(getBsYearData(2100)?.[12], 366);
      assert.ok(isValidDate(2100, 2, 32));

      // Verify seamless continuity across 2099-12-30 -> 2100-01-01
      const lastDay2099 = new NepaliDate(2099, 11, 30);
      const firstDay2100 = addDays(lastDay2099, 1);
      assert.equal(firstDay2100.toString(), "2100-01-01");

      // Round-trip BS <-> AD in 2100
      const ad2100 = bsToAd(2100, 2, 32);
      assert.deepEqual(adToBs(ad2100), { year: 2100, month: 2, day: 32 });

      // Verify bsGenerateConfig uses the new max year (2100)
      const pickerDate = bsGenerateConfig.getFixedDate("2100-02-32");
      assert.equal(pickerDate.toString(), "2100-02-32");
    });

    it("supports batch registration via registerBsYears and overriding projected years", () => {
      registerBsYears({
        2100: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
        2101: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
      });
      assert.equal(getMaxBsYear(), 2101);
      assert.equal(new NepaliDate(2101, 11, 31).toString(), "2101-12-31");

      // Override projected year 2085 with new official calendar data
      registerBsYear(2085, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]);
      assert.equal(getBsYearData(2085)?.[12], 365);
    });

    it("rejects non-contiguous years or invalid month lengths without corrupting state", () => {
      assert.throws(() => {
        registerBsYear(2105, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]);
      }, /Cannot register BS year 2105/);

      assert.throws(() => {
        registerBsYear(2100, [31, 35, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]);
      }, /Invalid month length/);

      assert.equal(getMaxBsYear(), 2099);
    });
  });

  describe("CommonJS & Full Picker Exports Compatibility", () => {
    it("cleanly loads all Picker and Date-Utils exports in CommonJS without ESM/bundler errors", () => {
      const require = createRequire(import.meta.url);
      const cjsBundle = require("../dist/cjs/index.js");

      assert.equal(typeof cjsBundle.NewNepaliDatePicker, "function");
      assert.equal(typeof cjsBundle.NewNepaliRangePicker, "function");
      assert.equal(typeof cjsBundle.BsDatePicker, "object");
      assert.equal(typeof cjsBundle.BsDatePicker.RangePicker, "object");
      assert.equal(typeof cjsBundle.AdDatePicker, "object");
      assert.equal(typeof cjsBundle.NepaliDateConfigProvider, "function");
      assert.equal(typeof cjsBundle.MaskedDateInput, "object");
      assert.equal(typeof cjsBundle.NepaliMaskedDateInput, "object");
      assert.equal(typeof cjsBundle.getRangePresets, "function");
      assert.equal(typeof cjsBundle.registerBsYear, "function");
      assert.equal( typeof cjsBundle.registerBsYears, "function");
      assert.equal(cjsBundle.bsToAdString("2081-01-01"), "2024-04-13");
    });

    it("renders NewNepaliDatePicker and NewNepaliRangePicker via React without runtime errors", () => {
      const require = createRequire(import.meta.url);
      const React = require("react");
      const { renderToString } = require("react-dom/server");
      const {
        NepaliDateConfigProvider,
        NewNepaliDatePicker,
        NewNepaliRangePicker,
      } = require("../dist/cjs/index.js");

      const html = renderToString(
        React.createElement(
          NepaliDateConfigProvider,
          { showDevanagari: true, highlightSaturday: true },
          React.createElement(NewNepaliDatePicker, {
            withFormItem: false,
            value: "2081-01-15",
            bsButtonLabel: "वि.सं.",
            adButtonLabel: "AD",
          }),
          React.createElement(NewNepaliRangePicker, {
            withFormItem: false,
            value: ["2081-01-01", "2081-01-15"],
          }),
        ),
      );

      assert.ok(html.includes("वि.सं."), "Expected custom BS toggle label in rendered HTML");
      assert.ok(html.includes("midas-nepali-datepicker"), "Expected picker class in rendered HTML");
      assert.ok(html.includes("midas-nepali-rangepicker"), "Expected range picker class in rendered HTML");
    });

    it("exercises all bsGenerateConfig methods for rc-picker / antd compatibility", () => {
      const d = new NepaliDate(2081, 0, 15);
      assert.equal(bsGenerateConfig.getYear(d), 2081);
      assert.equal(bsGenerateConfig.getMonth(d), 0);
      assert.equal(bsGenerateConfig.getDate(d), 15);
      assert.equal(bsGenerateConfig.getEndDate(new NepaliDate(2081, 1, 1)).getDate(), 32); // Jestha 2081 has 32 days
      assert.equal(bsGenerateConfig.addYear(d, 1).getYear(), 2082);
      assert.equal(bsGenerateConfig.addMonth(d, 1).getMonth(), 1);
      assert.equal(bsGenerateConfig.addDate(d, 20).toString(), "2081-02-04");
      assert.ok(bsGenerateConfig.isValidate(d));
      assert.equal(bsGenerateConfig.locale.format("en_US", d, "YYYY-MM-DD"), "2081-01-15");
      assert.equal(bsGenerateConfig.locale.parse("en_US", "2081-01-15", ["YYYY-MM-DD"])?.toString(), "2081-01-15");
      assert.ok(bsGenerateConfig.locale.getWeek("en_US", d) >= 1);
    });
  });
});
