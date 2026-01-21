import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../components/context/AuthContext";
import { useCart } from "../components/cart/CartContext";
import { GET_USER_BY_EMAIL, GET_USER_ORDERS } from "../../APIService";


export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const { clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState({
    pending: 0,
    picking: 0,
    shipping: 0,
    review: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved-email");
      if (savedEmail) {
        const response = await GET_USER_BY_EMAIL(savedEmail);
        if (response && response.data) {
          setUser(response.data);
          fetchOrderCounts(savedEmail); // [NEW] Lấy số lượng đơn
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async (email: string) => {
    try {
      const res = await GET_USER_ORDERS(email);
      const orders = res.data || [];

      let counts = { pending: 0, picking: 0, shipping: 0, review: 0 };

      orders.forEach((o: any) => {
        const s = (o.orderStatus || "").toLowerCase();
        if (s === 'pending payment' || s === 'order accepted!') counts.pending++;
        else if (s === 'pending') counts.picking++;
        else if (s === 'shipped') counts.shipping++;
        else if (s === 'delivered' || s === 'completed') counts.review++;
      });

      setOrderCount(counts);
    } catch (e) {
      console.log("Lỗi đếm đơn:", e);
    }
  };

  const Badge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  };

  const Item = ({
    label, icon, iconBg, screen, onPress,
  }: {
    label: string; icon: React.ReactNode; iconBg: string; screen?: string; onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      onPress={onPress ? onPress : () => screen && router.push(screen as any)}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#bfc4d1" />
    </TouchableOpacity>
  );

  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("jwt-token");
      await AsyncStorage.removeItem("saved-email");
      await AsyncStorage.removeItem("saved-password");
      clearCart(); // [NEW] Xóa sạch giỏ hàng cũ khỏi bộ nhớ
      logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (confirm) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: performLogout,
          },
        ]
      );
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#ff8a4c" />
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(home)/index' as any);
            }
          }}>
            <Ionicons name="chevron-back" size={20} color="#4a4a4a" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hồ sơ</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#4a4a4a" />
          </TouchableOpacity>
        </View>

        <View style={styles.userSection}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : "Khách"}
          </Text>
          <Text style={styles.userBio}>
            {user?.email || "Chưa đăng nhập"}
          </Text>
        </View>

        {/* ORDER STATUS DASHBOARD */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', paddingVertical: 18, justifyContent: 'space-around' }}>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push({ pathname: '/components/order/order', params: { tab: 'Chờ xác nhận' } })}>
              <View style={{ marginBottom: 8, position: 'relative' }}>
                <Ionicons name="wallet-outline" size={26} color="#4a4a4a" />
                <Badge count={orderCount.pending} />
              </View>
              <Text style={{ fontSize: 12, color: '#4a4a4a' }}>Chờ xác nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push({ pathname: '/components/order/order', params: { tab: 'Chờ lấy hàng' } })}>
              <View style={{ marginBottom: 8, position: 'relative' }}>
                <Ionicons name="cube-outline" size={26} color="#4a4a4a" />
                <Badge count={orderCount.picking} />
              </View>
              <Text style={{ fontSize: 12, color: '#4a4a4a' }}>Chờ lấy hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push({ pathname: '/components/order/order', params: { tab: 'Đang giao' } })}>
              <View style={{ marginBottom: 8, position: 'relative' }}>
                <Ionicons name="bicycle-outline" size={26} color="#4a4a4a" />
                <Badge count={orderCount.shipping} />
              </View>
              <Text style={{ fontSize: 12, color: '#4a4a4a' }}>Đang giao</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push({ pathname: '/components/order/order', params: { tab: 'Đánh giá' } })}>
              <View style={{ marginBottom: 8, position: 'relative' }}>
                <Ionicons name="star-outline" size={26} color="#4a4a4a" />
                {/* Badge Đánh giá (tùy chọn) */}
              </View>
              <Text style={{ fontSize: 12, color: '#4a4a4a' }}>Đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Item label="Thông tin cá nhân" icon={<Ionicons name="person-outline" size={20} color="#ff8a4c" />} iconBg="#ffe6d9" screen="/components/profile/personal-info" />
          <Item label="Địa chỉ giao hàng" icon={<Ionicons name="location-outline" size={20} color="#7d6cff" />} iconBg="#ebe7ff" screen="/components/profile/address" />
        </View>

        <View style={styles.card}>
          {/* [ĐÃ SỬA] Đổi Giỏ hàng -> Đơn hàng (Lịch sử mua hàng) */}
          <Item
            label="Đơn hàng của tôi"
            icon={<Ionicons name="receipt-outline" size={22} color="#5cb4ff" />}
            iconBg="#d6effe"
            screen="/components/order/order"
          />
          <Item label="Yêu thích" icon={<Ionicons name="heart-outline" size={20} color="#ff6b98" />} iconBg="#ffe0ea" screen="/favourite" />
          <Item label="Thông báo" icon={<Ionicons name="notifications-outline" size={20} color="#ffa94d" />} iconBg="#ffe9d6" screen="/notifications" />
          <Item label="Phương thức thanh toán" icon={<Ionicons name="card-outline" size={20} color="#39c2ad" />} iconBg="#d9f5f1" screen="/payment" />
        </View>

        <View style={styles.card}>
          <Item label="FAQs" icon={<Ionicons name="help-circle-outline" size={20} color="#ff825c" />} iconBg="#ffe6dd" screen="/faq" />
          <Item label="Cài đặt" icon={<Ionicons name="settings-outline" size={20} color="#8b67ff" />} iconBg="#eee6ff" screen="/settings" />
        </View>

        <View style={styles.card}>
          <Item
            label="Đăng xuất"
            icon={<Feather name="log-out" size={20} color="#ff6b6b" />}
            iconBg="#ffe1e1"
            onPress={handleLogout}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* ---------- PAGE ---------- */
  page: {
    flex: 1,
    backgroundColor: "#FFF0F6", // 🌸 hồng nhạt
  },

  container: {
    padding: 18,
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
    marginTop: 40,
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  headerText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#3A0D22",
  },

  /* ---------- USER INFO ---------- */
  userSection: {
    alignItems: "center",
    marginBottom: 26,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: "#FF4D8D",
    backgroundColor: "#FFE4EC",
  },

  userName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#3A0D22",
  },

  userBio: {
    marginTop: 6,
    fontSize: 13,
    color: "#8F3A5B",
    fontWeight: "500",
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFE4EC",
  },

  /* ---------- ITEM ROW ---------- */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE4EC",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  itemLabel: {
    fontSize: 15,
    flex: 1,
    color: "#3A0D22",
    fontWeight: "700",
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ee4387',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
    paddingHorizontal: 2
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold'
  }
});
