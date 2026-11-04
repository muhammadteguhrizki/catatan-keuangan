import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import "../../global.css";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AppThemeProvider } from "../theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === "web") return;

    import("../database/database.web")
      .then(({ initializeDatabase }) => initializeDatabase())
      .then(() => {
        console.log("Database berhasil diinisialisasi");
      })
      .catch((error) => {
        console.error("Gagal menginisialisasi database:", error);
      });
  }, []);

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
