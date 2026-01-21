import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from "react-native";

import { POST_RESET_PASSWORD } from "../../APIService";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== LOGIC GIỮ NGUYÊN =====
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Platform.OS === 'web'
        ? window.alert("Vui lòng nhập đủ thông tin")
        : Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      Platform.OS === 'web'
        ? window.alert("Mật khẩu phải từ 6 ký tự trở lên")
        : Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      Platform.OS === 'web'
        ? window.alert("Mật khẩu xác nhận không khớp")
        : Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await POST_RESET_PASSWORD(email as string, password);

      if (response.status === 200) {
        if (Platform.OS === 'web') {
          if (window.confirm("Đổi mật khẩu thành công. Đăng nhập lại?")) {
            router.replace("/auth/login");
          }
        } else {
          Alert.alert(
            "Thành công",
            "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
            [{ text: "OK", onPress: () => router.replace("/auth/login") }]
          );
        }
      }
    } catch (error) {
      Platform.OS === 'web'
        ? window.alert("Không thể đổi mật khẩu")
        : Alert.alert("Lỗi", "Không thể đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER HỒNG ===== */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mật Khẩu Mới</Text>
        <Text style={styles.headerSubtitle}>
          Nhập mật khẩu mới cho tài khoản
        </Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* ===== FORM TRẮNG ===== */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* MẬT KHẨU */}
            <Text style={styles.label}>MẬT KHẨU MỚI</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="******"
                placeholderTextColor="#A0A5BA"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#A0A5BA"
                />
              </TouchableOpacity>
            </View>

            {/* XÁC NHẬN */}
            <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="******"
                placeholderTextColor="#A0A5BA"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#A0A5BA"
                />
              </TouchableOpacity>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryText}>ĐỔI MẬT KHẨU</Text>
              }
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

/* ================= STYLE ĐỒNG BỘ LOGIN ================= */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF5EA",
  },

headerContainer: {
  height: 320, // ⬅️ tăng chiều cao
  backgroundColor: "#FF8FA3",
  borderBottomLeftRadius: 140,
  borderBottomRightRadius: 140,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 60, // ⬅️ đẩy nội dung lên
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

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },

emailText: {
  marginTop: 14,
  fontSize: 14,
  fontWeight: "700",
  color: "#FF5C7A",
  backgroundColor: "rgba(255,255,255,0.85)",
  paddingHorizontal: 16,
  paddingVertical: 6,
  borderRadius: 20,
},


formSheet: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 36,
  borderTopRightRadius: 36,
  marginTop: -60, // ⬅️ giảm đè lên
  paddingTop: 28,
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

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    marginBottom: 18,
  },

  passwordInput: {
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
    marginTop: 30,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

});
