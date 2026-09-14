import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

function resolveSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "system");
  const [effectiveTheme, setEffectiveTheme] = useState("light");

  const setTheme = (selectedTheme) => {
    setThemeState(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncDOMTheme = () => {
      const activeTheme = theme === "system" ? resolveSystemTheme() : theme;
      setEffectiveTheme(activeTheme);
      document.documentElement.setAttribute("data-theme", activeTheme);
    };

    syncDOMTheme();

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        syncDOMTheme();
      }
    };

    colorSchemeQuery.addEventListener("change", handleSystemThemeChange);
    return () => colorSchemeQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
