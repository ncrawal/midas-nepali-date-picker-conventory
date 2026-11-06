# midas-nepali-date-picker-conventory

[![npm version](https://img.shields.io/npm/v/midas-nepali-date-picker-conventory.svg?style=flat-square)](https://www.npmjs.com/package/midas-nepali-date-picker-conventory)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/midas-nepali-date-picker-conventory.svg?style=flat-square)](https://www.npmjs.com/package/midas-nepali-date-picker-conventory)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square)](https://www.typescriptlang.org/)

A lightweight, high-performance, all-in-one **Nepali Bikram Sambat (BS) ↔ Gregorian (AD) Date Converter**, **`NepaliDate` utility library**, and **Ant Design BS/AD Dual DatePicker & RangePicker** with **runtime-extensible future BS calendar years** and **complete CSS/design customization**.

Works seamlessly across **Vite, Next.js (App & Pages Router / SSR), Create React App, Webpack, Rollup, TypeScript, and plain JavaScript** projects right after `npm install` or `yarn add`.

---

## ✨ Key Features

- **All-in-One Combo**:
  - Full `@midas/date-utils` (BS↔AD conversion, `NepaliDate` class, string & date arithmetic helpers, Devanagari/English numerals).
  - Full Ant Design Nepali DatePicker suite (`NewNepaliDatePicker`, `NewNepaliRangePicker`, `BsDatePicker`, `AdDatePicker`, `MaskedDateInput`, `bsGenerateConfig`, `getRangePresets`).
- **Runtime Extensible BS Calendar (`registerBsYear` / `registerBsYears`)**:
  - Because Nepal's official calendar (Panchanga Nirnayak Samiti) is only published 1–2 years in advance, you can dynamically override projected years or add future BS years (e.g., `2100`, `2101+`) at runtime without rebuilding the package.
- **Full Props & CSS / Design Customization**:
  - Customize input styles, wrapper styles, popup styles, cell dimensions, primary/secondary date styles, Saturday (शनिबार) holiday highlighting, `BS`/`AD` toggle button position (`"left"` | `"right"`), colors, labels (`"वि.सं."` / `"AD"`), or custom button/cell renderers.
- **Universal Module Compatibility**:
  - Ships dual **ESM** (`dist/esm`) and **CommonJS** (`dist/cjs`) builds with full TypeScript `.d.ts` declarations and zero runtime dependencies (`react`, `antd`, `dayjs` are peer dependencies).

---

## 📦 Installation

```bash
npm install midas-nepali-date-picker-conventory
# or
yarn add midas-nepali-date-picker-conventory
```

> **Peer Dependencies** (for React / Ant Design DatePicker components):
> `react >= 17`, `react-dom >= 17`, `antd >= 5`, `dayjs >= 1.10`

---

## 🖥️ Live Example App

This repository includes a pre-configured interactive demo with 3 real-world scenarios:

```bash
cd example
npm install
npm run dev
```

Visit `http://localhost:5173` to explore:
1. **Dual BS/AD Form Registration** (Patient Admission with Devanagari numerals).
2. **Nepali Date Range Filter** (Hospital billing & financial report filtering).
3. **Date Converter Playground** (Instant two-way BS ↔ AD conversion and runtime calendar year extension).

---

## 🚀 Quick Start

### 1. Basic Usage (Standalone or Inside Ant Design `<Form>`)

```tsx
import React, { useState } from "react";
import { Form } from "antd";
import {
  NewNepaliDatePicker,
  NewNepaliRangePicker,
  NepaliDateConfigProvider,
  CalendarMode,
} from "midas-nepali-date-picker-conventory";

export default function ExampleForm() {
  const [form] = Form.useForm();
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("BS");

  return (
    <NepaliDateConfigProvider showDevanagari={true} highlightSaturday={true}>
      <Form form={form} layout="vertical">
        {/* 1. Dual BS/AD DatePicker inside Ant Design Form */}
        <NewNepaliDatePicker
          formProps={{
            name: "dob_bs",
            label: "Date of Birth",
            rules: [{ required: true, message: "Date of birth is required" }],
          }}
          disableFuture
          calendarMode={calendarMode}
          onCalendarModeChange={setCalendarMode}
          onChange={(nepaliDate, formattedBs, { adDate, formattedAd, calendarMode }) => {
            console.log({ formattedBs, formattedAd, adDate, calendarMode });
          }}
        />

        {/* 2. Dual BS/AD RangePicker with Quick Presets */}
        <NewNepaliRangePicker
          formProps={{
            name: "visit_range",
            label: "Visit Date Range",
          }}
          showPresets
          calendarMode={calendarMode}
          onCalendarModeChange={setCalendarMode}
        />
      </Form>
    </NepaliDateConfigProvider>
  );
}
```

### 2. Standalone Usage (Without Ant Design `<Form>`)

Set `withFormItem={false}` when using with `useState`, `react-hook-form`, `Formik`, or plain React state:

```tsx
import React, { useState } from "react";
import { NewNepaliDatePicker } from "midas-nepali-date-picker-conventory";

export function StandaloneDatePicker() {
  const [bsDate, setBsDate] = useState<string>("2081-01-15");

  return (
    <NewNepaliDatePicker
      withFormItem={false}
      value={bsDate}
      onChange={(_dateObj, formattedBs, { formattedAd }) => {
        setBsDate(formattedBs);
        console.log("BS:", formattedBs, "AD:", formattedAd);
      }}
    />
  );
}
```

---

## 🎨 Complete CSS & Props Customization Guide

`NewNepaliDatePicker` and `NewNepaliRangePicker` provide extensive props to customize every part of the UI:

```tsx
<NewNepaliDatePicker
  withFormItem={false}
  /* --- Value & Output Format --- */
  value="2081-02-15"
  valueType="bs-string" // "bs-string" | "nepali-date" | "ad-string" | "ad-date"
  format="YYYY-MM-DD"
  size="middle" // "small" | "middle" | "large"
  variant="outlined" // "outlined" | "filled" | "borderless" | "underlined"

  /* --- Date Constraints --- */
  minDate="2075-01-01" // or disabledBefore="2075-01-01"
  maxDate="2085-12-30" // or disabledAfter="2085-12-30"
  disableFuture={false}
  disablePast={false}

  /* --- Toggle Button Customization --- */
  showCalendarToggle={true}
  toggleButtonPosition="right" // "right" | "left"
  bsButtonLabel="वि.सं. (BS)"
  adButtonLabel="ई.सं. (AD)"
  toggleButtonClassName="my-custom-toggle-btn"
  toggleButtonStyle={{
    backgroundColor: "#0f766e",
    color: "#ffffff",
    borderColor: "#0f766e",
    fontWeight: 600,
    paddingInline: 12,
  }}

  /* --- Calendar Cell, Devanagari & Saturday Holiday Styling --- */
  showDevanagari={true}
  showSecondaryDate={true} // Show AD day in corner of BS calendar (and vice-versa)
  highlightSaturday={true} // Highlight Saturdays (शनिबार) in red
  saturdayStyle={{ color: "#e11d48", fontWeight: 700 }}
  cellWidth={42}
  cellHeight={38}
  primaryDateStyle={{ fontSize: 13, fontWeight: 500 }}
  secondaryDateStyle={{ fontSize: 8, color: "#64748b", top: 2, right: 3 }}

  /* --- Input, Wrapper & Popup CSS Customization --- */
  className="my-datepicker-input"
  style={{ borderRadius: 8 }}
  wrapperClassName="my-datepicker-wrapper"
  wrapperStyle={{ maxWidth: 320 }}
  popupClassName="my-calendar-popup"
  popupStyle={{ borderRadius: 12 }}
  inputClassName="my-masked-input"
  inputStyle={{ letterSpacing: "0.5px" }}
/>
```

### Custom Toggle Button Renderer (`renderToggleButton`)

Want to render your own custom switch, badge, or icon instead of the default button?

```tsx
<NewNepaliDatePicker
  renderToggleButton={({ calendarMode, nextCalendarMode, toggle, disabled }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={toggle}
      style={{
        padding: "0 10px",
        background: calendarMode === "BS" ? "#166534" : "#1d4ed8",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
      title={`Switch to ${nextCalendarMode}`}
    >
      {calendarMode}
    </button>
  )}
/>
```

### Built-in CSS Class Selectors

You can also target these semantic CSS classes in your global stylesheet:

- `.midas-nepali-datepicker-wrapper` — Outer `Space.Compact` container for `NewNepaliDatePicker`
- `.midas-nepali-datepicker` — The Ant Design Picker root element
- `.midas-nepali-datepicker-toggle` — The `BS` / `AD` toggle button
- `.dual-calendar-popup` — The dropdown calendar popup container
- `.midas-nepali-rangepicker-wrapper` — Outer container for `NewNepaliRangePicker`
- `.midas-nepali-rangepicker` — The Ant Design RangePicker root element

---

## 📅 Adding or Updating Future BS Years at Runtime (`registerBsYear` / `registerBsYears`)

Because the official Nepali Bikram Sambat calendar is only published 1–2 years ahead, you can override projected years (`2085`–`2099`) when the Nepal government publishes official month lengths, or extend the calendar to future years (`2100`, `2101`, ...) at runtime without updating or rebuilding the package:

```ts
import {
  registerBsYear,
  registerBsYears,
  getSupportedBsYearRange,
} from "midas-nepali-date-picker-conventory";

// 1. Register a single future year (12 month lengths: Baishakh through Chaitra)
registerBsYear(2100, [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31]);

// 2. Or register/override multiple years at once
registerBsYears({
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30], // override with official data
  2100: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2101: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
});

console.log(getSupportedBsYearRange());
// → { minYear: 1970, maxYear: 2101 }
```

---

## 🧮 Date Conversion & Utility Functions

All date conversion and manipulation helpers can be imported from the root package `"midas-nepali-date-picker-conventory"` or from `"midas-nepali-date-picker-conventory/date-utils"`:

```ts
import {
  NepaliDate,
  bsToAd,
  adToBs,
  bsToAdString,
  adToBsString,
  parseNepaliDate,
  parseDateString,
  isValidDate,
  isValidDateString,
  formatDate,
  getTodayBs,
  getMonthData,
  addDays,
  addMonths,
  daysBetween,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  isSameDay,
  isSameMonth,
  isBetween,
  toNepaliNumerals,
  toEnglishNumerals,
} from "midas-nepali-date-picker-conventory";

// Direct BS <-> AD conversion
bsToAd(2081, 1, 1);                   // → Date (2024-04-13)
adToBs(new Date(2024, 3, 13));        // → { year: 2081, month: 1, day: 1 }
bsToAdString("2081-01-01");           // → "2024-04-13"
adToBsString(new Date(2024, 3, 13));  // → "2081-01-01"
getTodayBs();                         // → Today's BS date as "YYYY-MM-DD"

// NepaliDate class (0-indexed month, matching JS Date)
const d = new NepaliDate(2081, 0, 15);
d.format("YYYY-MM-DD");               // → "2081-01-15"
d.format("dddd, MMMM D, YYYY", "np"); // → "शनिबार, बैशाख १५, २०८१"

// Devanagari <-> English numerals
toNepaliNumerals("2081-01-15");       // → "२०८१-०१-१५"
toEnglishNumerals("२०८१-०१-१५");      // → "2081-01-15"
```

---

## 📄 License

MIT
