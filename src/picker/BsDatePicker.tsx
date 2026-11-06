import * as React from "react";
import { DatePicker } from "antd";
import generatePickerImport from "antd/es/date-picker/generatePicker";
import type {
  PickerProps,
  PickerPropsWithMultiple,
} from "antd/es/date-picker/generatePicker/interface";
import type { NepaliDate } from "../date-utils/index.js";
import { useShowDevanagari } from "./context.js";
import { bsGenerateConfig } from "./generateConfig.js";

// Safely unwrap default export across ESM, CommonJS, Vite, Webpack, Rollup, and Next.js
const generatePicker: typeof generatePickerImport =
  typeof (generatePickerImport as any)?.default === "function"
    ? (generatePickerImport as any).default
    : generatePickerImport;

/**
 * BS datepicker produced by antd's own picker factory, respecting `showDevanagari`
 * (via `<NepaliDateConfigProvider showDevanagari={...}>` or direct `showDevanagari` prop).
 */
const BasePicker = generatePicker<NepaliDate>(bsGenerateConfig);

/**
 * Removes the Devanagari / dual-number customisations when `showDevanagari` is off,
 * unless `keepCellRender` or `keepLocale` is explicitly enabled.
 */
const applyRule = (props: any, showDevanagari: boolean) => {
  const { showDevanagari: _omit, keepCellRender, keepLocale, ...rest } = props;
  if (showDevanagari) return rest;
  return {
    ...rest,
    cellRender: keepCellRender ? rest.cellRender : undefined,
    locale: keepLocale ? rest.locale : undefined,
  };
};

/* ---------- BS pickers ---------- */

const PickerWithRule = React.forwardRef<any, any>((props, ref) => {
  const showDevanagari = useShowDevanagari(props?.showDevanagari);
  const Picker = BasePicker as any;
  return <Picker {...applyRule(props, showDevanagari)} ref={ref} />;
});
PickerWithRule.displayName = "BsDatePicker";

const RangePickerWithRule = React.forwardRef<any, any>((props, ref) => {
  const showDevanagari = useShowDevanagari(props?.showDevanagari);
  const Range = BasePicker.RangePicker as any;
  return <Range {...applyRule(props, showDevanagari)} ref={ref} />;
});
RangePickerWithRule.displayName = "BsDatePicker.RangePicker";

export type BsDatePickerProps = PickerPropsWithMultiple<
  NepaliDate,
  PickerProps<NepaliDate>,
  NepaliDate
> & {
  showDevanagari?: boolean;
  /** Keep custom `cellRender` even when `showDevanagari` is `false`. */
  keepCellRender?: boolean;
  /** Keep custom `locale` even when `showDevanagari` is `false`. */
  keepLocale?: boolean;
};

/** Props of `BsDatePicker.RangePicker`: antd RangePicker typed over `NepaliDate`. */
export type BsRangePickerProps = React.ComponentProps<typeof BasePicker.RangePicker> & {
  showDevanagari?: boolean;
  /** Keep custom `cellRender` even when `showDevanagari` is `false`. */
  keepCellRender?: boolean;
  /** Keep custom `locale` even when `showDevanagari` is `false`. */
  keepLocale?: boolean;
};

export type BsDatePickerComponent = React.ForwardRefExoticComponent<BsDatePickerProps> &
  Omit<typeof BasePicker, "RangePicker"> & {
    RangePicker: React.ForwardRefExoticComponent<BsRangePickerProps>;
  };

export const BsDatePicker = Object.assign(PickerWithRule, BasePicker, {
  RangePicker: RangePickerWithRule,
}) as unknown as BsDatePickerComponent;

/* ---------- AD pickers (antd's own), same rule ---------- */

const AdPickerWithRule = React.forwardRef<any, any>((props, ref) => {
  const showDevanagari = useShowDevanagari(props?.showDevanagari);
  const Picker = DatePicker as any;
  return <Picker {...applyRule(props, showDevanagari)} ref={ref} />;
});
AdPickerWithRule.displayName = "AdDatePicker";

const AdRangePickerWithRule = React.forwardRef<any, any>((props, ref) => {
  const showDevanagari = useShowDevanagari(props?.showDevanagari);
  const Range = DatePicker.RangePicker as any;
  return <Range {...applyRule(props, showDevanagari)} ref={ref} />;
});
AdRangePickerWithRule.displayName = "AdDatePicker.RangePicker";

/** Drop-in replacement for antd's `DatePicker` / `DatePicker.RangePicker` that follows `showDevanagari`. */
export const AdDatePicker = Object.assign(AdPickerWithRule, {
  RangePicker: AdRangePickerWithRule,
});

export { bsGenerateConfig };
