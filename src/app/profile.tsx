import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppAlert, { type AppAlertType } from "../components/ui/AppAlert";
import AppCard from "../components/ui/AppCard";
import type { Profile } from "../database/repositories/profileRepository";
import {
  getProfile,
  updateProfile,
} from "../database/repositories/profileRepository";
import { useAppTheme } from "../theme/ThemeProvider";
import { getProfilePhotoUri, saveProfilePhoto } from "../utils/profilePhoto";

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: AppAlertType;
};

const settings = [
  {
    title: "Informasi Akun",
    subtitle: "Kelola nama dan informasi pribadi",
    icon: "person-outline" as const,
  },
  {
    title: "Pengaturan Tampilan",
    subtitle: "Tema dan tampilan aplikasi",
    icon: "color-palette-outline" as const,
  },
  {
    title: "Mata Uang",
    subtitle: "Rupiah (IDR)",
    icon: "cash-outline" as const,
  },
  {
    title: "Keamanan & Privasi",
    subtitle: "Pengaturan keamanan akun",
    icon: "shield-checkmark-outline" as const,
  },
  {
    title: "Notifikasi",
    subtitle: "Atur pemberitahuan aplikasi",
    icon: "notifications-outline" as const,
  },
  {
    title: "Tentang Aplikasi",
    subtitle: "Informasi Personal Finance",
    icon: "information-circle-outline" as const,
  },
];

export default function ProfileScreen() {
  const { colors } = useAppTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // URI foto yang tersimpan di database
  const [photo, setPhoto] = useState("");

  // URI yang digunakan untuk menampilkan foto
  const [displayPhoto, setDisplayPhoto] = useState("");

  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  // Mengambil profil dan foto dari penyimpanan
  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();

      setProfile(data);
      setName(data?.name ?? "");
      setEmail(data?.email ?? "");
      setPhone(data?.phone ?? "");
      setPhoto(data?.photo ?? "");

      const photoUri = await getProfilePhotoUri(data?.photo ?? "");

      setDisplayPhoto(photoUri);
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      setDisplayPhoto("");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const showAlert = (title: string, message: string, type: AppAlertType) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
    });
  };

  // Membuka modal edit profil
  const openEditModal = () => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setPhone(profile?.phone ?? "");
    setPhoto(profile?.photo ?? "");
    setModalVisible(true);
  };

  // Memilih dan menyimpan foto profil
  const handlePickPhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showAlert(
          "Izin diperlukan",
          "Izinkan aplikasi mengakses galeri untuk memilih foto profil.",
          "warning",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedPhoto = result.assets[0].uri;

        // Simpan foto ke penyimpanan permanen
        const permanentPhoto = await saveProfilePhoto(selectedPhoto);

        // Simpan referensi foto ke database
        await updateProfile({
          name: name.trim() || profile?.name || "Pengguna",
          email: email || profile?.email || "",
          phone: phone || profile?.phone || "",
          photo: permanentPhoto,
        });

        setPhoto(permanentPhoto);

        // Ambil URI untuk ditampilkan
        const photoUri = await getProfilePhotoUri(permanentPhoto);

        setDisplayPhoto(photoUri);

        await loadProfile();

        showAlert("Berhasil", "Foto profil berhasil disimpan.", "success");
      }
    } catch (error) {
      console.error("Gagal menyimpan foto profil:", error);

      showAlert("Gagal", "Foto profil tidak berhasil disimpan.", "error");
    }
  };

  // Menyimpan perubahan informasi profil
  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showAlert(
        "Nama belum diisi",
        "Silakan masukkan nama lengkap terlebih dahulu.",
        "warning",
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        name: trimmedName,
        email,
        phone,
        photo,
      });

      await loadProfile();
      setModalVisible(false);

      showAlert("Berhasil", "Profil berhasil diperbarui.", "success");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      showAlert("Gagal", "Profil tidak berhasil diperbarui.", "error");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name?.trim() || "Pengguna";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 430,
          alignSelf: "center",
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 35,
        }}
      >
        <Text
          className="mb-6 text-2xl font-bold"
          style={{ color: colors.text }}
        >
          Profil
        </Text>

        <AppCard className="items-center py-6">
          {/* FOTO PROFIL */}
          <Pressable
            onPress={handlePickPhoto}
            disabled={loading}
            className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : displayPhoto ? (
              <Image
                source={{ uri: displayPhoto }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-3xl font-bold text-white">{initial}</Text>
            )}
          </Pressable>

          {/* TOMBOL UBAH FOTO */}
          <Pressable
            onPress={handlePickPhoto}
            disabled={loading}
            className="mt-3 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text
              className="ml-2 text-xs font-semibold"
              style={{ color: colors.primary }}
            >
              Ubah Foto Profil
            </Text>
          </Pressable>

          <Text
            className="mt-4 text-xl font-bold"
            style={{ color: colors.text }}
          >
            {loading ? "Memuat profil..." : displayName}
          </Text>

          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            {profile?.email || "Pengguna Personal Finance"}
          </Text>

          <Pressable
            onPress={openEditModal}
            className="mt-4 flex-row items-center rounded-full px-5 py-2.5"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text
              className="ml-2 text-xs font-semibold"
              style={{ color: colors.primary }}
            >
              Edit Profil
            </Text>
          </Pressable>
        </AppCard>

        <View className="mb-3 mt-7">
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Pengaturan Akun
          </Text>
        </View>

        <AppCard className="p-1">
          {settings.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() => {
                if (item.title === "Informasi Akun") {
                  openEditModal();
                } else {
                  showAlert(
                    item.title,
                    "Fitur ini akan tersedia pada pengembangan berikutnya.",
                    "info",
                  );
                }
              }}
              className="flex-row items-center px-3 py-4"
              style={{
                borderBottomWidth: index === settings.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surfaceSecondary }}
              >
                <Ionicons name={item.icon} size={21} color={colors.primary} />
              </View>

              <View className="flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.text }}
                >
                  {item.title}
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </AppCard>

        <View className="mt-7 items-center">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            TeguhDev
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textSecondary }}
          >
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* MODAL EDIT PROFIL */}
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
              maxHeight: "85%",
            }}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Edit Profil
                </Text>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Perbarui informasi pribadi kamu
                </Text>
              </View>

              <Pressable
                onPress={() => setModalVisible(false)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* PREVIEW FOTO DI MODAL */}
              <View className="mb-5 items-center">
                <Pressable
                  onPress={handlePickPhoto}
                  disabled={saving}
                  className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  {displayPhoto ? (
                    <Image
                      source={{ uri: displayPhoto }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-3xl font-bold text-white">
                      {(name.trim() || "P").charAt(0).toUpperCase()}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={handlePickPhoto}
                  disabled={saving}
                  className="mt-2 flex-row items-center"
                >
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    className="ml-2 text-xs font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Ganti Foto
                  </Text>
                </Pressable>
              </View>

              <Text
                className="mb-2 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Nama Panggilan *
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama panggilan"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                className="mb-5 rounded-xl border px-4 py-3"
                style={{
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              />

              <Text
                className="mb-2 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="contoh@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="mb-5 rounded-xl border px-4 py-3"
                style={{
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              />

              <Text
                className="mb-2 text-xs font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Nomor HP
              </Text>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                className="mb-6 rounded-xl border px-4 py-3"
                style={{
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              />

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
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Text>
              </Pressable>

              <View className="h-6" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText="Mengerti"
        onClose={() =>
          setAlert((previous) => ({
            ...previous,
            visible: false,
          }))
        }
      />
    </SafeAreaView>
  );
}
