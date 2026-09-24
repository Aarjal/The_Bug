import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "light");
  const [effectiveTheme, setEffectiveTheme] = useState("light");

  const setTheme = (selectedTheme) => {
    setThemeState(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  useEffect(() => {
    setEffectiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
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
