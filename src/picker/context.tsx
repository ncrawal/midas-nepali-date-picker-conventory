import type { ThemeConfig } from "antd";
import React, { createContext, useContext, useMemo } from "react";

export type CalendarMode = "BS" | "AD";

export interface NepaliDateConfig {
  /**
   * When `true`, BS calendar panels and inputs render Devanagari numerals/labels
   * and dual BS/AD cell numbers. Defaults to `false`.
   */
  showDevanagari?: boolean;
  /**
   * When `true`, renders the secondary calendar day number in the top-right corner
   * of each date cell (AD day in BS mode, BS day in AD mode) even when `showDevanagari` is `false`.
   * Defaults to matching `showDevanagari`.
   */
  showSecondaryDate?: boolean;
  /**
   * When `true`, highlights Saturdays (Nepali weekly holiday) in red across calendar cells.
   * Defaults to `false`.
   */
  highlightSaturday?: boolean;
  /**
   * Default calendar mode for `NewNepaliDatePicker` and `NewNepaliRangePicker`
   * when `calendarMode` is not controlled. Defaults to `"BS"`.
   */
  defaultCalendarMode?: CalendarMode;
  /** Custom label for the toggle button when in BS mode. Defaults to `"BS"`. */
  bsButtonLabel?: React.ReactNode;
  /** Custom label for the toggle button when in AD mode. Defaults to `"AD"`. */
  adButtonLabel?: React.ReactNode;
  /** Global default inline style for the BS/AD toggle button. */
  toggleButtonStyle?: React.CSSProperties;
  /** Global default CSS class name for the BS/AD toggle button. */
  toggleButtonClassName?: string;
  /** Global Ant Design `ConfigProvider` theme overrides for the date pickers. */
  theme?: ThemeConfig;
}

const DEFAULT_CONFIG: NepaliDateConfig = {
  showDevanagari: false,
  showSecondaryDate: undefined,
  highlightSaturday: false,
  defaultCalendarMode: "BS",
  bsButtonLabel: "BS",
  adButtonLabel: "AD",
};

const NepaliDateConfigContext = createContext<NepaliDateConfig>(DEFAULT_CONFIG);

export interface NepaliDateConfigProviderProps extends NepaliDateConfig {
  children: React.ReactNode;
}

/**
 * Optional provider to configure appearance, Devanagari numerals, Saturday highlighting,
 * toggle button styles, and Ant Design theme globally across all date picker components.
 *
 * @example
 * <NepaliDateConfigProvider
 *   showDevanagari={true}
 *   highlightSaturday={true}
 *   bsButtonLabel="वि.सं."
 *   adButtonLabel="AD"
 * >
 *   <App />
 * </NepaliDateConfigProvider>
 */
export const NepaliDateConfigProvider: React.FC<NepaliDateConfigProviderProps> = ({
  showDevanagari = false,
  showSecondaryDate,
  highlightSaturday = false,
  defaultCalendarMode = "BS",
  bsButtonLabel = "BS",
  adButtonLabel = "AD",
  toggleButtonStyle,
  toggleButtonClassName,
  theme,
  children,
}) => {
  const value = useMemo<NepaliDateConfig>(
    () => ({
      showDevanagari,
      showSecondaryDate,
      highlightSaturday,
      defaultCalendarMode,
      bsButtonLabel,
      adButtonLabel,
      toggleButtonStyle,
      toggleButtonClassName,
      theme,
    }),
    [
      showDevanagari,
      showSecondaryDate,
      highlightSaturday,
      defaultCalendarMode,
      bsButtonLabel,
      adButtonLabel,
      toggleButtonStyle,
      toggleButtonClassName,
      theme,
    ],
  );
  return (
    <NepaliDateConfigContext.Provider value={value}>
      {children}
    </NepaliDateConfigContext.Provider>
  );
};

export const useNepaliDateConfig = (): NepaliDateConfig => useContext(NepaliDateConfigContext);

export const useShowDevanagari = (override?: boolean): boolean => {
  const { showDevanagari } = useNepaliDateConfig();
  return override !== undefined ? override : Boolean(showDevanagari);
};
