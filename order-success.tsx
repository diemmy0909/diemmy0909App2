import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

const COLORS = {
  bg: "#FFF0F6",
  primary: "#FF4D8D",
  text: "#3A0D22",
  subText: "#8F3A5B",
  white: "#FFFFFF",
};

export default function OrderSuccess() {
  const router = useRouter();
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    animation.current?.play();
  }, []);

  const handleNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(home)/home" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Animation */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.lottieContainer}
        >
          <LottieView
            ref={animation}
            autoPlay
            loop={false}
            style={{ width: 220, height: 220 }}
            source={require("../../../assets/animations/success.json")}
          />
        </MotiView>

        {/* Text */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <Text style={styles.title}>Thanh toán thành công 🎉</Text>
          <Text style={styles.subText}>
            Đơn hàng của bạn đã được xác nhận{"\n"}
            và đang được chuẩn bị.
          </Text>
        </MotiView>

        {/* Info box */}
        <MotiView
          style={styles.infoBox}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500 }}
        >
          <Text style={styles.infoLabel}>Thời gian giao dự kiến</Text>
          <Text style={styles.infoValue}>30 – 45 phút</Text>
        </MotiView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNavigation}>
          <Text style={styles.primaryText}>THEO DÕI ĐƠN HÀNG</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleNavigation}>
          <Text style={styles.secondaryText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  lottieContainer: {
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },

  subText: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 22,
  },

  infoBox: {
    marginTop: 32,
    width: "100%",
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  infoLabel: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4,
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
  },

  primaryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE4EC",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
});
