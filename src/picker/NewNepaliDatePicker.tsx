import {
  Button,
  ButtonProps,
  ConfigProvider,
  DatePicker,
  Form,
  FormItemProps,
  Space,
  ThemeConfig,
} from "antd";
import enUSImport from "antd/es/date-picker/locale/en_US";
import dayjsImport, { Dayjs } from "dayjs";
import React, { cloneElement, isValidElement, useMemo } from "react";
import {
  LOCALE,
  NepaliDate,
  adToBsString,
  bsToAdString,
  getTodayBs,
  parseNepaliDate,
  toNepaliNumerals,
} from "../date-utils/index.js";
import { BsDatePicker } from "./BsDatePicker.js";
import { CalendarMode, useNepaliDateConfig, useShowDevanagari } from "./context.js";
import { MaskedDateInput, NepaliMaskedDateInput } from "./MaskedDateInput.js";
import { getRangePresets } from "./presets.js";

// Safe default export unwrapping for Vite, Webpack, Rollup, Next.js, CJS, and ESM
const enUS: typeof enUSImport = (enUSImport as any)?.default ?? enUSImport;
const dayjs: typeof dayjsImport = (dayjsImport as any)?.default ?? dayjsImport;

const cn = (...classes: Array<string | undefined | null | false>): string =>
  classes.filter(Boolean).join(" ");

export type DateValueType = "bs-string" | "nepali-date" | "ad-string" | "ad-date";

export interface NepaliDateChangeExtra {
  /** Selected date converted to a JavaScript `Date` (AD local midnight), or `null`. */
  adDate: Date | null;
  /** Selected date formatted as an AD `"YYYY-MM-DD"` string, or `""`. */
  formattedAd: string;
  /** Active calendar mode (`"BS"` | `"AD"`) when the selection occurred. */
  calendarMode: CalendarMode;
}

export interface ToggleButtonRenderProps {
  calendarMode: CalendarMode;
  nextCalendarMode: CalendarMode;
  toggle: () => void;
  disabled?: boolean;
}

export interface CustomCellRenderInfo {
  originNode: React.ReactElement;
  type: string;
  calendarMode: CalendarMode;
}

export interface NepaliRangeChangeExtra {
  adDates: [Date | null, Date | null] | null;
  formattedAdStrings: [string, string];
  calendarMode: CalendarMode;
}

export interface NewNepaliDatePickerProps<FieldValues = any> {
  /* ---------- Form & Value Props ---------- */
  /** Ant Design `Form.Item` props (`name`, `label`, `rules`, etc.), typed over `FieldValues`. */
  formProps?: FormItemProps<FieldValues>;
  /** Set to `false` to render the picker without an outer `<Form.Item>` wrapper. Defaults to `true`. */
  withFormItem?: boolean;
  /**
   * Value stored into Ant Design Form state when used inside `<Form>`.
   * - `"bs-string"` (default): formatted BS string e.g. `"2081-01-15"`
   * - `"nepali-date"`: `NepaliDate` instance
   * - `"ad-string"`: formatted AD string e.g. `"2024-04-27"`
   * - `"ad-date"`: JavaScript `Date` instance
   */
  valueType?: DateValueType;
  /** Controlled or display-only value (BS `"YYYY-MM-DD"`, `NepaliDate`, or JS `Date`). */
  value?: string | NepaliDate | Date | null;
  /** Initial value for uncontrolled usage (BS `"YYYY-MM-DD"`, `NepaliDate`, or JS `Date`). */
  defaultValue?: string | NepaliDate | Date | null;
  /** Output & display format string. Defaults to `"YYYY-MM-DD"`. */
  format?: string;
  placeholder?: string;
  /**
   * Called whenever the selected date changes.
   * Provides `(nepaliDate, formattedBsString, { adDate, formattedAd, calendarMode })`.
   */
  onChange?: (
    date: NepaliDate | null,
    formattedBs: string,
    extra: NepaliDateChangeExtra,
  ) => void;

  /* ---------- Date Range Constraints ---------- */
  /** Disables all dates strictly before this date (BS `"YYYY-MM-DD"`, `NepaliDate`, or JS `Date`). */
  disabledBefore?: string | NepaliDate | Date;
  /** Alias for `disabledBefore`. */
  minDate?: string | NepaliDate | Date;
  /** Disables all dates strictly after this date (BS `"YYYY-MM-DD"`, `NepaliDate`, or JS `Date`). */
  disabledAfter?: string | NepaliDate | Date;
  /** Alias for `disabledAfter`. */
  maxDate?: string | NepaliDate | Date;
  /** Automatically disables all future dates after today (`getTodayBs()`). */
  disableFuture?: boolean;
  /** Automatically disables all past dates before today (`getTodayBs()`). */
  disablePast?: boolean;
  /** Custom function to disable specific BS dates. */
  disabledDate?: (currentBs: NepaliDate) => boolean;

