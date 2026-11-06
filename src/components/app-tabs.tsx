import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";

const menu = [
  { name: "index", label: "Beranda", icon: "home-outline", activeIcon: "home" },
  {
    name: "transactions",
    label: "Transaksi",
    icon: "swap-horizontal-outline",
    activeIcon: "swap-horizontal",
  },
  {
    name: "add",
    label: "Tambah",
    icon: "add-circle-outline",
    activeIcon: "add-circle",
  },
  {
    name: "budget",
    label: "Anggaran",
    icon: "calendar-outline",
    activeIcon: "calendar",
  },
  {
    name: "profile",
    label: "Profil",
    icon: "person-outline",
    activeIcon: "person",
  },
] as const;

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const theme = {
    background: isDark ? "#090D18" : "#F7F7FC",
    tabBackground: isDark ? "#111827" : "#FFFFFF",
    border: isDark ? "#293247" : "#E8E8F0",
    active: isDark ? "#A78BFA" : "#7C3AED",
    inactive: isDark ? "#94A3B8" : "#9292A3",
    addButton: "#8B5CF6",
    addIcon: "#FFFFFF",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View
        style={[
          styles.outer,
          {
            paddingBottom: insets.bottom,
            backgroundColor: theme.tabBackground,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View style={styles.tabBar}>
          {menu.map((item) => {
            const active =
              item.name === "index"
                ? pathname === "/"
                : pathname.startsWith(`/${item.name}`);

            const isAdd = item.name === "add";

            return (
              <Pressable
                key={item.name}
                onPress={() =>
                  router.push(
                    item.name === "index" ? "/" : (`/${item.name}` as any),
                  )
                }
                style={styles.tabButton}
              >
                {isAdd ? (
                  <View
                    style={[
                      styles.addButton,
                      { backgroundColor: theme.addButton },
                    ]}
                  >
                    <Ionicons name="add" size={30} color={theme.addIcon} />
                  </View>
                ) : (
                  <>
                    <Ionicons
                      name={active ? item.activeIcon : item.icon}
                      size={23}
                      color={active ? theme.active : theme.inactive}
                    />

                    <Text
                      style={[
                        styles.label,
                        { color: active ? theme.active : theme.inactive },
                        active && styles.activeLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  outer: {
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
  },
  tabBar: {
    width: "100%",
    maxWidth: 430,
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  tabButton: {
    flex: 1,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  label: {
    fontSize: 10,
  },
  activeLabel: {
    fontWeight: "700",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
