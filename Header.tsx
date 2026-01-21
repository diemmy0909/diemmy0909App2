// app/components/Header.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Header() {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Feather name="menu" size={28} color="black" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.small}>DELIVER TO</Text>
          <Text style={styles.location}>Halal Lab office ▼</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push("/components/cart/cart")}>
        <Ionicons name="cart-outline" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  small: { fontSize: 10, color: "#FF7A00" },
  location: { fontSize: 14, fontWeight: "600" },
});
