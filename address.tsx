import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_BY_EMAIL } from "../../../APIService";

export default function Address() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm tải dữ liệu
  const fetchAddresses = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      // Gọi API lấy User, trong User có Address
      const response = await GET_USER_BY_EMAIL(email);
      if (response && response.data) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error("Lỗi tải địa chỉ:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses();
  }, []);


  return (
    <View style={styles.page}>
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

        <Text style={styles.title}>ĐỊA CHỈ CỦA TÔI</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF4D8D" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {addresses.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/535/535193.png" }}
                style={{ width: 100, height: 100, marginBottom: 20, opacity: 0.5 }}
              />
              <Text style={{ color: '#8F3A5B', fontSize: 16 }}>Chưa có địa chỉ nào được lưu.</Text>
            </View>
          ) : (
            addresses.map((addr, index) => (
              <View key={addr.addressId || index} style={styles.card}>
                <View style={styles.iconBox}>
                  <Ionicons name="location" size={24} color="#FF4D8D" />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.addrTitle}>
                      {addr.buildingName ? addr.buildingName.toUpperCase() : "NHÀ RIÊNG"}
                    </Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Mặc định</Text>
                    </View>
                  </View>

                  <Text style={styles.addrText}>
                    {addr.street}, {addr.city}, {addr.state}
                  </Text>
                  <Text style={styles.addrTextSub}>
                    {addr.country} - Zip: {addr.pincode}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 8,
                    backgroundColor: '#FF4D8D',
                    borderRadius: 12,
                    marginLeft: 10
                  }}
                  onPress={() => router.push({
                    pathname: "/components/profile/edit-address",
                    params: {
                      addressId: addr.addressId,
                      buildingName: addr.buildingName,
                      street: addr.street,
                      city: addr.city,
                      state: addr.state,
                      country: addr.country,
                      pincode: addr.pincode
                    }
                  })}
                >
                  <Feather name="edit-2" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}


      {/* ADD NEW ADDRESS BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/components/profile/add-address")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.addBtnText}>THÊM ĐỊA CHỈ MỚI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// [PINK THEME STYLES]
const styles = StyleSheet.create({
  page: {
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
    letterSpacing: 1,
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: "#FFF",
    padding: 18,
    marginBottom: 16,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE4EC",
    gap: 16,
  },

  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF0F6",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  addrTitle: {
    fontSize: 14,
    color: "#3A0D22",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  tag: {
    backgroundColor: '#FFE4EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8
  },
  tagText: {
    fontSize: 10,
    color: '#FF4D8D',
    fontWeight: '700'
  },

  addrText: {
    marginTop: 6,
    color: "#8F3A5B",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  addrTextSub: {
    color: "#B23A6F",
    fontSize: 12,
    marginTop: 2,
  },

  /* ---------- FOOTER ---------- */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent', // Để nút nổi bật
  },

  addBtn: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  addBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
