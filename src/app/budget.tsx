import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AppAlert, { type AppAlertType } from "../components/ui/AppAlert";
import AppCard from "../components/ui/AppCard";
import {
  addBudget,
  deleteBudget,
  getBudgets,
} from "../database/repositories/budgetRepository";
import { getCategories } from "../database/repositories/categoryRepository";
import { getTransactions } from "../database/repositories/transactionRepository";
import type { Budget, Category, Transaction } from "../database/types";
import { useAppTheme } from "../theme/ThemeProvider";
import { formatRupiah } from "../utils/currency";
type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppAlertType;
  onConfirm?: () => void;
};
function getCurrentMonth() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
function changeMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}
export default function BudgetScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Makanan");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
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
    setAlert((prev) => ({
      ...prev,
      visible: false,
      onConfirm: undefined,
    }));
  };
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetData, transactionData, categoryData] = await Promise.all([
        getBudgets(selectedMonth),
        getTransactions(),
        getCategories("expense"),
      ]);
      setBudgets(budgetData);
      setTransactions(transactionData);
      setCategories(categoryData);
      setSelectedCategory((current) =>
        categoryData.some((item) => item.name === current)
          ? current
          : (categoryData[0]?.name ?? ""),
      );
    } catch (error) {
      console.error("Gagal mengambil data anggaran:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );
  const getSpent = (category: string) => {
    return transactions
      .filter(
        (item) =>
          item.type === "expense" &&
          item.category === category &&
          item.transaction_date.startsWith(selectedMonth),
      )
      .reduce((total, item) => total + item.amount, 0);
  };
  const totalBudget = budgets.reduce((total, item) => total + item.amount, 0);
  const totalSpent = budgets.reduce(
    (total, item) => total + getSpent(item.category),
    0,
  );
  const remaining = totalBudget - totalSpent;
  const percentage =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const handleSave = async () => {
    const numericAmount = Number(amount.replace(/\D/g, ""));
    if (
      !selectedCategory ||
      !categories.some((item) => item.name === selectedCategory) ||
      !numericAmount ||
      numericAmount <= 0
    ) {
      showAlert(
        "Data belum lengkap",
        "Silakan pilih kategori dan masukkan nominal anggaran.",
        "warning",
      );
      return;
    }
    const duplicate = budgets.some(
      (item) => item.category === selectedCategory,
    );
    if (duplicate) {
      showAlert(
        "Kategori sudah tersedia",
        "Anggaran untuk kategori ini sudah tersedia.",
        "warning",
      );
      return;
    }
    try {
      setSaving(true);
      await addBudget({
        category: selectedCategory,
        amount: numericAmount,
        month: selectedMonth,
      });
      setModalVisible(false);
      setAmount("");
      await loadData();
      showAlert("Berhasil", "Anggaran berhasil disimpan.", "success");
    } catch (error) {
      console.error("Gagal menyimpan anggaran:", error);
      showAlert(
        "Gagal",
        "Gagal menyimpan anggaran. Silakan coba lagi.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = (id: number) => {
    showAlert(
      "Hapus Anggaran",
      "Apakah kamu yakin ingin menghapus anggaran ini?",
      "confirm",
      async () => {
        try {
          await deleteBudget(id);
          await loadData();
          showAlert("Berhasil", "Anggaran berhasil dihapus.", "success");
        } catch (error) {
          console.error("Gagal menghapus anggaran:", error);
          showAlert("Gagal", "Anggaran tidak berhasil dihapus.", "error");
        }
      },
    );
  };
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
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              Anggaran
            </Text>
            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Atur pengeluaranmu dengan bijak
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setPickerMonth(selectedMonth);
              setMonthPickerVisible(true);
            }}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="calendar-outline" size={21} color={colors.text} />
          </Pressable>
        </View>
        {/* MONTH */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Ringkasan Anggaran
          </Text>
          <Text className="text-xs" style={{ color: colors.primary }}>
            {formatMonth(selectedMonth)}
          </Text>
        </View>
        {/* SUMMARY CARD */}
        <AppCard className="p-5">
          <View className="items-center">
            <View
              className="mb-4 h-36 w-36 items-center justify-center rounded-full"
              style={{
                borderWidth: 12,
                borderColor: colors.border,
              }}
            >
              <View
                className="absolute inset-0 rounded-full"
                style={{
                  borderWidth: 12,
                  borderColor: colors.primary,
                  borderRightColor: colors.border,
                  borderBottomColor: colors.border,
                  transform: [{ rotate: "45deg" }],
                }}
              />
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {percentage.toFixed(0)}%
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Terpakai
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Total Pengeluaran
            </Text>
            <Text
              className="mt-1 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {formatRupiah(totalSpent)}
            </Text>
          </View>
          <View className="mt-5 flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-3"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Total Anggaran
              </Text>
              <Text
                className="mt-2 text-sm font-bold"
                style={{ color: colors.text }}
              >
                {formatRupiah(totalBudget)}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-3"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Sisa Anggaran
              </Text>
              <Text
                className="mt-2 text-sm font-bold"
                style={{
                  color: remaining < 0 ? colors.expense : colors.income,
                }}
              >
                {formatRupiah(remaining)}
              </Text>
            </View>
          </View>
        </AppCard>
        {/* CATEGORY HEADER */}
        <View className="mb-4 mt-7 flex-row items-center justify-between">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Anggaran Kategori
          </Text>
          <Pressable
            onPress={() => setModalVisible(true)}
            className="flex-row items-center"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text
              className="ml-1 text-xs font-semibold"
              style={{ color: colors.primary }}
            >
              Tambah
            </Text>
          </Pressable>
        </View>
        {/* CATEGORY LIST */}
        {loading ? (
          <Text
            className="py-8 text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            Memuat anggaran...
          </Text>
        ) : budgets.length === 0 ? (
          <AppCard className="items-center p-6">
            <Ionicons
              name="wallet-outline"
              size={38}
              color={colors.textSecondary}
            />
            <Text
              className="mt-3 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Belum ada anggaran
            </Text>
            <Text
              className="mt-1 text-center text-xs"
              style={{ color: colors.textSecondary }}
            >
              Tambahkan anggaran kategori untuk mulai mengatur pengeluaranmu.
            </Text>
          </AppCard>
        ) : (
          <View className="gap-3">
            {budgets.map((item) => {
              const spent = getSpent(item.category);
              const progress =
                item.amount > 0
                  ? Math.min((spent / item.amount) * 100, 100)
                  : 0;
              const exceeded = spent > item.amount;
              const categoryInfo = categories.find(
                (category) => category.name === item.category,
              );
              const meta = {
                icon: (categoryInfo?.icon ||
                  "wallet-outline") as keyof typeof Ionicons.glyphMap,
                color: categoryInfo?.color || colors.primary,
              };
              return (
                <AppCard key={item.id} className="p-4">
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${meta.color}20`,
                      }}
                    >
                      <Ionicons name={meta.icon} size={22} color={meta.color} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {item.category}
                      </Text>
                      <Text
                        className="mt-1 text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {formatRupiah(spent)} dari {formatRupiah(item.amount)}
                      </Text>
                    </View>
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: exceeded ? colors.expense : meta.color,
                      }}
                    >
                      {progress.toFixed(0)}%
                    </Text>
                  </View>
                  <View
                    className="mt-4 h-2 overflow-hidden rounded-full"
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: exceeded ? colors.expense : meta.color,
                      }}
                    />
                  </View>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text
                      className="flex-1 text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {exceeded
                        ? `Melebihi anggaran ${formatRupiah(
                            spent - item.amount,
                          )}`
                        : `Sisa ${formatRupiah(item.amount - spent)}`}
                    </Text>
                    <Pressable
                      onPress={() => handleDelete(item.id)}
                      hitSlop={10}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={colors.expense}
                      />
                    </Pressable>
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}
      </ScrollView>
      {/* MONTH PICKER MODAL */}
      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <View
            className="w-full rounded-3xl p-5"
            style={{ backgroundColor: colors.background }}
          >
            <View className="mb-5 flex-row items-center justify-between">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Pilih Bulan
              </Text>
              <Pressable onPress={() => setMonthPickerVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={25}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            <View className="mb-5 flex-row items-center justify-between">
              <Pressable
                onPress={() =>
                  setPickerMonth((current) => changeMonth(current, -1))
                }
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                {formatMonth(pickerMonth)}
              </Text>
              <Pressable
                onPress={() =>
                  setPickerMonth((current) => changeMonth(current, 1))
                }
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                setSelectedMonth(pickerMonth);
                setMonthPickerVisible(false);
              }}
              className="items-center rounded-2xl py-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="font-bold text-white">Tampilkan Anggaran</Text>
            </Pressable>
            <Pressable
              onPress={() => setMonthPickerVisible(false)}
              className="mt-3 items-center py-2"
            >
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Batal
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ADD BUDGET MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{
              backgroundColor: colors.background,
              maxHeight: "85%",
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <View className="mb-5 flex-row items-center justify-between">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Tambah Anggaran
                </Text>

                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons
                    name="close-circle"
                    size={27}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              <Text
                className="mb-3 text-sm font-semibold"
                style={{ color: colors.text }}
              >
                Pilih Kategori
              </Text>

              <View className="mb-5 flex-row flex-wrap gap-2">
                {categories.length === 0 ? (
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Belum ada kategori pengeluaran. Tambahkan kategori terlebih
                    dahulu melalui menu Kategori.
                  </Text>
                ) : (
                  categories.map((category) => {
                    const active = selectedCategory === category.name;

                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => setSelectedCategory(category.name)}
                        className="rounded-xl px-4 py-3"
                        style={{
                          backgroundColor: active
                            ? colors.primary
                            : colors.surface,
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color: active ? "#FFFFFF" : colors.text,
                          }}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <Text
                className="mb-2 text-sm font-semibold"
                style={{ color: colors.text }}
              >
                Nominal Anggaran
              </Text>

              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Contoh: 2000000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                className="mb-5 rounded-2xl px-4 py-4"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              <Pressable
                onPress={handleSave}
                disabled={saving || categories.length === 0}
                className="items-center rounded-2xl py-4"
                style={{
                  backgroundColor: colors.primary,
                  opacity: saving || categories.length === 0 ? 0.6 : 1,
                }}
              >
                <Text className="text-sm font-bold text-white">
                  {saving ? "Menyimpan..." : "Simpan Anggaran"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CUSTOM ALERT */}
      <AppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.type === "confirm" ? "Hapus" : "Mengerti"}
        cancelText="Batal"
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
      />
    </SafeAreaView>
  );
}
