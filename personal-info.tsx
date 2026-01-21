import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // [MỚI] Import useFocusEffect
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GET_USER_BY_EMAIL, PUT_CHANGE_PASSWORD } from "../../../APIService";

export default function PersonalInfo() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State đổi mật khẩu
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPass.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      const email = user?.email || displayUser?.email;
      if (!email) return;

      await PUT_CHANGE_PASSWORD(email, { oldPassword: oldPass, newPassword: newPass });
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      setShowPassModal(false);
      setOldPass(""); setNewPass(""); setConfirmPass("");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Mật khẩu cũ không chính xác!";
      Alert.alert("Thất bại", msg);
    }
  };

  // Hàm tải dữ liệu
  const fetchUserData = async () => {
    // Không set loading=true ở đây để tránh nháy màn hình khi quay lại
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const response = await GET_USER_BY_EMAIL(email);
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi tải User:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // [MỚI] Tự động chạy lại hàm này mỗi khi màn hình được "Focus" (quay lại từ trang khác)
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  if (loading && !user) {
    return (
      <View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff8a34" />
      </View>
    );
  }

  const displayUser = user || {
    firstName: "User",
    lastName: "Name",
    email: "email@example.com",
    mobileNumber: "..."
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(home)/index' as any);
          }
        }}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.title}>HỒ SƠ CÁ NHÂN</Text>

        <TouchableOpacity
          onPress={() => router.push("/components/profile/edit-profile")}
        >
          <Text style={styles.editText}>SỬA</Text>
        </TouchableOpacity>
      </View>

      {/* USER INFO */}
      <View style={styles.profileBox}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../../assets/images/avatar.png")}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </View>

        <Text style={styles.name}>{displayUser.firstName} {displayUser.lastName}</Text>
        <Text style={styles.bio}>{displayUser.roles && displayUser.roles.length > 0 ? "Thành viên thân thiết" : "Khách hàng mới"}</Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        {/* FULL NAME */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="person" size={22} color="#FF4D8D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>HỌ VÀ TÊN</Text>
            <Text style={styles.itemValue}>{displayUser.firstName} {displayUser.lastName}</Text>
          </View>
        </View>

        {/* EMAIL */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="mail" size={22} color="#FF4D8D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>EMAIL</Text>
            <Text style={styles.itemValue}>{displayUser.email}</Text>
          </View>
        </View>

        {/* PHONE */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="call" size={22} color="#FF4D8D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>SỐ ĐIỆN THOẠI</Text>
            <Text style={styles.itemValue}>{displayUser.mobileNumber || "Chưa cập nhật"}</Text>
          </View>
        </View>

        {/* USER ID (Thêm cho đầy đủ) */}
        <View style={[styles.item, { marginBottom: 0 }]}>
          <View style={styles.iconBox}>
            <Ionicons name="finger-print" size={22} color="#FF4D8D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>MÃ KHÁCH HÀNG</Text>
            <Text style={styles.itemValue}>#{displayUser.userId || "Unknown"}</Text>
          </View>
        </View>
      </View>

      {/* BUTTON ĐỔI MẬT KHẨU */}
      <TouchableOpacity
        style={styles.changePassBtn}
        onPress={() => setShowPassModal(true)}
      >
        <Ionicons name="key-outline" size={20} color="#FF4D8D" style={{ marginRight: 10 }} />
        <Text style={styles.changePassText}>Đổi mật khẩu</Text>
      </TouchableOpacity>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal visible={showPassModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={oldPass}
              onChangeText={setOldPass}
              placeholder="Nhập mật khẩu hiện tại"
            />

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Nhập mật khẩu mới"
            />

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholder="Nhập lại mật khẩu mới"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#EEE' }]}
                onPress={() => {
                  setShowPassModal(false);
                  setOldPass(""); setNewPass(""); setConfirmPass("");
                }}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#FF4D8D' }]}
                onPress={handleChangePassword}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// [STYLE CHUẨN GỐC - Đã bỏ paddingTop 50]
// [STYLE MỚI - PINK THEME]
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFF0F6", // 🌸 nền hồng nhạt
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#FF4D8D", // Hồng đậm
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },

  editText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "800",
  },

  /* ---------- PROFILE BOX ---------- */
  profileBox: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#FFF",
  },

  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4D8D',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#3A0D22",
    marginBottom: 4,
  },

  bio: {
    color: "#8F3A5B",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#FFE4EC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#FFE4EC",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  iconBox: {
    width: 46,
    height: 46,
    backgroundColor: "#FFF0F6",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  itemLabel: {
    fontSize: 11,
    color: "#B23A6F", // Hồng tím nhạt
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  itemValue: {
    color: "#3A0D22", // Tím đậm
    fontWeight: "700",
  },

  changePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FF4D8D',
  },
  changePassText: {
    color: '#FF4D8D',
    fontWeight: '800',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3A0D22',
    textAlign: 'center',
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5
  }
});