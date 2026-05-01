"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TextSize = "1" | "1.15" | "1.3";
export type Contrast = "normal" | "high";
export type ReducedMotion = "auto" | "on" | "off";

type AccessibilityContextValue = {
  textSize: TextSize;
  contrast: Contrast;
  reducedMotion: ReducedMotion;
  setTextSize: (v: TextSize) => void;
  setContrast: (v: Contrast) => void;
  setReducedMotion: (v: ReducedMotion) => void;
};

const AccessibilityContext = createContext<
  AccessibilityContextValue | undefined
>(undefined);

function readStorage<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[],
): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return (allowed as readonly string[]).includes(raw ?? "")
    ? (raw as T)
    : fallback;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("1");
  const [contrast, setContrastState] = useState<Contrast>("normal");
  const [reducedMotion, setReducedMotionState] =
    useState<ReducedMotion>("auto");

  // Read persisted prefs on first client render. For contrast, when nothing
  // is stored we fall back to the OS-level "Increase Contrast" preference
  // (prefers-contrast: more) so users who set it system-wide get high
  // contrast automatically without flipping the in-app toggle.
  useEffect(() => {
    setTextSizeState(
      readStorage("textSize", "1", ["1", "1.15", "1.3"] as const),
    );

    const storedContrast = localStorage.getItem("contrast");
    if (storedContrast === "high" || storedContrast === "normal") {
      setContrastState(storedContrast);
    } else if (window.matchMedia("(prefers-contrast: more)").matches) {
      setContrastState("high");
    }

    setReducedMotionState(
      readStorage("reducedMotion", "auto", ["auto", "on", "off"] as const),
    );
  }, []);

  // Follow OS-level prefers-contrast changes only while the user has not
  // made an explicit in-app choice (no localStorage entry).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-contrast: more)");
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("contrast") === null) {
        setContrastState(e.matches ? "high" : "normal");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Reflect current prefs onto <html> data attributes and <body> font-size
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.textSize = textSize;
    html.dataset.contrast = contrast;
    html.dataset.reducedMotion = reducedMotion;
    // Body font-size scales elements that inherit from body; rem values scale
    // via CSS rules targeting [data-text-size] on <html>.
    document.documentElement.style.fontSize =
      textSize === "1" ? "" : `${parseFloat(textSize) * 100}%`;
    document.body.style.fontSize = textSize === "1" ? "" : `${textSize}rem`;
  }, [textSize, contrast, reducedMotion]);

  const setTextSize = useCallback((v: TextSize) => {
    setTextSizeState(v);
    localStorage.setItem("textSize", v);
  }, []);

  const setContrast = useCallback((v: Contrast) => {
    setContrastState(v);
    localStorage.setItem("contrast", v);
  }, []);

  const setReducedMotion = useCallback((v: ReducedMotion) => {
    setReducedMotionState(v);
    localStorage.setItem("reducedMotion", v);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        contrast,
        reducedMotion,
        setTextSize,
        setContrast,
        setReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used inside AccessibilityProvider.",
    );
  }
  return context;
}
