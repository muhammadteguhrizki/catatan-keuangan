import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppAlert, { type AppAlertType } from "../components/ui/AppAlert";
import AppCard from "../components/ui/AppCard";

import { getCategories } from "../database/repositories/categoryRepository";
import { addTransaction } from "../database/repositories/transactionRepository";

import type { Category, TransactionType } from "../database/types";

import { useAppTheme } from "../theme/ThemeProvider";
import { formatNumber } from "../utils/currency";

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppAlertType;
  onClose?: () => void;
};

export default function AddTransactionScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  const initialType: TransactionType =
    params.type === "income" ? "income" : "expense";

  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const primaryColor = type === "income" ? "#20D99A" : "#F87171";

  // ALERT
  const showAlert = (
    title: string,
    message: string,
    type: AppAlertType = "info",
    onClose?: () => void,
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onClose,
    });
  };

  const closeAlert = () => {
    const callback = alert.onClose;

    setAlert((prev) => ({
      ...prev,
      visible: false,
      onClose: undefined,
    }));

    callback?.();
  };

  // LOAD KATEGORI BERDASARKAN JENIS TRANSAKSI
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      const data = await getCategories(type);

      setCategories(data);

      // Reset pilihan jika kategori sebelumnya tidak tersedia
      setCategory((current) => {
        const stillExists = data.some((item) => item.name === current);

        return stillExists ? current : "";
      });
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);

      showAlert("Gagal", "Tidak dapat mengambil daftar kategori.", "error");
    } finally {
      setLoadingCategories(false);
    }
  }, [type]);

  // Muat ulang kategori saat halaman dibuka atau jenis berubah
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  // GANTI JENIS TRANSAKSI
  const handleChangeType = (newType: TransactionType) => {
    if (newType === type) return;

    setType(newType);
    setCategory("");
  };

  // SIMPAN TRANSAKSI
  const handleSave = async () => {
    if (!title.trim() || !amount.trim() || !category) {
      showAlert(
        "Data belum lengkap",
        "Lengkapi nama, nominal, dan kategori transaksi.",
        "warning",
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showAlert(
        "Nominal tidak valid",
        "Masukkan nominal lebih dari nol.",
        "warning",
      );
      return;
    }

    try {
      setSaving(true);

      const now = new Date();

      const transactionDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      await addTransaction({
        type,
        title: title.trim(),
        amount: numericAmount,
        category,
        note: note.trim(),
        transaction_date: transactionDate,
      });

      showAlert("Berhasil", "Transaksi berhasil disimpan.", "success", () =>
        router.replace("/transactions"),
      );
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);

      showAlert(
        "Gagal",
        "Transaksi tidak berhasil disimpan. Silakan coba lagi.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: "100%",
          maxWidth: 430,
          alignSelf: "center",
          padding: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="mr-4 h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>

          <View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Tambah Transaksi
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Catat keuanganmu dengan mudah
            </Text>
          </View>
        </View>

        {/* TYPE SELECTOR */}
        <View
          className="mb-5 flex-row rounded-2xl p-1"
          style={{ backgroundColor: colors.surface }}
        >
          <Pressable
            onPress={() => handleChangeType("income")}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: type === "income" ? "#123C36" : "transparent",
            }}
          >
            <Ionicons name="arrow-down-circle" size={19} color="#20D99A" />

            <Text
              className="ml-2 font-semibold"
              style={{
                color: type === "income" ? "#20D99A" : colors.textSecondary,
              }}
            >
              Pemasukan
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleChangeType("expense")}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: type === "expense" ? "#402630" : "transparent",
            }}
          >
            <Ionicons name="arrow-up-circle" size={19} color="#F87171" />

            <Text
              className="ml-2 font-semibold"
              style={{
                color: type === "expense" ? "#F87171" : colors.textSecondary,
              }}
            >
              Pengeluaran
            </Text>
          </Pressable>
        </View>

        {/* AMOUNT */}
        <AppCard className="mb-5">
          <Text
            className="mb-3 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Nominal Transaksi
          </Text>

          <View className="flex-row items-center">
            <Text
              className="mr-2 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              Rp
            </Text>

            <TextInput
              value={amount ? formatNumber(Number(amount)) : ""}
              onChangeText={(value) => {
                setAmount(value.replace(/\D/g, ""));
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              underlineColorAndroid="transparent"
              selectionColor={primaryColor}
              style={{
                flex: 1,
                minWidth: 0,
                color: primaryColor,
                fontSize: 30,
                fontWeight: "bold",
                borderRadius: 10,
                padding: 5,
                borderWidth: 0,
                backgroundColor: "transparent",
              }}
            />
          </View>

          <View
            className="mt-3 h-1 rounded-full"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-1 w-1/3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </View>
        </AppCard>

        {/* FORM */}
        <Text
          className="mb-3 text-base font-bold"
          style={{ color: colors.text }}
        >
          Detail Transaksi
        </Text>

        <AppCard className="mb-5 gap-5">
          {/* NAMA TRANSAKSI */}
          <View>
            <Text
              className="mb-2 text-sm font-medium"
              style={{ color: colors.text }}
            >
              Nama Transaksi
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Makan siang"
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderRadius: 12,
                padding: 14,
              }}
            />
          </View>

          {/* KATEGORI DINAMIS */}
          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                Kategori
              </Text>

              <Pressable
                onPress={() => router.push("/categories")}
                className="flex-row items-center"
              >
                <Ionicons
                  name="settings-outline"
                  size={14}
                  color={colors.primary}
                />

                <Text
                  className="ml-1 text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  Kelola
                </Text>
              </Pressable>
            </View>

            {loadingCategories ? (
              <View className="items-center rounded-xl py-5">
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Memuat kategori...
                </Text>
              </View>
            ) : categories.length === 0 ? (
              <View
                className="items-center rounded-xl border p-5"
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
              >
                <Ionicons
                  name="grid-outline"
                  size={28}
                  color={colors.textSecondary}
                />

                <Text
                  className="mt-3 text-sm font-semibold"
                  style={{ color: colors.text }}
                >
                  Belum ada kategori
                </Text>

                <Text
                  className="mt-1 text-center text-xs leading-5"
                  style={{ color: colors.textSecondary }}
                >
                  Tambahkan kategori{" "}
                  {type === "income" ? "pemasukan" : "pengeluaran"} terlebih
                  dahulu.
                </Text>

                <Pressable
                  onPress={() => router.push("/categories")}
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-xs font-bold text-white">
                    Tambah Kategori
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {categories.map((item) => {
                  const active = category === item.name;
                  const itemColor = item.color || primaryColor;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setCategory(item.name)}
                      className="flex-row items-center rounded-xl px-3 py-3"
                      style={{
                        backgroundColor: active
                          ? itemColor
                          : colors.surfaceSecondary,
                        borderWidth: active ? 0 : 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Ionicons
                        name={
                          (item.icon ||
                            "pricetag-outline") as keyof typeof Ionicons.glyphMap
                        }
                        size={16}
                        color={active ? "#FFFFFF" : itemColor}
                      />

                      <Text
                        className="ml-2 text-xs font-semibold"
                        style={{
                          color: active ? "#FFFFFF" : colors.textSecondary,
                        }}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* CATATAN */}
          <View>
            <Text
              className="mb-2 text-sm font-medium"
              style={{ color: colors.text }}
            >
              Catatan (Opsional)
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tambahkan catatan..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              style={{
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderRadius: 12,
                padding: 14,
                minHeight: 90,
              }}
            />
          </View>
        </AppCard>

        {/* SAVE BUTTON */}
        <Pressable
          onPress={handleSave}
          disabled={saving || loadingCategories}
          className="flex-row items-center justify-center rounded-2xl py-4"
          style={{
            backgroundColor: primaryColor,
            opacity: saving || loadingCategories ? 0.6 : 1,
          }}
        >
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />

          <Text className="ml-2 font-bold text-white">
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* CUSTOM ALERT */}
      <AppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText="Mengerti"
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
}
