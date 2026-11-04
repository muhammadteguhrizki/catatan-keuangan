import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const actions = [
  {
    id: "income",
    label: "Pemasukan",
    icon: "arrow-down" as const,
    color: "#20D99A",
    background: "#123C36",
  },
  {
    id: "expense",
    label: "Pengeluaran",
    icon: "arrow-up" as const,
    color: "#FB7185",
    background: "#402630",
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: "swap-horizontal" as const,
    color: "#60A5FA",
    background: "#193B60",
  },
  {
    id: "category",
    label: "Kategori",
    icon: "grid" as const,
    color: "#C084FC",
    background: "#39264F",
  },
];

type QuickActionsProps = {
  onAction: (action: string) => void;
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <View className="mt-5 flex-row gap-2">
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => onAction(action.id)}
          className="flex-1 items-center justify-center rounded-2xl py-3"
          style={{ backgroundColor: "#151B2B" }}
        >
          <View
            className="mb-2 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: action.background }}
          >
            <Ionicons name={action.icon} size={23} color={action.color} />
          </View>

          <Text
            numberOfLines={1}
            style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "600" }}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