  /* ---------- Calendar Mode & Toggle Button Customization ---------- */
  /** Shows a `BS` / `AD` toggle button beside the picker (enabled by default). */
  showCalendarToggle?: boolean;
  /** Controlled calendar mode (`"BS"` | `"AD"`). */
  calendarMode?: CalendarMode;
  /** Initial calendar mode when uncontrolled (`"BS"` | `"AD"`). */
  defaultCalendarMode?: CalendarMode;
  /** Callback fired when the user switches between `BS` and `AD`. */
  onCalendarModeChange?: (calendar: CalendarMode) => void;
  /** Placement of the `BS` / `AD` toggle button relative to the input. Defaults to `"right"`. */
  toggleButtonPosition?: "right" | "left";
  /** Custom label on the toggle button when in BS mode (e.g. `"BS"`, `"वि.सं."`). */
  bsButtonLabel?: React.ReactNode;
  /** Custom label on the toggle button when in AD mode (e.g. `"AD"`, `"ई.सं."`). */
  adButtonLabel?: React.ReactNode;
  /** Custom CSS class name for the `BS` / `AD` toggle button. */
  toggleButtonClassName?: string;
  /** Custom inline style for the `BS` / `AD` toggle button (background, color, border, font, etc.). */
  toggleButtonStyle?: React.CSSProperties;
  /** Additional Ant Design `<Button>` props passed to the `BS` / `AD` toggle button. */
  toggleButtonProps?: ButtonProps;
  /** Custom render function to completely replace the default `BS` / `AD` toggle button. */
  renderToggleButton?: (props: ToggleButtonRenderProps) => React.ReactNode;

  /* ---------- Devanagari, Dual-Cell & Holiday Customization ---------- */
  /** Overrides the `NepaliDateConfigProvider`'s `showDevanagari` setting for this picker. */
  showDevanagari?: boolean;
  /**
   * Shows the secondary calendar date in the top-right corner of each cell
   * (AD day in BS mode, BS day in AD mode) even when `showDevanagari` is `false`.
   */
  showSecondaryDate?: boolean;
  /** Highlights Saturdays (शनिबार - Nepali weekly holiday) in red across the calendar grid. */
  highlightSaturday?: boolean;
  /** Custom inline style applied to Saturday date numbers when `highlightSaturday` is enabled. */
  saturdayStyle?: React.CSSProperties;
  /** Custom CSS class name applied to Saturday date numbers when `highlightSaturday` is enabled. */
  saturdayClassName?: string;
  /** Width of each date cell in the popup calendar (px). Defaults to `40`. */
  cellWidth?: number;
  /** Height of each date cell in the popup calendar (px). Defaults to `35`. */
  cellHeight?: number;
  /** Custom inline style for the primary date number inside each calendar cell. */
  primaryDateStyle?: React.CSSProperties;
  /** Custom CSS class name for the primary date number inside each calendar cell. */
  primaryDateClassName?: string;
  /** Custom inline style for the secondary corner date number inside each calendar cell. */
  secondaryDateStyle?: React.CSSProperties;
  /** Custom CSS class name for the secondary corner date number inside each calendar cell. */
  secondaryDateClassName?: string;
  /** Full custom cell renderer receiving `(bsDate, adDate, info)`. */
  customCellRender?: (
    bsDate: NepaliDate | null,
    adDate: Date,
    info: CustomCellRenderInfo,
  ) => React.ReactNode;

