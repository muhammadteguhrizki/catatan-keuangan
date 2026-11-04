import { ActivityIndicator, Pressable, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: AppButtonProps) {
  const buttonColors = {
    primary: "bg-violet-600",
    secondary: "bg-slate-700",
    outline: "border border-violet-500 bg-transparent",
    danger: "bg-red-500",
  };

  const textColors = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-violet-500",
    danger: "text-white",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        flex-row items-center justify-center
        rounded-2xl px-5 py-4
        ${buttonColors[variant]}
        ${disabled ? "opacity-50" : "active:opacity-80"}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`text-base font-semibold ${textColors[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
