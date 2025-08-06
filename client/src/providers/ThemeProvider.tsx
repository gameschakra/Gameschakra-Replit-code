import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "dark";

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always dark theme
  const theme: Theme = "dark";

  useEffect(() => {
    // Always ensure dark mode is applied
    document.documentElement.classList.add("dark");
    
    // Save to localStorage to maintain consistency
    localStorage.setItem("theme", theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
