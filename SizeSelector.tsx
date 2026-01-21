import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SizeSelector({ value, onChange }: Props) {
  const sizes = ["10", "14", "16"];

  return (
    <View style={{ flexDirection: "row", marginTop: 12 }}>
      {sizes.map((s) => {
        const active = value === s;

        return (
          <TouchableOpacity
            key={s}
            onPress={() => onChange(s)}
            style={{
              width: 58,
              height: 58,
              borderRadius: 30,
              backgroundColor: active ? "#FF7A00" : "#F2F2F2",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,

              shadowColor: active ? "#FF7A00" : "transparent",
              shadowOpacity: active ? 0.25 : 0,
              shadowRadius: 8,
              elevation: active ? 4 : 0,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                color: active ? "#fff" : "#333",
                fontSize: 16,
              }}
            >
              {s}"
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