  /* ---------- CSS, Layout, Input & Ant Design Picker Customization ---------- */
  /** CSS class name for the DatePicker input. */
  className?: string;
  /** Inline style for the DatePicker input. */
  style?: React.CSSProperties;
  /** CSS class name for the outer wrapper (`Space.Compact`). */
  wrapperClassName?: string;
  /** Inline style for the outer wrapper (`Space.Compact`). */
  wrapperStyle?: React.CSSProperties;
  /** CSS class name for the calendar dropdown popup. */
  popupClassName?: string;
  /** Inline style for the calendar dropdown popup. */
  popupStyle?: React.CSSProperties;
  /** CSS class name for the `Form.Item` label span. */
  labelClassName?: string;
  /** Inline style for the `Form.Item` label span. */
  labelStyle?: React.CSSProperties;
  /** CSS class name passed to the inner `<MaskedDateInput>`. */
  inputClassName?: string;
  /** Inline style passed to the inner `<MaskedDateInput>`. */
  inputStyle?: React.CSSProperties;
  /** Set to `false` to use Ant Design's default text input instead of `MaskedDateInput`. Defaults to `true`. */
  useMaskedInput?: boolean;
  /** Custom Ant Design `ConfigProvider` theme overrides for this picker. */
  theme?: ThemeConfig;
  "data-cy"?: string;
  readOnly?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  variant?: "outlined" | "borderless" | "filled" | "underlined";
  status?: "error" | "warning";
  placement?: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  suffixIcon?: React.ReactNode;
  allowEmpty?: boolean;
  autoFocus?: boolean;
  inputReadOnly?: boolean;
  showNow?: boolean;
  renderExtraFooter?: (mode: string) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

export type DateCellProps = NewNepaliDatePickerProps;

/** AD → BS, or null when the date falls outside the BS calendar table. */
const toNepaliDate = (date: Dayjs): NepaliDate | null => {
  try {
    return NepaliDate.fromAD(date.toDate());
  } catch {
    return null;
  }
};

/** Converts string (BS or AD), JS Date, or NepaliDate to NepaliDate. */
const resolveToNepaliDate = (
  value: string | NepaliDate | Date | null | undefined,
): NepaliDate | null | undefined => {
  if (value === undefined || value === null) return value;
  if (value instanceof NepaliDate) return value;
  if (value instanceof Date) {
    try {
      return NepaliDate.fromAD(value);
    } catch {
      return null;
    }
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Try parsing as BS first
    const bs = parseNepaliDate(trimmed);
    if (bs) return bs;
    // Fallback: if it's an ISO/AD date string outside BS range (e.g. 2024-04-13), try AD->BS
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime())) {
      try {
        return NepaliDate.fromAD(d);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// rc-picker's formatValue also accepts a function format; its Locale type only declares strings.
const nepaliYearFormat = ((date: NepaliDate) => toNepaliNumerals(date.getYear())) as unknown as string;

/** BS panel labels in Devanagari. The input keeps ASCII digits internally so parsing and form values are unchanged. */
export const bsPanelLocale = {
  ...enUS,
  lang: {
    ...enUS.lang,
    shortWeekDays: [...LOCALE.np.dayShort],
    shortMonths: [...LOCALE.np.monthLong],
    yearFormat: nepaliYearFormat,
    cellYearFormat: nepaliYearFormat,
  },
};

interface DualCellOptions {
  primaryStyle?: React.CSSProperties;
  primaryClassName?: string;
  secondaryStyle?: React.CSSProperties;
  secondaryClassName?: string;
  isSaturday?: boolean;
  saturdayStyle?: React.CSSProperties;
  saturdayClassName?: string;
}

const renderDualCell = (
  info: { originNode: React.ReactElement },
  primary: React.ReactNode,
  corner?: React.ReactNode,
  options?: DualCellOptions,
): React.ReactNode => {
  if (!isValidElement<{ children?: React.ReactNode }>(info.originNode)) {
    return info.originNode;
  }
  const satStyle: React.CSSProperties | undefined = options?.isSaturday
    ? { color: "#dc2626", fontWeight: 600, ...options?.saturdayStyle }
    : undefined;

  return cloneElement(
    info.originNode,
    undefined,
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        lineHeight: 1.15,
        height: "100%",
        width: "100%",
      }}
    >
      {corner !== undefined && (
        <div
          className={options?.secondaryClassName}
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            fontSize: 8,
            opacity: 0.9,
            ...options?.secondaryStyle,
          }}
        >
          {corner}
        </div>
      )}
      <div
        className={cn(
          options?.primaryClassName,
          options?.isSaturday && options?.saturdayClassName,
        )}
        style={{
          fontSize: 12,
          ...options?.primaryStyle,
          ...satStyle,
        }}
      >
        {primary}
      </div>
    </div>,
  );
};

interface CalendarTogglePickerProps {
  id?: string;
  value?: NepaliDate | null;
  defaultValue?: NepaliDate | null;
  onChange?: (date: NepaliDate | null) => void;
  userOnChange?: (
    date: NepaliDate | null,
    formattedBs: string,
    extra: NepaliDateChangeExtra,
  ) => void;
  format: string;
  bsPicker: React.ReactElement<{
    id?: string;
    value?: NepaliDate | null;
    defaultValue?: NepaliDate | null;
    onChange?: unknown;
  }>;
  adPicker: React.ReactElement<{
    id?: string;
    value?: Dayjs | null;
    defaultValue?: Dayjs | null;
    onChange?: unknown;
  }>;
  calendarMode?: CalendarMode;
  defaultCalendarMode?: CalendarMode;
  onCalendarModeChange?: (calendar: CalendarMode) => void;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  toggleButtonPosition?: "right" | "left";
  bsButtonLabel?: React.ReactNode;
  adButtonLabel?: React.ReactNode;
  toggleButtonClassName?: string;
  toggleButtonStyle?: React.CSSProperties;
  toggleButtonProps?: ButtonProps;
  renderToggleButton?: (props: ToggleButtonRenderProps) => React.ReactNode;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
}

/**
 * Switches between the BS and AD pickers. Both read and write `NepaliDate`,
 * so the form and `onChange` always receive normalized values.
 */
