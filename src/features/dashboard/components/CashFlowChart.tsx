import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import AppCard from "../../../components/ui/AppCard";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { formatRupiah } from "../../../utils/currency";

export type ExpenseCategory = {
  label: string;
  amount: number;
  color: string;
};

type CashFlowChartProps = {
  data: ExpenseCategory[];
};

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const { colors } = useAppTheme();

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const radius = 55;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <View style={{ marginTop: 28 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Grafik Pengeluaran
        </Text>

        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          Bulan ini
        </Text>
      </View>

      <AppCard className="p-5">
        {total > 0 ? (
          <View className="flex-row items-center gap-3">
            {/* DONUT CHART */}
            <View
              style={{
                width: "48%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg width="100%" height={160} viewBox="0 0 150 150">
                <Circle
                  cx="75"
                  cy="75"
                  r={radius}
                  stroke={colors.border}
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {data.map((item, index) => {
                  const percentage = item.amount / total;
                  const segmentLength = percentage * circumference;
                  const offset = accumulated;

                  accumulated += segmentLength;

                  return (
                    <Circle
                      key={`${item.label}-${index}`}
                      cx="75"
                      cy="75"
                      r={radius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                      fill="none"
                      transform="rotate(-90 75 75)"
                    />
                  );
                })}
              </Svg>

              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "90%",
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 10,
                  }}
                >
                  Total
                </Text>

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: "bold",
                    marginTop: 3,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatRupiah(total)}
                </Text>
              </View>
            </View>

            {/* CATEGORY LEGEND */}
            <View style={{ flex: 1, gap: 15 }}>
              {data.map((item, index) => {
                const percentage = (item.amount / total) * 100;

                return (
                  <View
                    key={`${item.label}-${index}`}
                    className="flex-row items-center justify-between"
                  >
                    <View
                      className="flex-1 flex-row items-center"
                      style={{ marginRight: 5 }}
                    >
                      <View
                        className="mr-2 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />

                      <Text
                        numberOfLines={1}
                        className="text-xs"
                        style={{ color: colors.text }}
                      >
                        {item.label}
                      </Text>
                    </View>

                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.text }}
                    >
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View
            style={{
              minHeight: 150,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 20,
            }}
          >
            <View
              className="mb-3 h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <Ionicons
                name="pie-chart-outline"
                size={23}
                color={colors.textSecondary}
              />
            </View>

            <Text
              className="text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Belum ada data pengeluaran
            </Text>

            <Text
              className="mt-1 text-center text-xs"
              style={{ color: colors.textSecondary }}
            >
              Transaksi pengeluaran akan muncul di sini.
            </Text>
          </View>
        )}
      </AppCard>
    </View>
  );
}
