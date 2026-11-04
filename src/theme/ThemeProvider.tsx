import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useColorScheme } from "nativewind";
import { Colors, ThemeMode } from "./index";

type AppThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.dark;
  setMode: (mode: ThemeMode) => void;
};

const AppThemeContext = createContext<AppThemeContextType | undefined>(
  undefined,
);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  const isDark = colorScheme === "dark";

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
      setMode: setModeState,
    }),
    [mode, isDark],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme harus digunakan di dalam AppThemeProvider");
  }

  return context;
}