const CalendarTogglePicker: React.FC<CalendarTogglePickerProps> = ({
  id,
  value,
  defaultValue,
  onChange,
  userOnChange,
  format,
  bsPicker,
  adPicker,
  calendarMode: controlledCalendar,
  defaultCalendarMode = "BS",
  onCalendarModeChange,
  wrapperClassName,
  wrapperStyle,
  toggleButtonPosition = "right",
  bsButtonLabel = "BS",
  adButtonLabel = "AD",
  toggleButtonClassName,
  toggleButtonStyle,
  toggleButtonProps,
  renderToggleButton,
  disabled,
  size,
}) => {
  const [ownCalendar, setOwnCalendar] = React.useState<CalendarMode>(defaultCalendarMode);
  const calendar = controlledCalendar ?? ownCalendar;
  const nextCalendar: CalendarMode = calendar === "BS" ? "AD" : "BS";

  const setCalendar = (next: CalendarMode) => {
    setOwnCalendar(next);
    onCalendarModeChange?.(next);
  };

  const handleDateChange = (nextDate: NepaliDate | null) => {
    onChange?.(nextDate);
    if (userOnChange) {
      const formattedBs = nextDate ? nextDate.format(format) : "";
      const adDate = nextDate ? nextDate.toJsDate() : null;
      const formattedAd =
        nextDate ? (bsToAdString(nextDate.toString()) ?? "") : "";
      userOnChange(nextDate, formattedBs, {
        adDate,
        formattedAd,
        calendarMode: calendar,
      });
    }
  };

  const picker =
    calendar === "BS"
      ? cloneElement(bsPicker, {
          id,
          value,
          defaultValue,
          onChange: handleDateChange,
        })
      : cloneElement(adPicker, {
          id,
          value: value ? dayjs(value.toJsDate()) : (value as null | undefined),
          defaultValue: defaultValue
            ? dayjs(defaultValue.toJsDate())
            : (defaultValue as null | undefined),
          onChange: (date: Dayjs | null) => handleDateChange(date ? toNepaliDate(date) : null),
        });

  const toggleBtn = renderToggleButton ? (
    renderToggleButton({
      calendarMode: calendar,
      nextCalendarMode: nextCalendar,
      toggle: () => setCalendar(nextCalendar),
      disabled,
    })
  ) : (
    <Button
      size={size}
      disabled={disabled}
      {...toggleButtonProps}
      className={cn(
        "midas-nepali-datepicker-toggle shrink-0 px-2 text-xs font-medium !bg-[color:var(--Green-Green-10)] !text-[color:var(--Green-Green-100)] hover:!bg-[color:var(--Green-Green-20)] hover:!border-[color:var(--Green-Green-80)]",
        toggleButtonClassName,
        toggleButtonProps?.className,
      )}
      style={{
        flexShrink: 0,
        paddingInline: 8,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: "var(--Green-Green-10, #e6f4ea)",
        color: "var(--Green-Green-100, #137333)",
        ...toggleButtonStyle,
        ...toggleButtonProps?.style,
      }}
      onClick={(e) => {
        toggleButtonProps?.onClick?.(e);
        setCalendar(nextCalendar);
      }}
    >
      {calendar === "BS" ? bsButtonLabel : adButtonLabel}
    </Button>
  );

  return (
    <Space.Compact
      className={cn("midas-nepali-datepicker-wrapper w-full", wrapperClassName)}
      style={{ width: "100%", ...wrapperStyle }}
    >
      {toggleButtonPosition === "left" && toggleBtn}
      {picker}
      {toggleButtonPosition === "right" && toggleBtn}
    </Space.Compact>
  );
};

