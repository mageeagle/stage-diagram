"use client";

import { useEffect, useRef } from "react";

interface ColorInputProps {
  value: string;
  onCommit: (hex: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function ColorInput({
  value,
  onCommit,
  className,
  ariaLabel,
}: ColorInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  // Uncontrolled on purpose: a controlled color input makes React write back
  // `input.value` on every intermediate change, which fights the browser's
  // native picker and causes horrible lag while dragging. Left uncontrolled,
  // React never touches the value during the drag, so the picker stays smooth.
  // We read the value off the DOM node only when the pick ends.
  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const v = el.value;
    if (v && v !== value.toLowerCase()) onCommit(v);
  };

  // Reflect external value changes (import/reset/other edits) into the swatch
  // without going through React's controlled-input reconciliation.
  useEffect(() => {
    if (ref.current) ref.current.value = value;
  }, [value]);

  return (
    <input
      ref={ref}
      type="color"
      defaultValue={value}
      onPointerUp={commit}
      onKeyUp={commit}
      onBlur={commit}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
