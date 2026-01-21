import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { POST_ADD } from "../../APIService";

export default function SignUpScreen() {
  const router = useRouter();

  /* ===== STATE ===== */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    buildingName: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    street: "",
    buildingName: "",
    pincode: "",
  });

  /* ===== REGISTER ===== */
  const registerUser = async () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      street: "",
      buildingName: "",
      pincode: "",
    };

    if (!/^[a-zA-Z]{2,20}$/.test(firstName)) {
      newErrors.firstName = "Tên chỉ gồm chữ (2–20 ký tự)";
      valid = false;
    }

    if (!/^[a-zA-Z]{2,20}$/.test(lastName)) {
      newErrors.lastName = "Họ chỉ gồm chữ (2–20 ký tự)";
      valid = false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = "Số điện thoại phải đúng 10 chữ số";
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
      valid = false;
    }

    if (address.street.length < 5) {
      newErrors.street = "Đường/Phố tối thiểu 5 ký tự";
      valid = false;
    }

    if (address.buildingName.length < 5) {
      newErrors.buildingName = "Tên tòa nhà tối thiểu 5 ký tự";
      valid = false;
    }

    if (address.pincode.length < 6) {
      newErrors.pincode = "Mã bưu điện tối thiểu 6 số";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    const payload = {
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      // [FIX] Backend cần field 'address' (số ít) để lưu địa chỉ khi tạo user
      address: {
        street: address.street,
        buildingName: address.buildingName,
        city: address.city,
        state: address.state,
        country: "Việt Nam",
        pincode: address.pincode,
      },
      addresses: [
        {
          street: address.street,
          buildingName: address.buildingName,
          city: address.city,
          state: address.state,
          country: "Việt Nam",
          pincode: address.pincode,
        },
      ],
    };

    try {
      await POST_ADD("register", payload);
      router.replace("/auth/login");
    } catch {
      setErrors({ ...newErrors, email: "Email đã tồn tại" });
    }
  };


  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER MIXTA ===== */}
      <View style={styles.headerContainer}>
        <Text style={styles.brand}>MIXTA</Text>
        <Text style={styles.brandSub}>MIXTA iCream</Text>
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
            {/* ===== TAB ===== */}
            <View style={styles.tabWrapper}>
              <TouchableOpacity
                style={styles.tabInactive}
                onPress={() => router.replace("/auth/login")}
              >
                <Text style={styles.tabInactiveText}>Đăng nhập</Text>
              </TouchableOpacity>

              <View style={styles.tabActive}>
                <Text style={styles.tabActiveText}>Đăng ký</Text>
              </View>
            </View>

            {/* ===== INPUT ===== */}
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Tên"
              value={firstName}
              onChangeText={(t) => {
                setFirstName(t);
                setErrors({ ...errors, firstName: "" });
              }}
            />
            {errors.firstName !== "" && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Họ"
              value={lastName}
              onChangeText={(t) => {
                setLastName(t);
                setErrors({ ...errors, lastName: "" });
              }}
            />
            {errors.lastName !== "" && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={email}
              autoCapitalize="none"
              onChangeText={(t) => {
                setEmail(t);
                setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email !== "" && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={[styles.input, errors.mobileNumber && styles.inputError]}
              placeholder="Số điện thoại"
              value={mobileNumber}
              keyboardType="phone-pad"
              onChangeText={(t) => {
                setMobileNumber(t);
                setErrors({ ...errors, mobileNumber: "" });
              }}
            />
            {errors.mobileNumber !== "" && (
              <Text style={styles.errorText}>{errors.mobileNumber}</Text>
            )}

            {/* ===== PASSWORD ===== */}
            <View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mật khẩu"
                value={password}
                secureTextEntry={!showPassword}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors({ ...errors, password: "" });
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#B6B6C2"
                />
              </TouchableOpacity>
            </View>
            {errors.password !== "" && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* ===== ADDRESS ===== */}
            <Text style={styles.sectionTitle}>ĐỊA CHỈ GIAO HÀNG</Text>

            <TextInput
              style={[styles.input, errors.street && styles.inputError]}
              placeholder="Đường/Phố"
              value={address.street}
              onChangeText={(t) => {
                setAddress({ ...address, street: t });
                setErrors({ ...errors, street: "" });
              }}
            />
            {errors.street !== "" && (
              <Text style={styles.errorText}>{errors.street}</Text>
            )}

            <TextInput
              style={[styles.input, errors.buildingName && styles.inputError]}
              placeholder="Tên tòa nhà"
              value={address.buildingName}
              onChangeText={(t) => {
                setAddress({ ...address, buildingName: t });
                setErrors({ ...errors, buildingName: "" });
              }}
            />
            {errors.buildingName !== "" && (
              <Text style={styles.errorText}>{errors.buildingName}</Text>
            )}

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 0.48 }]}
                placeholder="Thành phố"
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
              <TextInput
                style={[styles.input, { flex: 0.48 }]}
                placeholder="Quận/Huyện"
                value={address.state}
                onChangeText={(t) => setAddress({ ...address, state: t })}
              />
            </View>

            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              placeholder="Mã bưu điện"
              value={address.pincode}
              keyboardType="numeric"
              onChangeText={(t) => {
                setAddress({ ...address, pincode: t });
                setErrors({ ...errors, pincode: "" });
              }}
            />
            {errors.pincode !== "" && (
              <Text style={styles.errorText}>{errors.pincode}</Text>
            )}


            {/* ===== BUTTON ===== */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={registerUser}
            >
              <Text style={styles.signUpText}>Đăng ký</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    overflow: "hidden",
  },

  tabActive: {
    flex: 1,
    backgroundColor: "#FF5C7A",
    paddingVertical: 12,
    alignItems: "center",
  },

  tabInactive: {
    flex: 1,
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
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F9",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
  },

  sectionTitle: {
    marginVertical: 14,
    fontWeight: "700",
    color: "#FF5C7A",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  signUpButton: {
    backgroundColor: "#FF5C7A",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  signUpText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
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