export const NewNepaliDatePicker = <FieldValues = any,>(
  props: NewNepaliDatePickerProps<FieldValues>,
): React.ReactElement => {
  const globalConfig = useNepaliDateConfig();

  const {
    formProps = {},
    withFormItem = true,
    valueType = "bs-string",
    format = "YYYY-MM-DD",
    disabledAfter,
    maxDate,
    disabledBefore,
    minDate,
    disableFuture = false,
    disablePast = false,
    disabledDate: customDisabledDate,
    onChange,
    className = "",
    style,
    wrapperClassName,
    wrapperStyle,
    popupClassName,
    popupStyle,
    labelClassName,
    labelStyle,
    inputClassName,
    inputStyle,
    useMaskedInput = true,
    value,
    defaultValue,
    showCalendarToggle = true,
    calendarMode,
    defaultCalendarMode = globalConfig.defaultCalendarMode ?? "BS",
    onCalendarModeChange,
    toggleButtonPosition = "right",
    bsButtonLabel = globalConfig.bsButtonLabel ?? "BS",
    adButtonLabel = globalConfig.adButtonLabel ?? "AD",
    toggleButtonClassName = globalConfig.toggleButtonClassName,
    toggleButtonStyle = globalConfig.toggleButtonStyle,
    toggleButtonProps,
    renderToggleButton,
    showDevanagari: showDevanagariProp,
    showSecondaryDate: showSecondaryDateProp,
    highlightSaturday = globalConfig.highlightSaturday ?? false,
    saturdayStyle,
    saturdayClassName,
    cellWidth = 40,
    cellHeight = 35,
    primaryDateStyle,
    primaryDateClassName,
    secondaryDateStyle,
    secondaryDateClassName,
    customCellRender,
    theme: themeProp,
    disabled,
    size,
    ...rest
  } = props;

  const showDevanagari = useShowDevanagari(showDevanagariProp);
  const showSecondaryDate =
    showSecondaryDateProp !== undefined
      ? showSecondaryDateProp
      : (globalConfig.showSecondaryDate ?? showDevanagari);

  const hasCustomCell = Boolean(
    showDevanagari ||
      showSecondaryDate ||
      highlightSaturday ||
      primaryDateStyle ||
      primaryDateClassName ||
      secondaryDateStyle ||
      secondaryDateClassName ||
      customCellRender,
  );

  const formatDay = (day: number): React.ReactNode =>
    showDevanagari ? toNepaliNumerals(day) : day;

  const bsValue = resolveToNepaliDate(value);
  const bsDefaultValue = resolveToNepaliDate(defaultValue);

  const effectiveBeforeInput = disabledBefore ?? minDate ?? (disablePast ? getTodayBs() : undefined);
  const effectiveAfterInput = disabledAfter ?? maxDate ?? (disableFuture ? getTodayBs() : undefined);

  const beforeDate = resolveToNepaliDate(effectiveBeforeInput);
  const afterDate = resolveToNepaliDate(effectiveAfterInput);

  const disabledDate = (current: NepaliDate): boolean => {
    if (!current) return false;

    const currentTime = current.toJsDate().getTime();

    if (beforeDate && currentTime < beforeDate.toJsDate().getTime()) {
      return true;
    }

    if (afterDate && currentTime > afterDate.toJsDate().getTime()) {
      return true;
    }

    if (customDisabledDate && customDisabledDate(current)) {
      return true;
    }

    return false;
  };

  const BsInputComponent = useMemo(() => {
    if (!useMaskedInput) return undefined;
    const Comp = showDevanagari ? NepaliMaskedDateInput : MaskedDateInput;
    const Wrapped = React.forwardRef<HTMLInputElement, any>((inputProps, ref) => (
      <Comp
        {...inputProps}
        ref={ref}
        showDevanagari={showDevanagari}
        className={cn(inputProps?.className, inputClassName)}
        style={{ ...inputProps?.style, ...inputStyle }}
      />
    ));
    Wrapped.displayName = "ConfiguredBsMaskedDateInput";
    return Wrapped;
  }, [useMaskedInput, showDevanagari, inputClassName, inputStyle]);

  const AdInputComponent = useMemo(() => {
    if (!useMaskedInput) return undefined;
    const Wrapped = React.forwardRef<HTMLInputElement, any>((inputProps, ref) => (
      <MaskedDateInput
        {...inputProps}
        ref={ref}
        showDevanagari={false}
        className={cn(inputProps?.className, inputClassName)}
        style={{ ...inputProps?.style, ...inputStyle }}
      />
    ));
    Wrapped.displayName = "ConfiguredAdMaskedDateInput";
    return Wrapped;
  }, [useMaskedInput, inputClassName, inputStyle]);

  const cellOptions = (isSat: boolean): DualCellOptions => ({
    primaryStyle: primaryDateStyle,
    primaryClassName: primaryDateClassName,
    secondaryStyle: secondaryDateStyle,
    secondaryClassName: secondaryDateClassName,
    isSaturday: highlightSaturday && isSat,
    saturdayStyle,
    saturdayClassName,
  });

  const bsPicker = (
    <BsDatePicker
      {...rest}
      disabled={disabled}
      size={size}
      showDevanagari={showDevanagari}
      keepCellRender={hasCustomCell}
      value={bsValue}
      defaultValue={bsDefaultValue}
      onChange={(d) => {
        const nextDate = d ?? null;
        if (onChange) {
          const formattedBs = nextDate ? nextDate.format(format) : "";
          const adDate = nextDate ? nextDate.toJsDate() : null;
          const formattedAd = nextDate ? (bsToAdString(nextDate.toString()) ?? "") : "";
          onChange(nextDate, formattedBs, {
            adDate,
            formattedAd,
            calendarMode: "BS",
          });
        }
      }}
      className={cn("midas-nepali-datepicker w-full", className)}
      style={{ width: "100%", ...style }}
      disabledDate={disabledDate}
      format={{ format }}
      locale={showDevanagari ? bsPanelLocale : undefined}
      classNames={{ popup: { root: cn("dual-calendar-popup", popupClassName) } }}
      styles={popupStyle ? { popup: { root: popupStyle } } : undefined}
      changeOnBlur
      cellRender={(current, info) => {
        if (info.type !== "date") return info.originNode;
        const bs = current as NepaliDate;
        const ad = bs.toJsDate();
        if (customCellRender) {
          return customCellRender(bs, ad, {
            originNode: info.originNode,
            type: info.type,
            calendarMode: "BS",
          });
        }
        return renderDualCell(
          info,
          formatDay(bs.getDate()),
          showSecondaryDate ? ad.getDate() : undefined,
          cellOptions(bs.getDay() === 6),
        );
      }}
      components={BsInputComponent ? { input: BsInputComponent } : undefined}
    />
  );

  const adPicker = showCalendarToggle ? (
    <DatePicker
      {...rest}
      disabled={disabled}
      size={size}
      className={cn("midas-nepali-datepicker w-full", className)}
      style={{ width: "100%", ...style }}
      disabledDate={(current) => {
        const bs = toNepaliDate(current);
        return !bs || disabledDate(bs);
      }}
      format={{ format }}
      classNames={{ popup: { root: cn("dual-calendar-popup", popupClassName) } }}
      styles={popupStyle ? { popup: { root: popupStyle } } : undefined}
      changeOnBlur
      cellRender={
        hasCustomCell
          ? (current, info) => {
              if (info.type !== "date") return info.originNode;
              const ad = current as Dayjs;
              const bs = toNepaliDate(ad);
              if (customCellRender) {
                return customCellRender(bs, ad.toDate(), {
                  originNode: info.originNode,
                  type: info.type,
                  calendarMode: "AD",
                });
              }
              return renderDualCell(
                info,
                ad.date(),
                showSecondaryDate && bs ? formatDay(bs.getDate()) : undefined,
                cellOptions(ad.day() === 6),
              );
            }
          : undefined
      }
      components={AdInputComponent ? { input: AdInputComponent } : undefined}
    />
  ) : null;

  const pickerNode = adPicker ? (
    <CalendarTogglePicker
      value={bsValue}
      defaultValue={bsDefaultValue}
      userOnChange={onChange}
      format={format}
      bsPicker={bsPicker}
      adPicker={adPicker}
      calendarMode={calendarMode}
      defaultCalendarMode={defaultCalendarMode}
      onCalendarModeChange={onCalendarModeChange}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      toggleButtonPosition={toggleButtonPosition}
      bsButtonLabel={bsButtonLabel}
      adButtonLabel={adButtonLabel}
      toggleButtonClassName={toggleButtonClassName}
      toggleButtonStyle={toggleButtonStyle}
      toggleButtonProps={toggleButtonProps}
      renderToggleButton={renderToggleButton}
      disabled={disabled}
      size={size}
    />
  ) : (
    bsPicker
  );

  const mergedTheme = useMemo<ThemeConfig>(() => {
    const baseTheme = globalConfig.theme ?? {};
    const localTheme = themeProp ?? {};
    return {
      ...baseTheme,
      ...localTheme,
      components: {
        ...baseTheme.components,
        ...localTheme.components,
        DatePicker: {
          cellHeight,
          cellWidth,
          ...(baseTheme.components?.DatePicker ?? {}),
          ...(localTheme.components?.DatePicker ?? {}),
        },
      },
    };
  }, [globalConfig.theme, themeProp, cellHeight, cellWidth]);

  const { colon = false, validateFirst = true, labelCol = {}, label, ...restFormProps } = formProps;

  const normalizeFormValue = (val: NepaliDate | null) => {
    if (!val) return null;
    switch (valueType) {
      case "nepali-date":
        return val;
      case "ad-date":
        return val.toJsDate();
      case "ad-string":
        return bsToAdString(val.toString());
      case "bs-string":
      default:
        return val.format(format);
    }
  };

  return (
    <>
      <style>
        {`
         .ant-picker-dropdown .ant-picker-panel-layout .ant-picker-body {
            padding: 2px 6px;
        }
        ${
          showDevanagari
            ? `.dual-calendar-popup .ant-picker-cell {
            font-family: inherit;
        }`
            : ""
        }
      `}
      </style>
      <ConfigProvider theme={mergedTheme}>
        {withFormItem ? (
          <Form.Item
            {...restFormProps}
            label={
              label && (
                <span
                  className={cn(
                    "justify-center text-[#1e1e1eb3] text-xs font-medium",
                    labelClassName,
                  )}
                  style={labelStyle}
                >
                  {label}
                </span>
              )
            }
            colon={colon}
            validateFirst={validateFirst}
            labelCol={{ ...labelCol }}
            getValueProps={(val: string | NepaliDate | Date | null) => ({
              value: resolveToNepaliDate(val),
            })}
            normalize={normalizeFormValue}
          >
            {pickerNode}
          </Form.Item>
        ) : (
          pickerNode
        )}
      </ConfigProvider>
    </>
  );
};

