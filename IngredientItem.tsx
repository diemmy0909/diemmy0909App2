// components/home/IngredientItem.tsx
import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  icon: string;
}

export default function IngredientItem({ icon }: Props) {
  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FFE8D6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={26}
        color="#FF7A00"
      />
    </View>
  );
}
