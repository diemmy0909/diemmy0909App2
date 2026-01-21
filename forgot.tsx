import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Import hàm API
import { POST_FORGOT_PASSWORD } from "../../APIService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Định dạng email không hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const response = await POST_FORGOT_PASSWORD(email);

      if (response.status === 200 || response.status === 201) {
        if (Platform.OS === 'web') {
          alert(`Mã xác nhận đã gửi tới ${email}.`);
          router.push({
            pathname: "./VerifyOtpScreen",
            params: { email }
          });
        } else {
          Alert.alert(
            "Đã gửi mã",
            `Mã xác nhận đã được gửi tới ${email}.`,
            [
              {
                text: "Nhập mã ngay",
                onPress: () =>
                  router.push({
                    pathname: "/auth/VerifyOtpScreen",
                    params: { email }
                  })
              }
            ]
          );
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert("Lỗi", "Email chưa được đăng ký.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER ===== */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>

        {/* LOGO CODE */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>MIXTA</Text>
          <Text style={styles.logoSubText}>iCream</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Quên Mật Khẩu</Text>
          <Text style={styles.headerSubtitle}>
            Nhập email để nhận mã xác nhận
          </Text>
        </View>
      </View>

      {/* ===== FORM ===== */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>EMAIL</Text>

            <View style={styles.inputLine}>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#A0A5BA"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Ionicons
                name={email.length > 5 ? "checkmark-circle" : "mail-outline"}
                size={22}
                color={email.length > 5 ? "#FF5C7A" : "#A0A5BA"}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>GỬI MÃ</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF5EA",
  },

  /* HEADER */
  headerContainer: {
    height: 260,
    backgroundColor: "#FF8FA3",
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    alignItems: "center",
    paddingTop: 40,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  logoBox: {
    alignItems: "center",
    marginBottom: 10,
  },

  logoText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  logoSubText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFE1E8",
    marginTop: -4,
  },

  headerTextContainer: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },

  /* FORM */
  formSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -80,
    paddingTop: 30,
    elevation: 6,
  },

  scrollContent: {
    paddingHorizontal: 26,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B0B0B0",
    marginBottom: 6,
    marginTop: 10,
  },

  inputLine: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    height: 48,
    marginBottom: 30,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  primaryBtn: {
    backgroundColor: "#FF5C7A",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
