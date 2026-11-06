import { NepaliDate, addDays } from "../date-utils/index.js";
import type { BsRangePickerProps } from "./BsDatePicker.js";

/**
 * Common range presets (`Today`, `Yesterday`, `Last 7 Days`, `Last 14 Days`, `Last 30 Days`)
 * for `BsDatePicker.RangePicker`.
 */
export const getRangePresets = (): BsRangePickerProps["presets"] => {
  const today = () => new NepaliDate();

  return [
    { label: "Today", value: [today(), today()] },
    { label: "Yesterday", value: [addDays(today(), -1), addDays(today(), -1)] },
    { label: "Last 7 Days", value: [addDays(today(), -7), today()] },
    { label: "Last 14 Days", value: [addDays(today(), -14), today()] },
    { label: "Last 30 Days", value: [addDays(today(), -30), today()] },
  ];
};
