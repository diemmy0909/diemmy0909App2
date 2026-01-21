
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Alert, ActivityIndicator } from "react-native";
import { getProductImageUrl, POST_RETRY_PAYMENT, PUT_CANCEL_ORDER, GET_ORDER_DETAIL, GET_USER_BY_EMAIL } from "../../../APIService";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Lấy dữ liệu đơn hàng được gửi sang
  // Lấy dữ liệu đơn hàng được gửi sang
  // Support both passing full object (orderData) or just ID (orderId)
  const initialOrder = params.orderData ? JSON.parse(params.orderData as string) : null;
  const [order, setOrder] = useState<any>(initialOrder);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(!initialOrder); // Loading if no initial data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem("saved-email");
        if (!email) return;

        // 1. Fetch User Info
        GET_USER_BY_EMAIL(email).then(res => {
          if (res && res.data) setUser(res.data);
        }).catch(err => console.log("Lỗi tải user:", err));

        // 2. If no order data, fetch by ID
        if (!order && params.orderId) {
          console.log("Fetching order by ID:", params.orderId);
          const res = await GET_ORDER_DETAIL(email, params.orderId as string);
          if (res && res.data) {
            setOrder(res.data);
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết đơn hàng:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Show payment failed message if present
    if (params.paymentFailed === 'true') {
      const msg = params.message ? decodeURIComponent(params.message as string) : "Thanh toán bị hủy hoặc thất bại.";
      if (Platform.OS === 'web') {
        // Delay slightly to ensure UI is ready
        setTimeout(() => alert("❌ " + msg), 500);
      } else {
        Alert.alert("Thanh toán thất bại", msg);
      }
    }
  }, [params.orderId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4D8D" />
        <Text style={{ marginTop: 10, color: '#888' }}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  // Xử lý thanh toán lại
  const handleRetryPayment = async () => {
    try {
      const response = await POST_RETRY_PAYMENT(order.orderId);
      if (response && response.data) {
        const { deeplink, payUrl } = response.data;

        // 1. Nếu là Web -> LUÔN chạy link Web (payUrl) để quét QR
        if (Platform.OS === 'web') {
          if (payUrl) {
            window.location.href = payUrl; // Redirect trên web
          } else {
            Alert.alert("Lỗi", "Không tìm thấy link thanh toán Web.");
          }
          return;
        }

        // 2. Nếu là App (Android/iOS) -> Thử Deep Link trước
        if (deeplink) {
          const canOpen = await Linking.canOpenURL(deeplink);
          if (canOpen) {
            await Linking.openURL(deeplink);
            return;
          }
        }

        // 3. Fallback: Nếu không mở được App, mở Web
        if (payUrl) {
          await Linking.openURL(payUrl);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy link thanh toán.");
        }
      } else {
        Alert.alert("Lỗi", "Không lấy được dữ liệu thanh toán.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể khởi tạo thanh toán lại.");
    }
  };

  // Xử lý hủy đơn
  const handleCancelOrder = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: async () => {
          try {
            await PUT_CANCEL_ORDER(order.email, order.orderId);
            Alert.alert("Thành công", "Đã hủy đơn hàng.", [
              { text: "OK", onPress: () => router.back() }
            ]);
          } catch (error) {
            Alert.alert("Lỗi", "Không thể hủy đơn hàng.");
          }
        }
      }
    ]);
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy thông tin đơn hàng</Text>
      </View>
    );
  }

  // Hàm màu trạng thái (Giống bên Admin)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Accepted!': return { color: '#FF9800', bg: '#FFF3E0', label: 'Chờ xác nhận', icon: 'time' };
      case 'Pending Payment': return { color: '#FF9800', bg: '#FFF3E0', label: 'Chờ thanh toán', icon: 'wallet' };
      case 'Pending': return { color: '#2196F3', bg: '#E3F2FD', label: 'Chờ lấy hàng', icon: 'cube' };
      case 'Processing': return { color: '#2196F3', bg: '#E3F2FD', label: 'Đang xử lý', icon: 'settings' }; // Step 3 potential
      case 'Shipping': return { color: '#00BCD4', bg: '#E0F7FA', label: 'Đang giao hàng', icon: 'bicycle' }; // Step 4 potential
      case 'Shipped': return { color: '#00BCD4', bg: '#E0F7FA', label: 'Đang giao hàng', icon: 'bicycle' };
      case 'Delivered': return { color: '#4CAF50', bg: '#E8F5E9', label: 'Đã giao hàng', icon: 'checkmark-circle' }; // Step 5 potential
      case 'Cancelled': return { color: '#F44336', bg: '#FFEBEE', label: 'Đã hủy', icon: 'close-circle' };
      default: return { color: '#777', bg: '#F5F5F5', label: status, icon: 'information-circle' };
    }
  };

  const statusStyle = getStatusColor(order.orderStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/components/order/order');
          }
        }}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Trạng thái đơn hàng */}
        <View style={[styles.section, { backgroundColor: statusStyle.bg, borderColor: statusStyle.bg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={statusStyle.icon as any} size={24} color={statusStyle.color} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
          <Text style={{ color: statusStyle.color, marginTop: 4, fontSize: 13 }}>
            {order.orderStatus === 'Pending Payment' ? 'Bạn chưa hoàn tất thanh toán. Vui lòng thanh toán ngay.' :
              order.orderStatus === 'Order Accepted!' ? 'Đơn hàng đã được xác nhận. Shop đang chuẩn bị hàng.' :
                order.orderStatus === 'Pending' ? 'Đơn hàng đang chờ đơn vị vận chuyển lấy hàng.' :
                  order.orderStatus === 'Shipped' ? 'Đơn hàng đang trên đường giao đến bạn.' :
                    order.orderStatus === 'Delivered' ? 'Giao hàng thành công. Hãy đánh giá sản phẩm nhé!' :
                      order.orderStatus === 'Cancelled' ? 'Đơn hàng đã bị hủy.' : ''}
          </Text>
        </View>

        {/* Thông tin người nhận */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={24} color="#FF4D8D" style={{ marginTop: 2 }} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              {/* Tên & SĐT */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.receiverName}>
                  {user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username) : "..."}
                </Text>
                <Text style={styles.receiverPhone}>
                  {user ? (user.mobileNumber || user.phoneNumber || "") : ""}
                </Text>
              </View>

              {/* Địa chỉ cụ thể */}
              <Text style={styles.addressText}>
                {order.address ? (
                  [order.address.buildingName, order.address.street, order.address.city, order.address.state, order.address.country]
                    .filter(Boolean).join(", ")
                ) : (
                  "Địa chỉ giao hàng mặc định"
                )}
              </Text>

              {/* Email (nhỏ bên dưới) */}
              <Text style={styles.emailText}>{order.email}</Text>
            </View>
          </View>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sản phẩm ({order.orderItems?.length || 0})</Text>
          {order.orderItems?.map((item: any, index: number) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: getProductImageUrl(item.product?.image) }}
                style={styles.prodImg}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.prodName}>{item.product?.productName}</Text>
                <Text style={styles.prodQty}>x{item.quantity}</Text>
                <Text style={styles.prodPrice}>
                  {Number(item.orderedProductPrice).toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tổng tiền */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            {/* Tinh tong tien hang (subTotal) */}
            <Text style={styles.priceValue}>
              {order.orderItems?.reduce((total: number, item: any) => total + (item.orderedProductPrice * item.quantity), 0).toLocaleString('vi-VN')} đ
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển</Text>
            {/* Lay Tong tien gom ship - Tong tien hang = Phi ship */}
            <Text style={styles.priceValue}>
              {(order.totalAmount - order.orderItems?.reduce((total: number, item: any) => total + (item.orderedProductPrice * item.quantity), 0)).toLocaleString('vi-VN')} đ
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{Number(order.totalAmount).toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* FOOTER ACTIONS - Chỉ hiện khi đang chờ thanh toán */}
      {order.orderStatus === "Pending Payment" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelText}>Hủy đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handleRetryPayment}
          >
            <Text style={styles.payText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F6", // 🌸 hồng nhạt
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#FF4D8D",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
  },

  /* ---------- STATUS SECTION ---------- */
  section: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 22,
    marginBottom: 18,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFE4EC",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
    color: "#3A0D22",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  label: {
    fontSize: 12,
    color: "#B23A6F",
    fontWeight: "600",
  },

  value: {
    fontSize: 14,
    color: "#3A0D22",
    fontWeight: "600",
  },

  /* ---------- PRODUCT LIST ---------- */
  productItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE4EC",
  },

  prodImg: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FFE4EC",
  },

  prodName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3A0D22",
  },

  prodQty: {
    fontSize: 13,
    color: "#8F3A5B",
    marginTop: 2,
  },

  prodPrice: {
    fontSize: 14,
    color: "#FF4D8D",
    fontWeight: "800",
    marginTop: 4,
  },

  /* ---------- PRICE ---------- */
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  priceLabel: {
    color: "#8F3A5B",
    fontWeight: "600",
  },

  priceValue: {
    color: "#3A0D22",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#FFE4EC",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3A0D22",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FF4D8D",
  },

  /* ---------- FOOTER ---------- */
  footer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#FFE4EC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#FF4D8D",
    alignItems: "center",
  },

  cancelText: {
    color: "#FF4D8D",
    fontSize: 15,
    fontWeight: "800",
  },

  payButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    borderRadius: 22,
    backgroundColor: "#FF4D8D",
    alignItems: "center",
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  payText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  receiverName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#3A0D22",
    marginRight: 10
  },
  receiverPhone: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500"
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 4
  },
  emailText: {
    fontSize: 12,
    color: "#999"
  }
});
