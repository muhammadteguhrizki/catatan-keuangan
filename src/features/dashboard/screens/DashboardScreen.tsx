import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import ScreenContainer from "../../../components/layout/ScreenContainer";
import { getTransactions } from "../../../database/repositories/transactionRepository";
import type { Transaction } from "../../../database/types";
import { useAppTheme } from "../../../theme/ThemeProvider";

import BalanceCard from "../components/BalanceCard";
import CashFlowChart from "../components/CashFlowChart";
import QuickActions from "../components/QuickActions";
import RecentTransactions from "../components/RecentTransactions";
import SummaryCard from "../components/SummaryCard";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const chartColors = [
  "#8B5CF6",
  "#14B8A6",
  "#F59E0B",
  "#3B82F6",
  "#F87171",
  "#EC4899",
  "#06B6D4",
];

function getTransactionDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDateLabel(date: string): string {
  const transactionDate = getTransactionDate(date);
  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (transactionDate.getTime() === today.getTime()) {
    return "Hari ini";
  }

  if (transactionDate.getTime() === yesterday.getTime()) {
    return "Kemarin";
  }

  return transactionDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const value = category.toLowerCase();

  if (value.includes("makan")) return "restaurant-outline";
  if (value.includes("transport")) return "car-outline";
  if (value.includes("belanja")) return "cart-outline";
  if (value.includes("tagihan")) return "receipt-outline";
  if (value.includes("gaji")) return "wallet-outline";
  if (value.includes("hiburan")) return "play-circle-outline";
  if (value.includes("kesehatan")) return "medkit-outline";

  return "pricetag-outline";
}

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil ulang data setiap Dashboard dibuka.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTransactions() {
        try {
          setLoading(true);

          const data = await getTransactions();

          if (active) {
            setTransactions(data);
          }
        } catch (error) {
          console.error("Gagal mengambil transaksi Dashboard:", error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadTransactions();

      return () => {
        active = false;
      };
    }, []),
  );

  const openMonthPicker = () => {
    setPickerYear(selectedYear);
    setShowMonthPicker(true);
  };

  const selectMonth = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedYear(pickerYear);
    setShowMonthPicker(false);
  };

  // Filter transaksi sesuai bulan dan tahun yang dipilih.
  const monthlyTransactions = useMemo(() => {
    const selectedPeriod = `${selectedYear}-${String(
      selectedMonth + 1,
    ).padStart(2, "0")}`;

    return transactions.filter((item) =>
      item.transaction_date.startsWith(selectedPeriod),
    );
  }, [transactions, selectedMonth, selectedYear]);

  // Hitung seluruh saldo dari semua transaksi.
  const balance = useMemo(() => {
    return transactions.reduce(
      (total, item) =>
        total + (item.type === "income" ? item.amount : -item.amount),
      0,
    );
  }, [transactions]);

  // Hitung pemasukan bulan terpilih.
  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter((item) => item.type === "income")
      .reduce((total, item) => total + item.amount, 0);
  }, [monthlyTransactions]);

  // Hitung pengeluaran bulan terpilih.
  const totalExpense = useMemo(() => {
    return monthlyTransactions
      .filter((item) => item.type === "expense")
      .reduce((total, item) => total + item.amount, 0);
  }, [monthlyTransactions]);

  // Hitung arus kas bersih bulan ini.
  const currentMonthNet = totalIncome - totalExpense;

  // Tentukan periode bulan sebelumnya.
  const previousMonthDate = new Date(selectedYear, selectedMonth - 1, 1);

  const previousPeriod = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  // Ambil transaksi bulan sebelumnya.
  const previousMonthTransactions = transactions.filter((item) =>
    item.transaction_date.startsWith(previousPeriod),
  );

  // Hitung arus kas bersih bulan sebelumnya.
  const previousMonthNet = previousMonthTransactions.reduce(
    (total, item) =>
      total + (item.type === "income" ? item.amount : -item.amount),
    0,
  );

  // Hitung persentase perubahan.
  const monthlyPercentage =
    previousMonthTransactions.length === 0 || previousMonthNet === 0
      ? undefined
      : Number(
          (
            ((currentMonthNet - previousMonthNet) /
              Math.abs(previousMonthNet)) *
            100
          ).toFixed(1),
        );

  // Buat data grafik berdasarkan kategori pengeluaran.
  const chartData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    monthlyTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const current = categoryTotals.get(item.category) ?? 0;
        categoryTotals.set(item.category, current + item.amount);
      });

    return Array.from(categoryTotals.entries()).map(
      ([label, amount], index) => ({
        label,
        amount,
        color: chartColors[index % chartColors.length],
      }),
    );
  }, [monthlyTransactions]);

  // Data transaksi terbaru untuk komponen Dashboard.
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateComparison = b.transaction_date.localeCompare(
          a.transaction_date,
        );

        if (dateComparison !== 0) return dateComparison;

        return b.id - a.id;
      })
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        date: getDateLabel(item.transaction_date),
        amount: item.amount,
        type: item.type,
        icon: getCategoryIcon(item.category),
      }));
  }, [transactions]);

  const hasTransactions = transactions.length > 0;

  return (
    <>
      <ScreenContainer safeArea scrollable>
        {/* HEADER */}
        <View className="mt-3 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-violet-600">
              <Ionicons name="person" size={23} color="#FFFFFF" />
            </View>

            <View className="ml-3">
              <Text style={{ color: colors.textSecondary }} className="text-xs">
                Selamat datang,
              </Text>

              <Text
                style={{ color: colors.text }}
                className="text-lg font-bold"
              >
                Halo, Teguh 👋
              </Text>
            </View>
          </View>

          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surface }}
            onPress={() => {}}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* TOTAL SALDO */}
        <BalanceCard balance={balance} percentage={monthlyPercentage} />

        {/* QUICK ACTIONS */}
        <QuickActions
          onAction={(action) => {
            switch (action) {
              case "income":
                router.push({
                  pathname: "/add",
                  params: { type: "income" },
                });
                break;

              case "expense":
                router.push({
                  pathname: "/add",
                  params: { type: "expense" },
                });
                break;

              case "transfer":
                router.push("/transfer");
                break;

              case "category":
                router.push("/categories");
                break;

              default:
                break;
            }
          }}
        />

        {loading ? (
          <View className="mt-10 items-center py-8">
            <Ionicons
              name="hourglass-outline"
              size={30}
              color={colors.textSecondary}
            />
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Memuat data keuangan...
            </Text>
          </View>
        ) : !hasTransactions ? (
          /* KONDISI BELUM ADA TRANSAKSI */
          <View className="mt-7 gap-5">
            {/* RINGKASAN */}
            <View>
              <View className="mb-3">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Ringkasan Bulanan
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Ringkasan keuangan kamu akan muncul di sini
                </Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <SummaryCard type="income" amount={0} />
                </View>

                <View className="flex-1">
                  <SummaryCard type="expense" amount={0} />
                </View>
              </View>
            </View>

            {/* GRAFIK KOSONG */}
            <CashFlowChart data={[]} />

            {/* EMPTY STATE TRANSAKSI */}
            <View>
              <Text
                className="mb-3 text-lg font-bold"
                style={{ color: colors.text }}
              >
                Transaksi Terbaru
              </Text>

              <View
                className="items-center rounded-2xl border px-6 py-8"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View
                  className="h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                  }}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={30}
                    color={colors.textSecondary}
                  />
                </View>

                <Text
                  className="mt-4 text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Belum ada transaksi
                </Text>

                <Text
                  className="mt-2 text-center text-xs leading-5"
                  style={{ color: colors.textSecondary }}
                >
                  Catat pemasukan atau pengeluaran pertamamu untuk mulai melihat
                  kondisi keuangan di sini.
                </Text>

                <Pressable
                  onPress={() => router.push("/add")}
                  className="mt-5 flex-row items-center rounded-xl px-5 py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text className="ml-2 text-sm font-semibold text-white">
                    Tambah Transaksi
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          /* KONDISI SUDAH ADA TRANSAKSI */
          <>
            {/* RINGKASAN BULANAN */}
            <View className="mt-6 mb-3 flex-row items-center justify-between">
              <View>
                <Text
                  style={{ color: colors.text }}
                  className="text-lg font-bold"
                >
                  Ringkasan Bulanan
                </Text>

                <Text
                  style={{ color: colors.textSecondary }}
                  className="mt-1 text-xs"
                >
                  Kondisi keuangan kamu
                </Text>
              </View>

              {/* FILTER BULAN */}
              <Pressable
                onPress={openMonthPicker}
                className="flex-row items-center rounded-xl px-3 py-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={colors.primary}
                />

                <Text
                  className="ml-2 text-xs font-semibold"
                  style={{ color: colors.text }}
                >
                  {months[selectedMonth]} {selectedYear}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                  style={{ marginLeft: 5 }}
                />
              </Pressable>
            </View>

            {/* PEMASUKAN & PENGELUARAN */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard type="income" amount={totalIncome} />
              </View>

              <View className="flex-1">
                <SummaryCard type="expense" amount={totalExpense} />
              </View>
            </View>

            {/* GRAFIK ARUS KAS */}
            <CashFlowChart data={chartData} />

            {/* TRANSAKSI TERBARU */}
            <RecentTransactions transactions={recentTransactions} />
          </>
        )}
      </ScreenContainer>

      {/* MODAL PILIH BULAN DAN TAHUN */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View
            className="w-full rounded-3xl p-5"
            style={{
              maxWidth: 380,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* MODAL HEADER */}
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Pilih Periode
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Tentukan bulan dan tahun
                </Text>
              </View>

              <Pressable
                onPress={() => setShowMonthPicker(false)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceSecondary }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* YEAR SELECTOR */}
            <View
              className="mb-5 flex-row items-center justify-between rounded-2xl p-3"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Pressable
                onPress={() => setPickerYear((year) => year - 1)}
                className="h-9 w-9 items-center justify-center rounded-xl"
              >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>

              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                {pickerYear}
              </Text>

              <Pressable
                onPress={() => setPickerYear((year) => year + 1)}
                className="h-9 w-9 items-center justify-center rounded-xl"
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>

            {/* MONTH GRID */}
            <View className="flex-row flex-wrap justify-between">
              {months.map((month, index) => {
                const active =
                  selectedMonth === index && selectedYear === pickerYear;

                return (
                  <Pressable
                    key={month}
                    onPress={() => selectMonth(index)}
                    className="mb-3 items-center justify-center rounded-xl py-3"
                    style={{
                      width: "31.5%",
                      backgroundColor: active
                        ? colors.primary
                        : colors.surfaceSecondary,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: active ? "#FFFFFF" : colors.text,
                      }}
                    >
                      {month}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ACTION BUTTON */}
            <Pressable
              onPress={() => {
                setSelectedMonth(today.getMonth());
                setSelectedYear(today.getFullYear());
                setPickerYear(today.getFullYear());
                setShowMonthPicker(false);
              }}
              className="mt-2 items-center rounded-xl py-3"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                Kembali ke Bulan Ini
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
