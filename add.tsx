import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GET_ALL, getProductImageUrl } from "../../APIService";
import ProductCard from "../components/product/ProductCard";

export default function ShopIntro() {
  const router = useRouter();

  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<any[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [saleRes, bestRes, newRes] = await Promise.all([
        // 1. Sale: Top 3 discount
        GET_ALL("public/products?page=0&size=4&sortBy=discount&sortOrder=desc"),
        // 2. Best Sellers: Top 5 cheapest (Simulated popularity)
        GET_ALL("public/products?page=0&size=5&sortBy=price&sortOrder=asc"),
        // 3. New Arrivals: Top 5 latest
        GET_ALL("public/products?page=0&size=5&sortBy=productId&sortOrder=desc")
      ]);

      setSaleProducts(processData(saleRes));
      setBestSellerProducts(processData(bestRes));
      setNewArrivalProducts(processData(newRes));

    } catch (error) {
      console.error("Lỗi lấy dữ liệu shop:", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (res: any) => {
    const data = res.data.content || res.data || [];
    return data.map((item: any) => ({
      ...item,
      image: item.image ? getProductImageUrl(item.image) : null,
    }));
  };

  const renderHorizontalItem = ({ item }: { item: any }) => (
    <View style={styles.horizontalCardWrapper}>
      <ProductCard item={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4D8D" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giới Thiệu Shop</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* SHOP BANNER & INFO */}
        <View style={styles.introSection}>
          <Image
            source={require("../../assets/shop-banner.jpg")}
            style={styles.bannerImg}
          />
          <View style={styles.shopCard}>
            <Text style={styles.shopName}>MIXTA iCream</Text>
            <Text style={styles.shopDesc}>
              MIXTA iCream mang đến thế giới kem đầy màu sắc với nhiều hương vị hấp dẫn, từ truyền thống đến hiện đại. Mỗi cây kem đều được chăm chút kỹ lưỡng để mang lại sự mát lạnh, ngọt ngào và niềm vui trong từng khoảnh khắc.
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#FF4D8D" />
              <Text style={styles.infoText}>123 Đường Ẩm Thực, Hà Nội</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#FF4D8D" />
              <Text style={styles.infoText}>08:00 - 22:00 (Hàng ngày)</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#FF4D8D" />
              <Text style={styles.infoText}>0909 123 456</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF4D8D" style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* 1. FLASH SALE (Vertical List as before) */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Giảm Giá Sốc 🔥</Text>
              <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productList}>
              {saleProducts.map((item, index) => (
                <View key={index} style={styles.productWrapper}>
                  <ProductCard item={item} />
                </View>
              ))}
            </View>

            {/* 2. BEST SELLERS (Horizontal Scroll) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Món Bán Chạy 🏆</Text>
              <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={bestSellerProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              renderItem={renderHorizontalItem}
              keyExtractor={(item) => item.productId.toString()}
            />

            {/* 3. NEW ARRIVALS (Horizontal Scroll) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Món Mới Ra Lò 🥬</Text>
              <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={newArrivalProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              renderItem={renderHorizontalItem}
              keyExtractor={(item) => item.productId.toString()}
            />
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF0F6",
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: "#FF4D8D",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#FF4D8D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#FFF",
  },

  // Intro Section
  introSection: {
    alignItems: 'center',
    marginTop: -20, // Overlap header
    paddingHorizontal: 20,
  },
  bannerImg: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  shopCard: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 20,
    borderRadius: 16,
    marginTop: -40, // Overlap banner
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    color: "#181C2E",
    marginBottom: 8,
    textAlign: 'center',
  },
  shopDesc: {
    fontSize: 14,
    color: "#A0A5BA",
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#32343E",
    fontWeight: '500',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#32343E",
  },
  seeAll: {
    fontSize: 14,
    color: "#FF4D8D",
    fontWeight: '600',
  },

  // Products
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  horizontalCardWrapper: {
    width: 160,
    marginRight: 15,
  }
});