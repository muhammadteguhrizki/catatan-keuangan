import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/ThemeProvider";

const actions = [
  {
    id: "income",
    label: "Pemasukan",
    icon: "arrow-down" as const,
    color: "#20D99A",
    background: "#123C36",
    lightColor: "#16A36A",
    lightBackground: "#DDF7E9",
  },
  {
    id: "expense",
    label: "Pengeluaran",
    icon: "arrow-up" as const,
    color: "#FB7185",
    background: "#402630",
    lightColor: "#E34D62",
    lightBackground: "#FCE4E7",
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: "swap-horizontal" as const,
    color: "#60A5FA",
    background: "#193B60",
    lightColor: "#3478D4",
    lightBackground: "#E0EDFF",
  },
  {
    id: "category",
    label: "Kategori",
    icon: "grid" as const,
    color: "#C084FC",
    background: "#39264F",
    lightColor: "#8747D8",
    lightBackground: "#F0E5FF",
  },
];

type QuickActionsProps = {
  onAction: (action: string) => void;
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  const { isDark } = useAppTheme();

  return (
    <View className="mt-5 flex-row gap-2">
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => onAction(action.id)}
          className="flex-1 items-center justify-center rounded-2xl py-3"
          style={{
            backgroundColor: isDark ? "#151B2B" : "#FFFFFF",
          }}
        >
          <View
            className="mb-2 h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? action.background
                : action.lightBackground,
            }}
          >
            <Ionicons
              name={action.icon}
              size={23}
              color={isDark ? action.color : action.lightColor}
            />
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: isDark ? "#FFFFFF" : "#171725",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
