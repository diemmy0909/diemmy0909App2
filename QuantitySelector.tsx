import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantitySelector({
  value,
  onIncrease,
  onDecrease,
}: QuantitySelectorProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1B1C2A",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
    >
      {/* MINUS BUTTON */}
      <TouchableOpacity
        onPress={onDecrease}
        style={{
          width: 34,
          height: 34,
          borderRadius: 20,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="remove" size={20} color="#1B1C2A" />
      </TouchableOpacity>

      <Text
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: "700",
          marginHorizontal: 14,
        }}
      >
        {value}
      </Text>

      {/* PLUS BUTTON */}
      <TouchableOpacity
        onPress={onIncrease}
        style={{
          width: 34,
          height: 34,
          borderRadius: 20,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={20} color="#1B1C2A" />
      </TouchableOpacity>
    </View>
  );
}
