import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";

import { useAppTheme } from "../../theme/ThemeProvider";

export type AppAlertType = "success" | "error" | "warning" | "info" | "confirm";

type AppAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: AppAlertType;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const alertConfig = {
  success: {
    icon: "checkmark-circle" as const,
    color: "#10B981",
    background: "#D1FAE5",
  },
  error: {
    icon: "close-circle" as const,
    color: "#EF4444",
    background: "#FEE2E2",
  },
  warning: {
    icon: "warning" as const,
    color: "#F59E0B",
    background: "#FEF3C7",
  },
  info: {
    icon: "information-circle" as const,
    color: "#3B82F6",
    background: "#DBEAFE",
  },
  confirm: {
    icon: "help-circle" as const,
    color: "#F59E0B",
    background: "#FEF3C7",
  },
};

export default function AppAlert({
  visible,
  title,
  message,
  type = "info",
  onClose,
  onConfirm,
  confirmText = "Mengerti",
  cancelText = "Batal",
}: AppAlertProps) {
  const { isDark, colors } = useAppTheme();

  const config = alertConfig[type];
  const isConfirm = type === "confirm";

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  const modalBackground = isDark ? "#1F2937" : "#FFFFFF";
  const primaryText = isDark ? "#F9FAFB" : "#111827";
  const secondaryText = isDark ? "#9CA3AF" : "#6B7280";
  const cancelBackground = isDark ? "#374151" : "#F3F4F6";
  const cancelTextColor = isDark ? "#E5E7EB" : "#374151";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: "rgba(0,0,0,0.60)",
        }}
      >
        <View
          className="w-full max-w-sm rounded-3xl p-6"
          style={{
            backgroundColor: modalBackground,
            elevation: 15,
            shadowColor: "#000000",
            shadowOpacity: 0.2,
            shadowRadius: 20,
            shadowOffset: {
              width: 0,
              height: 8,
            },
          }}
        >
          <View className="mb-4 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? `${config.color}25`
                  : config.background,
              }}
            >
              <Ionicons name={config.icon} size={38} color={config.color} />
            </View>
          </View>

          <Text
            className="text-center text-lg font-bold"
            style={{ color: primaryText }}
          >
            {title}
          </Text>

          <Text
            className="mt-2 text-center text-sm leading-6"
            style={{ color: secondaryText }}
          >
            {message}
          </Text>

          {isConfirm ? (
            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 items-center rounded-2xl py-3.5"
                style={{ backgroundColor: cancelBackground }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: cancelTextColor }}
                >
                  {cancelText}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                className="flex-1 items-center rounded-2xl py-3.5"
                style={{ backgroundColor: "#EF4444" }}
              >
                <Text className="text-sm font-bold text-white">
                  {confirmText}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onClose}
              className="mt-6 items-center rounded-2xl py-3.5"
              style={{ backgroundColor: config.color }}
            >
              <Text className="text-sm font-bold text-white">
                {confirmText}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
