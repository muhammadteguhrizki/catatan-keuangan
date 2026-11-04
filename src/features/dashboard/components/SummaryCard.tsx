import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import AppCard from "../../../components/ui/AppCard";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { formatRupiah } from "../../../utils/currency";

type SummaryCardProps = {
  type: "income" | "expense";
  amount: number;
  percentage?: number;
};

export default function SummaryCard({
  type,
  amount,
  percentage,
}: SummaryCardProps) {
  const { colors } = useAppTheme();

  const isIncome = type === "income";

  const accentColor = isIncome ? colors.income : colors.expense;

  return (
    <AppCard className="flex-1">
      <View className="flex-row items-center justify-between">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Ionicons
            name={isIncome ? "arrow-down-outline" : "arrow-up-outline"}
            size={21}
            color={accentColor}
          />
        </View>

        <Text
          className="text-xs font-medium"
          style={{ color: colors.textSecondary }}
        >
          {isIncome ? "Pemasukan" : "Pengeluaran"}
        </Text>
      </View>

      <Text
        className="mt-4 text-lg font-bold"
        style={{ color: colors.text }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatRupiah(amount)}
      </Text>

      {percentage !== undefined && (
        <Text className="mt-2 text-xs" style={{ color: accentColor }}>
          {percentage}% dari bulan ini
        </Text>
      )}
    </AppCard>
  );
}
