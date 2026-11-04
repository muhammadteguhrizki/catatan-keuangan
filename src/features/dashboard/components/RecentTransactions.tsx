import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import AppCard from "../../../components/ui/AppCard";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { formatRupiah } from "../../../utils/currency";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  icon: keyof typeof Ionicons.glyphMap;
};

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View className="mt-6 mb-5">
      {/* HEADER */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Transaksi Terbaru
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            Riwayat aktivitas keuangan kamu
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/transactions")}
          className="flex-row items-center"
          hitSlop={10}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.primary }}
          >
            Lihat Semua
          </Text>

          <Ionicons
            name="chevron-forward"
            size={15}
            color={colors.primary}
            style={{ marginLeft: 3 }}
          />
        </Pressable>
      </View>

      {/* TRANSACTION LIST */}
      <AppCard className="p-1">
        {transactions.length === 0 ? (
          <View className="items-center py-9">
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Ionicons
                name="receipt-outline"
                size={27}
                color={colors.textSecondary}
              />
            </View>

            <Text
              className="mt-3 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Belum ada transaksi
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Transaksi kamu akan muncul di sini.
            </Text>
          </View>
        ) : (
          transactions.map((item, index) => {
            const isIncome = item.type === "income";
            const accentColor = isIncome ? colors.income : colors.expense;

            const iconBackground = isIncome ? "#123C36" : "#402630";

            return (
              <View
                key={item.id}
                className="flex-row items-center px-3 py-4"
                style={{
                  borderBottomWidth: index === transactions.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                {/* ICON */}
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: iconBackground }}
                >
                  <Ionicons name={item.icon} size={21} color={accentColor} />
                </View>

                {/* TRANSACTION INFO */}
                <View className="ml-3 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {item.title}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.category}
                  </Text>
                </View>

                {/* AMOUNT */}
                <View className="items-end ml-2">
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className="text-sm font-bold"
                    style={{ color: accentColor }}
                  >
                    {isIncome ? "+" : "-"}
                    {formatRupiah(item.amount)}
                  </Text>

                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.date}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </AppCard>
    </View>
  );
}
