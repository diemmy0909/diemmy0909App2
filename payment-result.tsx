import { useEffect } from "react";
import { Alert, View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

export default function PaymentResult() {
  const router = useRouter();

  // ✅ Sử dụng useURL() như một hook bên ngoài useEffect
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const parsed = Linking.parse(url);
      const resultCode = parsed.queryParams?.resultCode;

      console.log("🔗 Deep Link URL:", url);
      console.log("📋 Parsed params:", parsed.queryParams);
      console.log("📌 Result Code:", resultCode);

      // ❌ Thanh toán thất bại / huỷ (resultCode !== "0")
      if (resultCode !== "0") {
        const message = parsed.queryParams?.message || "Bạn đã huỷ giao dịch MoMo";
        Alert.alert(
          "Thanh toán thất bại",
          decodeURIComponent(message as string),
          [
            {
              text: "Xem đơn hàng vừa đặt",
              onPress: () => router.replace("/components/order/order-detail"),
            },
          ]
        );
      } else {
        // ✅ Thành công
        router.replace("/components/order/order-detail");
      }
    }
  }, [url]); // ✅ Thêm url vào dependency array

  // Hiển thị loading khi đang xử lý
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF4D8D" />
      <Text style={styles.text}>Đang xử lý kết quả thanh toán...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F6",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
