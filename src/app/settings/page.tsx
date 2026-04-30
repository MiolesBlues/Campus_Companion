"use client";

import { useState, useCallback } from "react";
import { useAccessibility } from "@/components/AccessibilityProvider";
import type { TextSize, Contrast, ReducedMotion } from "@/components/AccessibilityProvider";

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; detail: string }[] = [
  { value: "1", label: "Normal", detail: "Default size (16 px base)" },
  { value: "1.15", label: "Large", detail: "Slightly larger (≈18 px base)" },
  { value: "1.3", label: "Extra large", detail: "Largest size (≈21 px base)" },
];

const MOTION_OPTIONS: { value: ReducedMotion; label: string; detail: string }[] = [
  {
    value: "auto",
    label: "Match my device",
    detail: "Respects your operating system's motion preference",
  },
  {
    value: "on",
    label: "Always reduce motion",
    detail: "Disables all animations and transitions",
  },
  {
    value: "off",
    label: "Always allow motion",
    detail: "Shows animations regardless of OS setting",
  },
];

export default function SettingsPage() {
  const { textSize, contrast, reducedMotion, setTextSize, setContrast, setReducedMotion } =
    useAccessibility();

  const [liveText, setLiveText] = useState("");

  const announce = useCallback(() => {
    // Clear first so screen readers re-announce if the same text is already present
    setLiveText("");
    setTimeout(() => setLiveText("Settings updated"), 50);
  }, []);

  function handleTextSize(v: TextSize) {
    setTextSize(v);
    announce();
  }

  function handleContrast(checked: boolean) {
    setContrast(checked ? "high" : "normal");
    announce();
  }

  function handleReducedMotion(v: ReducedMotion) {
    setReducedMotion(v);
    announce();
  }

  return (
    <section className="space-y-8">
      {/* Polite live region — announces "Settings updated" after every change */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>

      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Preferences
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Accessibility settings</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Adjust these settings to make Campus Companion more comfortable to use.
            All changes are saved automatically and persist on refresh.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Text size ────────────────────────────────────────────────────── */}
        <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <legend className="px-1 text-base font-semibold text-slate-900">
            Text size
          </legend>
          <p id="text-size-hint" className="mt-1 text-sm text-slate-500">
            Adjusts the base font size across the whole app.
          </p>
          <div className="mt-4 space-y-3" role="radiogroup" aria-labelledby="text-size-legend">
            {TEXT_SIZE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start gap-3">
                <input
                  type="radio"
                  id={`text-size-${option.value}`}
                  name="text-size"
                  value={option.value}
                  checked={textSize === option.value}
                  onChange={() => handleTextSize(option.value)}
                  aria-describedby="text-size-hint"
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <label
                  htmlFor={`text-size-${option.value}`}
                  className="cursor-pointer text-sm text-slate-700"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-2 text-slate-400">{option.detail}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        {/* ── High contrast ────────────────────────────────────────────────── */}
        <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <legend className="px-1 text-base font-semibold text-slate-900">
            Colour contrast
          </legend>
          <p id="contrast-hint" className="mt-1 text-sm text-slate-500">
            Switches to a true black and white palette for maximum readability.
          </p>
          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="high-contrast"
              checked={contrast === "high"}
              onChange={(e) => handleContrast(e.target.checked)}
              aria-describedby="contrast-hint"
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <label
              htmlFor="high-contrast"
              className="cursor-pointer text-sm font-medium text-slate-700"
            >
              Enable high contrast
            </label>
          </div>
        </fieldset>

        {/* ── Reduced motion ───────────────────────────────────────────────── */}
        <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <legend className="px-1 text-base font-semibold text-slate-900">
            Reduced motion
          </legend>
          <p id="reduced-motion-hint" className="mt-1 text-sm text-slate-500">
            Controls whether animations and transitions play.
          </p>
          <div className="mt-4 space-y-3">
            {MOTION_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start gap-3">
                <input
                  type="radio"
                  id={`reduced-motion-${option.value}`}
                  name="reduced-motion"
                  value={option.value}
                  checked={reducedMotion === option.value}
                  onChange={() => handleReducedMotion(option.value)}
                  aria-describedby="reduced-motion-hint"
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <label
                  htmlFor={`reduced-motion-${option.value}`}
                  className="cursor-pointer text-sm text-slate-700"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-2 text-slate-400">{option.detail}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
