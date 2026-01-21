// components/HeaderBar.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "react-native";

export default function HeaderBar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }}>
      <TouchableOpacity onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(home)/home' as any);
        }
      }} style={{
        width: 38, height: 38, borderRadius: 19, backgroundColor: "#e6e9ef", alignItems: "center", justifyContent: "center"
      }}>
        <Ionicons name="chevron-back" size={20} color="#4a4a4a" />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "600" }}>{title}</Text>

      <TouchableOpacity style={{
        width: 38, height: 38, borderRadius: 19, backgroundColor: "#e6e9ef", alignItems: "center", justifyContent: "center"
      }}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#4a4a4a" />
      </TouchableOpacity>
    </View>
  );
}
