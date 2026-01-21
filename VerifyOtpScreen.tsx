import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { POST_VERIFY_OTP } from "../../APIService";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // 🔴 NEW: lỗi hiển thị dưới OTP
  const [errorMessage, setErrorMessage] = useState("");

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ⏱ Đếm ngược
  useEffect(() => {
    let interval: any;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // ✍️ Nhập OTP
  const handleOtpChange = (text: string, index: number) => {
    const val = text.slice(-1);
    if (!/^\d+$/.test(val) && val !== "") return;

    // 👉 Xoá lỗi khi người dùng nhập lại
    if (errorMessage) setErrorMessage("");

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }: any, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Xác thực OTP
  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setErrorMessage("Vui lòng nhập đủ 6 số mã xác nhận.");
      return;
    }

    setLoading(true);
    try {
      const response = await POST_VERIFY_OTP(email as string, otpCode);

      if (response.status === 200 || response.status === 201) {
        if (Platform.OS === "web") {
          if (window.confirm("Xác thực thành công!")) {
            router.replace(`/auth/reset-password?email=${email}`);
          }
        } else {
          Alert.alert("Thành công", "Xác thực thành công!", [
            {
              text: "OK",
              onPress: () =>
                router.replace({
                  pathname: "/auth/reset-password",
                  params: { email }
                })
            }
          ]);
        }
      }
    } catch (error) {
      // 🔴 Hiển thị lỗi dưới OTP (không dùng Alert)
      setErrorMessage("Mã xác nhận không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage("");
    inputRefs.current[0]?.focus();
    Alert.alert("Đã gửi lại", `Mã xác nhận mới đã được gửi tới ${email}`);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Xác Thực OTP</Text>
          <Text style={styles.headerSubtitle}>
            Chúng tôi đã gửi mã xác nhận đến email
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.codeLabelContainer}>
              <Text style={styles.inputLabel}>MÃ CODE (6 SỐ)</Text>
              <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                <Text style={styles.resendText}>
                  {canResend ? (
                    <Text style={styles.highlightText}>Gửi lại mã</Text>
                  ) : (
                    `Gửi lại sau ${timer}s`
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* OTP INPUT */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    errorMessage && styles.otpInputError
                  ]}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(t) => handleOtpChange(t, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* 🔴 ERROR MESSAGE */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>XÁC NHẬN</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#ec3481" },

  headerContainer: {
    height: 180,
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: "center"
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 45,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center"
  },

  headerTextContainer: { marginTop: 15, alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "#fcf6f7" },
  emailText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  formSheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40
  },

  scrollContent: { paddingHorizontal: 24 },

  codeLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d22e49"
  },

  resendText: { fontSize: 14, color: "#aaa" },
  highlightText: { color: "#ff227e", fontWeight: "bold" },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F0F5FA",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },

  otpInputFilled: {
    borderWidth: 2,
    borderColor: "#ff226f"
  },

  // 🔴 viền đỏ khi lỗi
  otpInputError: {
    borderWidth: 2,
    borderColor: "#ff3b3b"
  },

  errorText: {
    color: "#ff3b3b",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 5
  },

  primaryBtn: {
    backgroundColor: "#eb3b82",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16
  }
});