/* ---------- Dual BS/AD RangePicker (NewNepaliRangePicker) ---------- */

export interface NewNepaliRangePickerProps<FieldValues = any> {
  /** Ant Design `Form.Item` props (`name`, `label`, `rules`, etc.), typed over `FieldValues`. */
  formProps?: FormItemProps<FieldValues>;
  /** Set to `false` to render without an outer `<Form.Item>` wrapper. Defaults to `true`. */
  withFormItem?: boolean;
  /** Controlled `[start, end]` BS dates (`"YYYY-MM-DD"`, `NepaliDate`, or `Date`). */
  value?: [string | NepaliDate | Date | null, string | NepaliDate | Date | null] | null;
  /** Initial `[start, end]` BS dates for uncontrolled usage. */
  defaultValue?: [string | NepaliDate | Date | null, string | NepaliDate | Date | null] | null;
  /** Output & display format string. Defaults to `"YYYY-MM-DD"`. */
  format?: string;
  placeholder?: [string, string];
  /** Called when the selected range changes. */
  onChange?: (
    dates: [NepaliDate | null, NepaliDate | null] | null,
    formattedBsStrings: [string, string],
    extra: NepaliRangeChangeExtra,
  ) => void;
  /** Shows built-in range presets (`Today`, `Yesterday`, `Last 7/14/30 Days`). Defaults to `true`. */
  showPresets?: boolean;
  disabledBefore?: string | NepaliDate | Date;
  minDate?: string | NepaliDate | Date;
  disabledAfter?: string | NepaliDate | Date;
  maxDate?: string | NepaliDate | Date;
  disableFuture?: boolean;
  disablePast?: boolean;
  showCalendarToggle?: boolean;
  calendarMode?: CalendarMode;
  defaultCalendarMode?: CalendarMode;
  onCalendarModeChange?: (calendar: CalendarMode) => void;
  toggleButtonPosition?: "right" | "left";
  bsButtonLabel?: React.ReactNode;
  adButtonLabel?: React.ReactNode;
  toggleButtonClassName?: string;
  toggleButtonStyle?: React.CSSProperties;
  toggleButtonProps?: ButtonProps;
  showDevanagari?: boolean;
  className?: string;
  style?: React.CSSProperties;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  allowClear?: boolean;
  disabled?: boolean | [boolean, boolean];
  size?: "small" | "middle" | "large";
  variant?: "outlined" | "borderless" | "filled" | "underlined";
  status?: "error" | "warning";
  theme?: ThemeConfig;
}

