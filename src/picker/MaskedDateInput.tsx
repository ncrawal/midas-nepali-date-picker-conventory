import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { toEnglishNumerals, toNepaliNumerals } from "../date-utils/index.js";
import { useShowDevanagari } from "./context.js";

const PLACEHOLDER = "YYYY-MM-DD";

const SEGMENTS = [
  { start: 0, end: 4 }, // YYYY
  { start: 5, end: 7 }, // MM
  { start: 8, end: 10 }, // DD
];

function getSegmentIndex(pos: number): number {
  return SEGMENTS.findIndex((s) => pos >= s.start && pos <= s.end);
}

// Accepts Devanagari digits too (typed, pasted, or read back from a Nepali display).
function applyMask(raw: string): string {
  const digits = toEnglishNumerals(String(raw ?? ""))
    .replace(/\D/g, "")
    .slice(0, 8);
  const out = PLACEHOLDER.split("");
  let i = 0;
  for (let p = 0; p < 4 && i < digits.length; p++) out[p] = digits[i++];
  for (let p = 5; p < 7 && i < digits.length; p++) out[p] = digits[i++];
  for (let p = 8; p < 10 && i < digits.length; p++) out[p] = digits[i++];
  return out.join("");
}

export interface MaskedDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** When true, displays Devanagari numerals if `showDevanagari` is enabled. */
  nepaliNumerals?: boolean;
  /** Overrides the context `showDevanagari` setting for this input. */
  showDevanagari?: boolean;
}

export const MaskedDateInput = forwardRef<HTMLInputElement, MaskedDateInputProps>((props, ref) => {
  const {
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    nepaliNumerals,
    showDevanagari: showDevanagariProp,
    ...rest
  } = props;

  const showDevanagari = useShowDevanagari(showDevanagariProp);

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const display = value ? applyMask(String(value)) : "";

  const emit = (next: string) => {
    onChange?.({
      target: { value: next },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = applyMask(e.target.value);
    emit(next);

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const d = next.replace(/\D/g, "").length;
      let cursor = 0;
      if (d <= 4) cursor = d;
      else if (d <= 6) cursor = 5 + (d - 4);
      else cursor = 8 + (d - 6);
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = inputRef.current;
    if (!el) {
      onKeyDown?.(e);
      return;
    }

    const { selectionStart, selectionEnd } = el;
    const pos = selectionStart ?? 0;
    const current = display;

    if (e.key === "Backspace") {
      e.preventDefault();

      if (selectionStart !== selectionEnd) {
        const next =
          current.slice(0, selectionStart!) +
          PLACEHOLDER.slice(selectionStart!, selectionEnd!) +
          current.slice(selectionEnd!);
        emit(applyMask(next));
        requestAnimationFrame(() => el.setSelectionRange(selectionStart!, selectionStart!));
        return;
      }

      const segIdx = getSegmentIndex(pos);
      if (segIdx === -1) return;

      const seg = SEGMENTS[segIdx];
      const segDigits = current.slice(seg.start, seg.end).replace(/\D/g, "");
      const allDigits = current.replace(/\D/g, "");

      if (segDigits.length > 0) {
        emit(applyMask(allDigits.slice(0, -1)));
        requestAnimationFrame(() => {
          const newPos = Math.max(seg.start, pos - 1);
          el.setSelectionRange(newPos, newPos);
        });
      } else if (segIdx > 0) {
        const prev = SEGMENTS[segIdx - 1];
        emit(applyMask(allDigits.slice(0, -1)));
        requestAnimationFrame(() => el.setSelectionRange(prev.end, prev.end));
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const segIdx = getSegmentIndex(pos);
      if (segIdx === -1) return;
      const nextIdx =
        e.key === "ArrowLeft" ? Math.max(0, segIdx - 1) : Math.min(SEGMENTS.length - 1, segIdx + 1);
      const t = SEGMENTS[nextIdx];
      requestAnimationFrame(() => el.setSelectionRange(t.start, t.end));
      return;
    }

    onKeyDown?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => e.target.setSelectionRange(0, 4));
    onFocus?.(e);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      // Display only: the picker always reads and writes ASCII text, so parsing and the form value are unaffected.
      value={nepaliNumerals && showDevanagari ? toNepaliNumerals(display) : display}
      placeholder={PLACEHOLDER}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={onBlur}
    />
  );
});

MaskedDateInput.displayName = "MaskedDateInput";

/** MaskedDateInput showing Devanagari digits (when `showDevanagari` is active), for the BS picker. */
export const NepaliMaskedDateInput = forwardRef<HTMLInputElement, MaskedDateInputProps>(
  (props, ref) => <MaskedDateInput {...props} ref={ref} nepaliNumerals />,
);

NepaliMaskedDateInput.displayName = "NepaliMaskedDateInput";
