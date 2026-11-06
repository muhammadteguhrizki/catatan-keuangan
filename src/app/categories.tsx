import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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

import ScreenContainer from "../components/layout/ScreenContainer";
import AppAlert, { type AppAlertType } from "../components/ui/AppAlert";

import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../database/repositories/categoryRepository";

import type { Category, TransactionType } from "../database/types";

import { useAppTheme } from "../theme/ThemeProvider";

const iconOptions = [
  "restaurant-outline",
  "car-outline",
  "cart-outline",
  "receipt-outline",
  "wallet-outline",
  "home-outline",
  "medkit-outline",
  "school-outline",
  "game-controller-outline",
  "gift-outline",
  "briefcase-outline",
  "cash-outline",
  "airplane-outline",
  "shirt-outline",
  "phone-portrait-outline",
  "pricetag-outline",
] as const;

const colorOptions = [
  "#8B5CF6",
  "#14B8A6",
  "#F59E0B",
  "#3B82F6",
  "#F87171",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppAlertType;
  onConfirm?: () => void;
};

export default function CategoriesScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<TransactionType>("expense");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] =
    useState<(typeof iconOptions)[number]>("pricetag-outline");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");

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
    type: AppAlertType,
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
    setAlert((previous) => ({
      ...previous,
      visible: false,
      onConfirm: undefined,
    }));
  };

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  const filteredCategories = categories.filter(
    (item) => item.type === selectedType,
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSelectedIcon("pricetag-outline");
    setSelectedColor("#8B5CF6");
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(
      (category.icon as (typeof iconOptions)[number]) || "pricetag-outline",
    );
    setSelectedColor(category.color || "#8B5CF6");
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showAlert(
        "Nama kategori kosong",
        "Silakan masukkan nama kategori terlebih dahulu.",
        "warning",
      );
      return;
    }

    const duplicate = categories.some(
      (item) =>
        item.type === selectedType &&
        item.name.toLowerCase() === trimmedName.toLowerCase() &&
        item.id !== editingCategory?.id,
    );

    if (duplicate) {
      showAlert(
        "Kategori sudah ada",
        "Nama kategori tersebut sudah digunakan.",
        "warning",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: trimmedName,
        type: selectedType,
        icon: selectedIcon,
        color: selectedColor,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await addCategory(payload);
      }

      setModalVisible(false);
      setName("");
      setEditingCategory(null);

      await loadCategories();

      showAlert(
        "Berhasil",
        editingCategory
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan.",
        "success",
      );
    } catch (error) {
      console.error("Gagal menyimpan kategori:", error);

      showAlert("Gagal", "Kategori tidak berhasil disimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category: Category) => {
    showAlert(
      "Hapus kategori?",
      `Apakah kamu yakin ingin menghapus kategori "${category.name}"?`,
      "confirm",
      async () => {
        closeAlert();

        try {
          await deleteCategory(category.id);
          await loadCategories();

          showAlert("Berhasil", "Kategori berhasil dihapus.", "success");
        } catch (error) {
          console.error("Gagal menghapus kategori:", error);

          showAlert(
            "Kategori tidak bisa dihapus",
            error instanceof Error
              ? error.message
              : "Kategori tidak berhasil dihapus.",
            "warning",
          );
        }
      },
    );
  };

  return (
    <ScreenContainer safeArea scrollable>
      {/* HEADER */}
      <View className="mt-3 mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </Pressable>

        <View>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Kelola Kategori
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            Atur kategori keuangan kamu
          </Text>
        </View>
      </View>

      {/* TAB */}
      <View
        className="mb-5 flex-row rounded-2xl p-1"
        style={{ backgroundColor: colors.surface }}
      >
        {(["expense", "income"] as TransactionType[]).map((type) => {
          const active = selectedType === type;

          return (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              className="flex-1 items-center rounded-xl py-3"
              style={{
                backgroundColor: active ? colors.primary : "transparent",
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: active ? "#FFFFFF" : colors.textSecondary,
                }}
              >
                {type === "income" ? "Pemasukan" : "Pengeluaran"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* LIST HEADER */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Daftar Kategori
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            {filteredCategories.length} kategori
          </Text>
        </View>

        <Pressable
          onPress={openAddModal}
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="ml-1 text-xs font-bold text-white">Tambah</Text>
        </Pressable>
      </View>

      {/* CATEGORY LIST */}
      {filteredCategories.length === 0 ? (
        <View
          className="items-center rounded-2xl border px-6 py-10"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name="grid-outline"
            size={38}
            color={colors.textSecondary}
          />

          <Text
            className="mt-4 text-base font-bold"
            style={{ color: colors.text }}
          >
            Belum ada kategori
          </Text>

          <Text
            className="mt-2 text-center text-xs leading-5"
            style={{ color: colors.textSecondary }}
          >
            Tambahkan kategori pertama untuk mengelompokkan transaksi kamu.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {filteredCategories.map((category) => (
            <View
              key={category.id}
              className="flex-row items-center rounded-2xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${category.color || "#8B5CF6"}20`,
                }}
              >
                <Ionicons
                  name={
                    (category.icon as keyof typeof Ionicons.glyphMap) ||
                    "pricetag-outline"
                  }
                  size={23}
                  color={category.color || "#8B5CF6"}
                />
              </View>

              <View className="ml-3 flex-1">
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {category.name}
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {category.type === "income"
                    ? "Kategori pemasukan"
                    : "Kategori pengeluaran"}
                </Text>
              </View>

              <Pressable
                onPress={() => openEditModal(category)}
                className="mr-2 h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: colors.surfaceSecondary,
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>

              <Pressable
                onPress={() => handleDelete(category)}
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${colors.expense}15`,
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.expense}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* FORM MODAL */}
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
            backgroundColor: "rgba(0,0,0,0.65)",
          }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{
              backgroundColor: colors.background,
              maxHeight: "90%",
              paddingBottom: 24,
            }}
          >
            <View className="mb-5 flex-row items-center justify-between">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
              </Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="close" size={20} color={colors.text} />
                </View>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <Text
                className="mb-2 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Nama Kategori
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Makanan, Gaji, Transportasi"
                placeholderTextColor={colors.textSecondary}
                className="mb-5 rounded-xl border px-4 py-3"
                style={{
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              />

              <Text
                className="mb-3 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Pilih Ikon
              </Text>

              <View className="mb-5 flex-row flex-wrap gap-3">
                {iconOptions.map((icon) => {
                  const active = selectedIcon === icon;

                  return (
                    <Pressable
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderWidth: active ? 0 : 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Ionicons
                        name={icon}
                        size={21}
                        color={active ? "#FFFFFF" : colors.text}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Text
                className="mb-3 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Pilih Warna
              </Text>

              <View className="mb-6 flex-row flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable
                disabled={saving}
                onPress={handleSave}
                className="items-center rounded-xl py-4"
                style={{
                  backgroundColor: colors.primary,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text className="text-sm font-bold text-white">
                  {saving
                    ? "Menyimpan..."
                    : editingCategory
                      ? "Simpan Perubahan"
                      : "Simpan Kategori"}
                </Text>
              </Pressable>

              <View className="h-4" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ALERT */}
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
    </ScreenContainer>
  );
}
