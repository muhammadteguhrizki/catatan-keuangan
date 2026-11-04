import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppAlert, { type AppAlertType } from "../components/ui/AppAlert";
import AppCard from "../components/ui/AppCard";
import {
  deleteAllTransactions,
  deleteTransaction,
  getTransactions,
} from "../database/repositories/transactionRepository";
import type { Transaction } from "../database/types";
import { useAppTheme } from "../theme/ThemeProvider";
import { formatRupiah } from "../utils/currency";

const filters = ["Semua", "Pemasukan", "Pengeluaran"] as const;

type FilterType = (typeof filters)[number];

type TransactionGroup = {
  label: string;
  items: Transaction[];
};

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppAlertType;
  onConfirm?: () => void;
};

export default function TransactionsScreen() {
  const { colors } = useAppTheme();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("Semua");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: AppAlertType = "info",
    onConfirm?: () => void,
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert((current) => ({
      ...current,
      visible: false,
      onConfirm: undefined,
    }));
  };

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        try {
          setLoading(true);
          const data = await getTransactions();

          if (active) {
            setTransactions(data);
          }
        } catch (error) {
          console.error("Gagal mengambil transaksi:", error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        active = false;
      };
    }, []),
  );

  // HAPUS SATU TRANSAKSI
  const handleDelete = (id: number) => {
    showAlert(
      "Hapus Transaksi?",
      "Transaksi ini akan dihapus secara permanen. Apakah kamu yakin?",
      "confirm",
      async () => {
        try {
          setDeleting(true);

          await deleteTransaction(id);
          await loadTransactions();

          showAlert("Berhasil!", "Transaksi berhasil dihapus.", "success");
        } catch (error) {
          console.error("Gagal menghapus transaksi:", error);

          showAlert(
            "Gagal Menghapus",
            "Terjadi kesalahan saat menghapus transaksi.",
            "error",
          );
        } finally {
          setDeleting(false);
        }
      },
    );
  };

  // HAPUS SEMUA TRANSAKSI
  const handleDeleteAll = () => {
    showAlert(
      "Hapus Semua Riwayat?",
      "Seluruh riwayat pemasukan dan pengeluaran akan dihapus permanen. Data yang dihapus tidak dapat dikembalikan.",
      "confirm",
      async () => {
        try {
          setDeleting(true);

          await deleteAllTransactions();
          setTransactions([]);

          showAlert(
            "Berhasil!",
            "Semua riwayat transaksi berhasil dihapus.",
            "success",
          );
        } catch (error) {
          console.error("Gagal menghapus semua transaksi:", error);

          showAlert(
            "Gagal Menghapus",
            "Terjadi kesalahan saat menghapus seluruh riwayat transaksi.",
            "error",
          );
        } finally {
          setDeleting(false);
        }
      },
    );
  };

  // PENCARIAN DAN FILTER
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "Semua" ||
        (filter === "Pemasukan" && item.type === "income") ||
        (filter === "Pengeluaran" && item.type === "expense");

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  // KELOMPOKKAN TRANSAKSI BERDASARKAN TANGGAL
  const groups = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();

    filteredTransactions.forEach((item) => {
      const label = getDateGroup(item.transaction_date);

      if (!grouped.has(label)) {
        grouped.set(label, []);
      }

      grouped.get(label)!.push(item);
    });

    return Array.from(grouped.entries()).map(
      ([label, items]): TransactionGroup => ({
        label,
        items,
      }),
    );
  }, [filteredTransactions]);

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
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              Transaksi
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Riwayat keuangan kamu
            </Text>
          </View>

          {transactions.length > 0 && (
            <Pressable
              disabled={deleting}
              onPress={handleDeleteAll}
              className="flex-row items-center rounded-xl px-3 py-2"
              style={{
                backgroundColor: "#402630",
                opacity: deleting ? 0.5 : 1,
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#F87171" />

              <Text className="ml-1 text-xs font-semibold text-red-400">
                Hapus Semua
              </Text>
            </Pressable>
          )}
        </View>

        {/* SEARCH */}
        <View
          className="mb-5 flex-row items-center rounded-2xl px-4"
          style={{
            height: 48,
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari transaksi..."
            placeholderTextColor={colors.textSecondary}
            className="ml-3 flex-1 text-sm"
            style={{ color: colors.text, outlineStyle: "none" } as any}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* FILTER */}
        <View className="mb-6 flex-row gap-2">
          {filters.map((item) => {
            const active = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className="flex-1 items-center justify-center rounded-full px-2 py-3"
                style={{
                  backgroundColor: active ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: active ? "#FFFFFF" : colors.textSecondary,
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* LOADING */}
        {loading && (
          <Text
            className="py-10 text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            Memuat transaksi...
          </Text>
        )}

        {/* TRANSACTION GROUPS */}
        {!loading &&
          groups.map((group) => {
            const total = group.items.reduce(
              (sum, item) =>
                sum + (item.type === "income" ? item.amount : -item.amount),
              0,
            );

            return (
              <View key={group.label} className="mb-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {group.label}
                  </Text>

                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: total >= 0 ? colors.income : colors.expense,
                    }}
                  >
                    {total >= 0 ? "+" : ""}
                    {formatRupiah(total)}
                  </Text>
                </View>

                <AppCard className="p-1">
                  {group.items.map((item, index) => {
                    const isIncome = item.type === "income";
                    const accent = isIncome ? colors.income : colors.expense;

                    return (
                      <View
                        key={item.id}
                        className="flex-row items-center px-3 py-4"
                        style={{
                          borderBottomWidth:
                            index === group.items.length - 1 ? 0 : 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <View
                          className="h-11 w-11 items-center justify-center rounded-2xl"
                          style={{
                            backgroundColor: isIncome ? "#123C36" : "#402630",
                          }}
                        >
                          <Ionicons
                            name={getCategoryIcon(item.category)}
                            size={21}
                            color={accent}
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-sm font-bold"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </Text>

                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {item.category}
                          </Text>
                        </View>

                        <View className="ml-2 items-end">
                          <Text
                            className="text-sm font-bold"
                            style={{ color: accent }}
                          >
                            {isIncome ? "+" : "-"}
                            {formatRupiah(item.amount)}
                          </Text>

                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {getTransactionTime(item.created_at)}
                          </Text>
                        </View>

                        <Pressable
                          disabled={deleting}
                          onPress={() => handleDelete(item.id)}
                          hitSlop={10}
                          className="ml-3 h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: "#402630",
                            opacity: deleting ? 0.5 : 1,
                          }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={17}
                            color="#F87171"
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </AppCard>
              </View>
            );
          })}

        {/* EMPTY STATE */}
        {!loading && filteredTransactions.length === 0 && (
          <View className="items-center py-14">
            <Ionicons
              name="receipt-outline"
              size={42}
              color={colors.textSecondary}
            />

            <Text
              className="mt-3 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              {search.length > 0 || filter !== "Semua"
                ? "Transaksi tidak ditemukan"
                : "Belum ada transaksi"}
            </Text>

            <Text
              className="mt-1 text-center text-xs"
              style={{ color: colors.textSecondary }}
            >
              {search.length > 0 || filter !== "Semua"
                ? "Coba kata kunci atau filter lainnya."
                : "Transaksi yang kamu simpan akan muncul di sini."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CUSTOM ALERT */}
      <AppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.type === "confirm" ? "Hapus" : "Mengerti"}
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
      />
    </SafeAreaView>
  );
}

// FORMAT TANGGAL TRANSAKSI
function getTransactionDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDateGroup(date: string): string {
  const transactionDate = getTransactionDate(date);
  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const dateKey = transactionDate.getTime();

  if (dateKey === today.getTime()) return "Hari Ini";
  if (dateKey === yesterday.getTime()) return "Kemarin";

  return transactionDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTransactionTime(createdAt?: string): string {
  if (!createdAt) return "-";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date) + " WIB"
  );
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const value = category.toLowerCase();

  if (value.includes("makan")) return "restaurant";
  if (value.includes("transport")) return "car";
  if (value.includes("belanja")) return "cart";
  if (value.includes("tagihan")) return "receipt";
  if (value.includes("gaji")) return "wallet";
  if (value.includes("hiburan")) return "play-circle";
  if (value.includes("kesehatan")) return "medkit";

  return "pricetag";
}
