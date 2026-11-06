import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import "../../global.css";

// import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AppThemeProvider } from "../theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function prepareDatabase() {
      try {
        // Menggunakan database.native.ts di Android
        // dan database.web.ts di browser
        const { initializeDatabase } = await import("../database/database");

        await initializeDatabase();

        console.log("Database berhasil diinisialisasi");
      } catch (error) {
        console.error("Gagal menginisialisasi database:", error);
      } finally {
        if (mounted) {
          setDatabaseReady(true);
          await SplashScreen.hideAsync();
        }
      }
    }

    prepareDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  if (!databaseReady) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* <AnimatedSplashOverlay /> */}
        <AppTabs />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
