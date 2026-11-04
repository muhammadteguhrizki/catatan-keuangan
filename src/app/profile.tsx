import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppCard from "../components/ui/AppCard";
import { useAppTheme } from "../theme/ThemeProvider";

const settings = [
  {
    title: "Informasi Akun",
    subtitle: "Kelola nama dan informasi pribadi",
    icon: "person-outline" as const,
  },
  {
    title: "Pengaturan Tampilan",
    subtitle: "Tema dan tampilan aplikasi",
    icon: "color-palette-outline" as const,
  },
  {
    title: "Mata Uang",
    subtitle: "Rupiah (IDR)",
    icon: "cash-outline" as const,
  },
  {
    title: "Keamanan & Privasi",
    subtitle: "Pengaturan keamanan akun",
    icon: "shield-checkmark-outline" as const,
  },
  {
    title: "Notifikasi",
    subtitle: "Atur pemberitahuan aplikasi",
    icon: "notifications-outline" as const,
  },
  {
    title: "Tentang Aplikasi",
    subtitle: "Informasi Personal Finance",
    icon: "information-circle-outline" as const,
  },
];

export default function ProfileScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 430,
          alignSelf: "center",
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 35,
        }}
      >
        {/* HEADER */}
        <Text
          className="mb-6 text-2xl font-bold"
          style={{ color: colors.text }}
        >
          Profil
        </Text>

        {/* PROFILE CARD */}
        <AppCard className="items-center py-6">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="person" size={38} color="#FFFFFF" />
          </View>

          <Text
            className="mt-4 text-xl font-bold"
            style={{ color: colors.text }}
          >
            Teguh
          </Text>

          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Pengguna Personal Finance
          </Text>

          <Pressable
            className="mt-4 flex-row items-center rounded-full px-5 py-2.5"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text
              className="ml-2 text-xs font-semibold"
              style={{ color: colors.primary }}
            >
              Edit Profil
            </Text>
          </Pressable>
        </AppCard>

        {/* ACCOUNT SUMMARY */}
        <View className="mb-3 mt-7">
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Pengaturan Akun
          </Text>
        </View>

        <AppCard className="p-1">
          {settings.map((item, index) => (
            <Pressable
              key={item.title}
              className="flex-row items-center px-3 py-4"
              style={{
                borderBottomWidth: index === settings.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surfaceSecondary }}
              >
                <Ionicons name={item.icon} size={21} color={colors.primary} />
              </View>

              <View className="flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.text }}
                >
                  {item.title}
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </AppCard>

        {/* APP VERSION */}
        <View className="mt-7 items-center">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Personal Finance
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
