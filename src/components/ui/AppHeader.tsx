import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  onNotificationPress?: () => void;
};

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showNotification = false,
  onNotificationPress,
}: AppHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable
            onPress={onBack}
            className="mr-3 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>
        )}

        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {title}
          </Text>

          {subtitle && (
            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {showNotification && (
        <Pressable
          onPress={onNotificationPress}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color={colors.text}
          />
        </Pressable>
      )}
    </View>
  );
}