const toRangeTuple = (
  val:
    | [string | NepaliDate | Date | null, string | NepaliDate | Date | null]
    | null
    | undefined,
): [NepaliDate | null, NepaliDate | null] | null | undefined => {
  if (val === undefined || val === null) return val;
  return [resolveToNepaliDate(val[0]) ?? null, resolveToNepaliDate(val[1]) ?? null];
};

/**
 * Dual BS / AD RangePicker with built-in quick presets (`Today`, `Yesterday`, `Last 7/14/30 Days`),
 * Devanagari support, and full CSS/style customization.
 */
export const NewNepaliRangePicker = <FieldValues = any,>(
  props: NewNepaliRangePickerProps<FieldValues>,
): React.ReactElement => {
  const globalConfig = useNepaliDateConfig();
  const {
    formProps = {},
    withFormItem = true,
    value,
    defaultValue,
    format = "YYYY-MM-DD",
    placeholder,
    onChange,
    showPresets = true,
    disabledBefore,
    minDate,
    disabledAfter,
    maxDate,
    disableFuture = false,
    disablePast = false,
    showCalendarToggle = true,
    calendarMode: controlledCalendar,
    defaultCalendarMode = globalConfig.defaultCalendarMode ?? "BS",
    onCalendarModeChange,
    toggleButtonPosition = "right",
    bsButtonLabel = globalConfig.bsButtonLabel ?? "BS",
    adButtonLabel = globalConfig.adButtonLabel ?? "AD",
    toggleButtonClassName = globalConfig.toggleButtonClassName,
    toggleButtonStyle = globalConfig.toggleButtonStyle,
    toggleButtonProps,
    showDevanagari: showDevanagariProp,
    className,
    style,
    wrapperClassName,
    wrapperStyle,
    popupClassName,
    popupStyle,
    labelClassName,
    labelStyle,
    allowClear = true,
    disabled,
    size,
    variant,
    status,
    theme: themeProp,
  } = props;

  const showDevanagari = useShowDevanagari(showDevanagariProp);
  const [ownCalendar, setOwnCalendar] = React.useState<CalendarMode>(defaultCalendarMode);
  const calendar = controlledCalendar ?? ownCalendar;
  const nextCalendar: CalendarMode = calendar === "BS" ? "AD" : "BS";

  const setCalendar = (next: CalendarMode) => {
    setOwnCalendar(next);
    onCalendarModeChange?.(next);
  };

  const beforeDate = resolveToNepaliDate(
    disabledBefore ?? minDate ?? (disablePast ? getTodayBs() : undefined),
  );
  const afterDate = resolveToNepaliDate(
    disabledAfter ?? maxDate ?? (disableFuture ? getTodayBs() : undefined),
  );

  const disabledDate = (current: NepaliDate): boolean => {
    if (!current) return false;
    const t = current.toJsDate().getTime();
    if (beforeDate && t < beforeDate.toJsDate().getTime()) return true;
    if (afterDate && t > afterDate.toJsDate().getTime()) return true;
    return false;
  };

  const bsRangeValue = toRangeTuple(value);
  const bsRangeDefaultValue = toRangeTuple(defaultValue);

  const presets = useMemo(() => (showPresets ? getRangePresets() : undefined), [showPresets]);

  const InnerRangeControl: React.FC<{
    id?: string;
    value?: [NepaliDate | null, NepaliDate | null] | null;
    onChange?: (val: [NepaliDate | null, NepaliDate | null] | null) => void;
  }> = ({ id, value: injectedVal, onChange: injectedOnChange }) => {
    const activeVal = injectedVal !== undefined ? injectedVal : bsRangeValue;

    const emitChange = (nextTuple: [NepaliDate | null, NepaliDate | null] | null) => {
      injectedOnChange?.(nextTuple);
      if (onChange) {
        const s0 = nextTuple?.[0] ? nextTuple[0].format(format) : "";
        const s1 = nextTuple?.[1] ? nextTuple[1].format(format) : "";
        const ad0 = nextTuple?.[0] ? nextTuple[0].toJsDate() : null;
        const ad1 = nextTuple?.[1] ? nextTuple[1].toJsDate() : null;
        const adStr0 = ad0 ? (bsToAdString(nextTuple![0]!.toString()) ?? "") : "";
        const adStr1 = ad1 ? (bsToAdString(nextTuple![1]!.toString()) ?? "") : "";
        onChange(
          nextTuple,
          [s0, s1],
          {
            adDates: nextTuple ? [ad0, ad1] : null,
            formattedAdStrings: [adStr0, adStr1],
            calendarMode: calendar,
          },
        );
      }
    };

    const pickerEl =
      calendar === "BS" ? (
        <BsDatePicker.RangePicker
          id={id}
          showDevanagari={showDevanagari}
          value={activeVal as any}
          defaultValue={bsRangeDefaultValue as any}
          presets={presets}
          format={format}
          placeholder={placeholder}
          disabledDate={disabledDate}
          locale={showDevanagari ? bsPanelLocale : undefined}
          allowClear={allowClear}
          disabled={disabled}
          size={size}
          variant={variant}
          status={status}
          className={cn("midas-nepali-rangepicker w-full", className)}
          style={{ width: "100%", ...style }}
          classNames={popupClassName ? { popup: { root: popupClassName } } : undefined}
          styles={popupStyle ? { popup: { root: popupStyle } } : undefined}
          onChange={(dates) => {
            emitChange(dates ? [dates[0] ?? null, dates[1] ?? null] : null);
          }}
        />
      ) : (
        <DatePicker.RangePicker
          id={id}
          value={
            activeVal
              ? [
                  activeVal[0] ? dayjs(activeVal[0].toJsDate()) : null,
                  activeVal[1] ? dayjs(activeVal[1].toJsDate()) : null,
                ]
              : (activeVal as null | undefined)
          }
          defaultValue={
            bsRangeDefaultValue
              ? [
                  bsRangeDefaultValue[0] ? dayjs(bsRangeDefaultValue[0].toJsDate()) : null,
                  bsRangeDefaultValue[1] ? dayjs(bsRangeDefaultValue[1].toJsDate()) : null,
                ]
              : undefined
          }
          format={format}
          placeholder={placeholder}
          disabledDate={(current) => {
            const bs = toNepaliDate(current);
            return !bs || disabledDate(bs);
          }}
          allowClear={allowClear}
          disabled={disabled}
          size={size}
          variant={variant}
          status={status}
          className={cn("midas-nepali-rangepicker w-full", className)}
          style={{ width: "100%", ...style }}
          classNames={popupClassName ? { popup: { root: popupClassName } } : undefined}
          styles={popupStyle ? { popup: { root: popupStyle } } : undefined}
          onChange={(dates) => {
            emitChange(
              dates
                ? [
                    dates[0] ? toNepaliDate(dates[0]) : null,
                    dates[1] ? toNepaliDate(dates[1]) : null,
                  ]
                : null,
            );
          }}
        />
      );

    if (!showCalendarToggle) return pickerEl;

    const toggleBtn = (
      <Button
        size={size}
        disabled={Array.isArray(disabled) ? disabled[0] && disabled[1] : disabled}
        {...toggleButtonProps}
        className={cn(
          "midas-nepali-datepicker-toggle shrink-0 px-2 text-xs font-medium !bg-[color:var(--Green-Green-10)] !text-[color:var(--Green-Green-100)] hover:!bg-[color:var(--Green-Green-20)] hover:!border-[color:var(--Green-Green-80)]",
          toggleButtonClassName,
          toggleButtonProps?.className,
        )}
        style={{
          flexShrink: 0,
          paddingInline: 8,
          fontSize: 12,
          fontWeight: 500,
          backgroundColor: "var(--Green-Green-10, #e6f4ea)",
          color: "var(--Green-Green-100, #137333)",
          ...toggleButtonStyle,
          ...toggleButtonProps?.style,
        }}
        onClick={(e) => {
          toggleButtonProps?.onClick?.(e);
          setCalendar(nextCalendar);
        }}
      >
        {calendar === "BS" ? bsButtonLabel : adButtonLabel}
      </Button>
    );

    return (
      <Space.Compact
        className={cn("midas-nepali-rangepicker-wrapper w-full", wrapperClassName)}
        style={{ width: "100%", ...wrapperStyle }}
      >
        {toggleButtonPosition === "left" && toggleBtn}
        {pickerEl}
        {toggleButtonPosition === "right" && toggleBtn}
      </Space.Compact>
    );
  };

  const { colon = false, validateFirst = true, labelCol = {}, label, ...restFormProps } = formProps;

  return (
    <ConfigProvider theme={themeProp ?? globalConfig.theme}>
      {withFormItem ? (
        <Form.Item
          {...restFormProps}
          label={
            label && (
              <span
                className={cn(
                  "justify-center text-[#1e1e1eb3] text-xs font-medium",
                  labelClassName,
                )}
                style={labelStyle}
              >
                {label}
              </span>
            )
          }
          colon={colon}
          validateFirst={validateFirst}
          labelCol={{ ...labelCol }}
          getValueProps={(val: any) => ({
            value: Array.isArray(val) ? toRangeTuple(val as any) : val,
          })}
          normalize={(val: [NepaliDate | null, NepaliDate | null] | null) =>
            val ? [val[0] ? val[0].format(format) : null, val[1] ? val[1].format(format) : null] : null
          }
        >
          <InnerRangeControl />
        </Form.Item>
      ) : (
        <InnerRangeControl />
      )}
    </ConfigProvider>
  );
};

// Re-export adToBsString / bsToAdString convenience references
export { adToBsString, bsToAdString };
