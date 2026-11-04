import React from "react";
import { View, ViewProps } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

type AppCardProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
};

export default function AppCard({
  children,
  className = "",
  style,
  ...props
}: AppCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 20,
        },
        style,
      ]}
      className={`p-4 ${className}`}
    >
      {children}
    </View>
  );
}
