import React from "react";
import { ScrollView, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../theme/ThemeProvider";

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  safeArea?: boolean;
} & ViewProps;

export default function ScreenContainer({
  children,
  scrollable = true,
  className = "",
  contentClassName = "",
  safeArea = true,
  ...props
}: ScreenContainerProps) {
  const { colors } = useAppTheme();

  const content = scrollable ? (
    <ScrollView
      style={{
        width: "100%",
        maxWidth: 430,
        flex: 1,
      }}
      contentContainerClassName={`px-5 pb-8 ${contentClassName}`}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={`px-5 ${contentClassName}`}
      style={{
        width: "100%",
        maxWidth: 430,
        flex: 1,
      }}
    >
      {children}
    </View>
  );

  const containerStyle = {
    flex: 1,
    width: "100%" as const,
    alignItems: "center" as const,
    backgroundColor: colors.background,
  };

  if (safeArea) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={containerStyle}
        className={className}
        {...props}
      >
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle} className={className} {...props}>
      {content}
    </View>
  );
}
