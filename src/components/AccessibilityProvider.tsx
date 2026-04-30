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

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined
);

function readStorage<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[]
): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return (allowed as readonly string[]).includes(raw ?? "") ? (raw as T) : fallback;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("1");
  const [contrast, setContrastState] = useState<Contrast>("normal");
  const [reducedMotion, setReducedMotionState] = useState<ReducedMotion>("auto");

  // Read persisted prefs on first client render
  useEffect(() => {
    setTextSizeState(readStorage("textSize", "1", ["1", "1.15", "1.3"] as const));
    setContrastState(readStorage("contrast", "normal", ["normal", "high"] as const));
    setReducedMotionState(
      readStorage("reducedMotion", "auto", ["auto", "on", "off"] as const)
    );
  }, []);

  // Reflect current prefs onto <html> data attributes and <body> font-size
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.textSize = textSize;
    html.dataset.contrast = contrast;
    html.dataset.reducedMotion = reducedMotion;
    // Body font-size scales elements that inherit from body; rem values scale
    // via CSS rules targeting [data-text-size] on <html>.
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
      value={{ textSize, contrast, reducedMotion, setTextSize, setContrast, setReducedMotion }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used inside AccessibilityProvider.");
  }
  return context;
}
