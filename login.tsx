import { FontAwesome, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  StatusBar
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POST_LOGIN } from "../../APIService";
import { useAuth } from "../components/context/AuthContext";
import { useCart } from "../components/cart/CartContext";

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { fetchCart } = useCart();

  // --- LOGIC GIỮ NGUYÊN ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
  email: "",
  password: "",
  general: "",
});


  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved-email");
        const savedPassword = await AsyncStorage.getItem("saved-password");
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
      } catch (e) {
        console.error("Failed to load credentials", e);
      }
    };
    loadSavedCredentials();
  }, []);

const handleLogin = async () => {
  let valid = true;
  const newErrors = { email: "", password: "", general: "" };

  // ===== VALIDATE EMAIL =====
  if (!email) {
    newErrors.email = "Vui lòng nhập email";
    valid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    newErrors.email = "Email không hợp lệ";
    valid = false;
  }

  // ===== VALIDATE PASSWORD =====
  if (!password) {
    newErrors.password = "Vui lòng nhập mật khẩu";
    valid = false;
  } else if (password.length < 6) {
    newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    valid = false;
  }

  setErrors(newErrors);
  if (!valid) return;

  // ===== CALL API =====
  setLoading(true);
  try {
    const response = await POST_LOGIN(email, password);
    const token = response?.["jwt-token"] || response?.token;

    if (!token) {
      setErrors({
        ...newErrors,
        general: "Email hoặc mật khẩu không chính xác",
      });
      return;
    }

    await login(token, email);
    await fetchCart(email);
    await AsyncStorage.setItem("saved-password", password);
    router.replace("/(home)");

  } catch (err: any) {
    // 🔥 TÙY BACKEND CÓ RESPONSE GÌ
    if (err?.response?.status === 401) {
      setErrors({
        ...newErrors,
        general: "Email hoặc mật khẩu không chính xác",
      });
    } else {
      setErrors({
        ...newErrors,
        general: "Vui lòng nhập đúng email và password!",
      });
    }
  } finally {
    setLoading(false);
  }
};

  // --- HẾT PHẦN LOGIC ---

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER GRADIENT */}
      <View style={styles.headerContainer}>
        <Text style={styles.brand}>MIXTA</Text>
        <Text style={styles.brandSub}>MIXTA iCream</Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* TAB LOGIN / SIGNUP */}
            <View style={styles.tabWrapper}>
              <View style={styles.tabActive}>
                <Text style={styles.tabActiveText}>Đăng Nhập</Text>
              </View>

              <TouchableOpacity
                style={styles.tabInactive}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={styles.tabInactiveText}>Đăng Kí</Text>
              </TouchableOpacity>

            </View>


            {/* EMAIL */}
<TextInput
  style={[styles.input, errors.email && styles.inputError]}
  placeholder="Nhập email..."
  placeholderTextColor="#B6B6C2"
  value={email}
  onChangeText={(t) => {
    setEmail(t);
    setErrors({ ...errors, email: "", general: "" });
  }}
/>
{errors.email !== "" && (
  <Text style={styles.errorText}>{errors.email}</Text>
)}


            {/* PASSWORD */}
<View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    placeholderTextColor="#B6B6C2"
    value={password}
    secureTextEntry={!showPassword}
    onChangeText={(t) => {
      setPassword(t);
      setErrors({ ...errors, password: "", general: "" });
    }}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <MaterialCommunityIcons
      name={showPassword ? "eye-outline" : "eye-off-outline"}
      size={20}
      color="#B6B6C2"
    />
  </TouchableOpacity>
</View>
{errors.password !== "" && (
  <Text style={styles.errorText}>{errors.password}</Text>
)}


            <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
              <Text style={styles.forgot}>Quên mật khẩu</Text>
            </TouchableOpacity>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Đăng Nhập</Text>
                
              )}
            </TouchableOpacity>
            {errors.general !== "" && (
  <Text style={[styles.errorText, { textAlign: "center", marginBottom: 10 }]}>
    {errors.general}
  </Text>
)}


            {/* OR */}
            <Text style={styles.or}>Hoặc</Text>

            {/* SOCIAL */}
            <View style={styles.socialRow}>
              <View style={styles.socialCircle}>
                <FontAwesome name="facebook" size={22} color="#3b5998" />
              </View>
              <View style={styles.socialCircle}>
                <FontAwesome name="twitter" size={22} color="#1DA1F2" />
              </View>
              <View style={styles.socialCircle}>
                <FontAwesome name="google" size={22} color="#DB4437" />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );

}

// --- STYLE MỚI ĐỒNG BỘ ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF5EC",
  },

  headerContainer: {
    height: 220,
    backgroundColor: "#FF8FA3",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 2,
  },

  brandSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#FFE3EA",
  },

  formSheet: {
    flex: 1,
    marginTop: -50,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30,
  },

  scrollContent: {
    paddingHorizontal: 30,
  },

  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFF0F4",
    borderRadius: 30,
    marginBottom: 30,
    overflow: "hidden", // QUAN TRỌNG
  },

  tabActive: {
    flex: 1,
    backgroundColor: "#FF5C7A",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  tabInactive: {
    flex: 1, // 👉 BẰNG NHAU
    alignItems: "center",
    justifyContent: "center",
  },

  tabActiveText: {
    color: "#FFF",
    fontWeight: "700",
  },

  tabInactiveText: {
    color: "#FF5C7A",
    fontWeight: "600",
  },


  input: {
    backgroundColor: "#FFF7F9",
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 15,
    color: "#333",
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F9",
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 16,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  forgot: {
    textAlign: "right",
    color: "#FF5C7A",
    marginTop: 10,
    marginBottom: 25,
    fontWeight: "500",
  },

  loginButton: {
    backgroundColor: "#FF5C7A",
    height: 55,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF5C7A",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  loginText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },

  or: {
    textAlign: "center",
    marginVertical: 25,
    color: "#B6B6C2",
    fontWeight: "600",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 40,
  },

  socialCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#FFF0F4",
    alignItems: "center",
    justifyContent: "center",
  },
  inputError: {
  borderWidth: 1,
  borderColor: "#FF4D4F",
},
errorText: {
  color: "#FF4D4F",
  fontSize: 12,
  marginBottom: 10,
  marginLeft: 4,
},

});
