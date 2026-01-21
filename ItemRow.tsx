// components/ItemRow.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemRow({
  label,
  icon,
  iconBg,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  iconBg?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#f1f2f4",
      backgroundColor: "#fff"
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
        marginRight: 14, backgroundColor: iconBg ?? "#eee"
      }}>
        {icon}
      </View>

      <Text style={{ flex: 1, fontSize: 15, color: "#222" }}>{label}</Text>

      <Ionicons name="chevron-forward" size={20} color="#bfc4d1" />
    </TouchableOpacity>
  );
}
