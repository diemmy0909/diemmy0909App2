import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// [MỚI] Import bộ icon để đồng bộ giao diện
import { Feather, Ionicons } from "@expo/vector-icons";

// Import API
import { GET_USER_BY_EMAIL, PUT_EDIT } from "../../../APIService";
  const COLORS = {
  bg: "#FFF0F6",
  primary: "#FF4D8D",
  text: "#3A0D22",
  subText: "#8F3A5B",
  white: "#FFFFFF",
};
export default function EditProfile() {
  const router = useRouter();
  // 👉 VIẾT Ở ĐÂY
  const safeBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  // State dữ liệu
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("Yêu thích ẩm thực");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  // 1. Tải dữ liệu thật
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved-email");
      if (!savedEmail) {
        setLoading(false);
        return;
      }

      const response = await GET_USER_BY_EMAIL(savedEmail);
      const u = response.data;

      setUserId(u.userId);
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setEmail(u.email);
      setPhone(u.mobileNumber);

    } catch (error) {
      console.error("Lỗi tải thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lưu thay đổi
  const handleSave = async () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ Họ, Tên và SĐT");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        userId: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        mobileNumber: phone,
        // Không gửi password hay roles để tránh lỗi 400 và lỗi logic
      };

      await PUT_EDIT(`public/users/${userId}`, updateData);

if (Platform.OS === "web") {
  alert("Thành công: Đã cập nhật hồ sơ!");
  safeBack();
} else {
  Alert.alert("Thành công", "Đã cập nhật hồ sơ!", [
    { text: "OK", onPress: safeBack }
  ]);
}


    } catch (error) {
      console.error("Lỗi lưu:", error);
      Alert.alert("Lỗi", "Không thể lưu thay đổi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ff8a34" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
<TouchableOpacity
  style={styles.headerBtn}
  onPress={() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }}
>
              {/* [ĐÃ ĐỔI] Dùng Feather Icon giống trang PersonalInfo */}
              <Feather name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>

            <View style={{ width: 38 }} />
          </View>

          {/* AVATAR */}
          <View style={styles.avatarBox}>
            <View style={styles.avatarCircle}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.avatar}
              />
            </View>

            <TouchableOpacity style={styles.editIcon}>
              {/* [ĐÃ ĐỔI] Dùng Icon cây bút thay vì text */}
              <Feather name="edit-2" size={14} color="white" />
            </TouchableOpacity>
          </View>

          {/* FORM INPUTS */}

          <Text style={styles.label}>HỌ (LAST NAME)</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>TÊN (FIRST NAME)</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[styles.input, { color: '#999' }]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>GIỚI THIỆU (BIO)</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            value={bio}
            multiline
            onChangeText={setBio}
          />

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveText}>LƯU</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    padding: 18,
    paddingTop: 50,
  },

  /** HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  /** AVATAR */
  avatarBox: {
    alignItems: "center",
    marginBottom: 28,
  },

  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4EC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -2,
    right: 120 / 2 - 15,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  /** FORM */
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.subText,
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "#FFE4EC",
  },

  /** SAVE BUTTON */
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 36,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  saveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
