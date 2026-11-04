import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { formatRupiah } from "../../../utils/currency";

type BalanceCardProps = {
  balance: number;
  percentage?: number;
};

export default function BalanceCard({
  balance,
  percentage = 0,
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <LinearGradient
      colors={["#009F91", "#1767C9", "#7439E8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        minHeight: 150,
        borderRadius: 22,
        padding: 20,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ornamen gradient */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -12,
          bottom: -35,
          opacity: 0.55,
        }}
      >
        <Svg width={190} height={145} viewBox="0 0 190 145">
          <Path
            d="M0 145 C45 110 65 75 100 65 C135 55 145 20 190 0 L190 145 Z"
            fill="#A78BFA"
          />
          <Path
            d="M55 145 C95 110 115 90 145 75 C165 65 175 50 190 35 L190 145 Z"
            fill="#C4B5FD"
            opacity={0.35}
          />
        </Svg>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#E0F2FE", fontSize: 14, fontWeight: "500" }}>
          Total Saldo
        </Text>

        <Pressable onPress={() => setHidden(!hidden)} hitSlop={12}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          color: "#FFFFFF",
          fontSize: 29,
          fontWeight: "800",
          marginTop: 13,
        }}
      >
        {hidden ? "••••••••••" : formatRupiah(balance)}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 15,
        }}
      >
        <Ionicons
          name={percentage >= 0 ? "trending-up" : "trending-down"}
          size={16}
          color="#6EE7B7"
        />

        <Text
          style={{
            color: "#D1FAE5",
            fontSize: 12,
            fontWeight: "600",
            marginLeft: 7,
          }}
        >
          {percentage >= 0 ? "+" : ""}
          {percentage}% dari bulan lalu
        </Text>
      </View>
    </LinearGradient>
  );
}
