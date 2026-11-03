import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode") || localStorage.getItem("theme");
    if (saved === "dark" || saved === "light" || saved === "system") {
      return saved as ThemeMode;
    }
    return "system";
  });

  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === "system") return getSystemTheme();
    return themeMode;
  });

  // Apply theme to DOM and meta tags with zero flicker
  const applyTheme = useCallback((targetTheme: ResolvedTheme) => {
    const root = window.document.documentElement;

    // Temporarily disable CSS transitions to prevent color flicker across DOM
    root.classList.add("no-transitions");

    root.classList.remove("light", "dark");
    root.classList.add(targetTheme);
    root.style.colorScheme = targetTheme;

    // Update meta theme-color for browser chrome and Android status bars
    const metaThemeColor = document.getElementById("meta-theme-color") || document.querySelector('meta[name="theme-color"]');
    const colorValue = targetTheme === "dark" ? "#0B1220" : "#F8FAFC";
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colorValue);
    }

    setResolvedTheme(targetTheme);

    // Re-enable transitions after one paint frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("no-transitions");
      });
    });
  }, []);

  // Handle system preference changes when in 'system' mode
  useEffect(() => {
    if (themeMode !== "system") {
      applyTheme(themeMode);
      return;
    }

    const currentSys = getSystemTheme();
    applyTheme(currentSys);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (themeMode === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themeMode, applyTheme, getSystemTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("theme-mode", mode);
    localStorage.setItem("theme", mode === "system" ? getSystemTheme() : mode);
  };

  const toggleTheme = () => {
    // Cycle: light -> dark -> system -> light
    if (themeMode === "light") {
      setThemeMode("dark");
    } else if (themeMode === "dark") {
      setThemeMode("system");
    } else {
      setThemeMode("light");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
