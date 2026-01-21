import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

import ProductCard from "../components/product/ProductCard";
import { GET_ALL, getProductImageUrl } from "../../APIService";

export default function AllProducts() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null); // null = Tất cả

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 🔥 LẤY TOÀN BỘ SẢN PHẨM & DANH MỤC
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const pageSize = 1000;

      // Gọi đồng thời cả 2 API
      const [prodRes, catRes] = await Promise.all([
        GET_ALL(`public/products?page=0&size=${pageSize}`),
        GET_ALL("public/categories")
      ]);

      // Xử lý Products
      const prodData = prodRes.data.content || prodRes.data || [];
      const formattedProds = prodData.map((item: any) => ({
        ...item,
        image: item.image ? getProductImageUrl(item.image) : null,
      }));
      setProducts(formattedProds);

      // Xử lý Categories
      const catData = catRes.data.content || catRes.data || [];
      setCategories(catData);

    } catch (error) {
      console.error("❌ Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // 🔥 LỌC SẢN PHẨM THEO DANH MỤC
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.categoryId === selectedCategory.categoryId)
    : products;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <ProductCard item={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4D8D" />

      {/* HEADER MANGO CREAM */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(home)/home' as any);
            }
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>MENU MÓN NGON</Text>
          <Text style={styles.headerSub}>Thỏa sức lựa chọn nhé!</Text>
        </View>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="filter" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 🆕 THANH DANH MỤC NGANG (Style giống Home) */}
      <View style={styles.catContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
        >
          {/* Nút TẤT CẢ */}
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.catWrapper}
          >
            <View style={[styles.catImageWrap, selectedCategory === null && styles.catImageWrapActive]}>
              <Ionicons name="grid" size={24} color={selectedCategory === null ? "#FFF" : "#FF4D8D"} />
            </View>
            <Text style={[styles.catName, selectedCategory === null && styles.catNameActive]}>Tất cả</Text>
          </TouchableOpacity>

          {/* Các danh mục động */}
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.categoryId}
              onPress={() => setSelectedCategory(cat)}
              style={styles.catWrapper}
            >
              <View style={[styles.catImageWrap, selectedCategory?.categoryId === cat.categoryId && styles.catImageWrapActive]}>
                <Image
                  source={{ uri: cat.image ? getProductImageUrl(cat.image) : "https://cdn-icons-png.flaticon.com/512/706/706164.png" }}
                  style={styles.catImage}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[styles.catName, selectedCategory?.categoryId === cat.categoryId && styles.catNameActive]}
                numberOfLines={1}
              >
                {cat.categoryName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4D8D" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) =>
            (item.id || item.productId || Math.random()).toString()
          }
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF4D8D"]}
              tintColor="#FF4D8D"
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="fast-food-outline"
                size={80}
                color="#FFC0CB"
              />
              <Text style={styles.emptyText}>
                Không tìm thấy món nào thuộc danh mục này.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ======================= STYLE MANGO CREAM ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F6", // Nền hồng pastel
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 45 : 15,
    paddingBottom: 20,
    backgroundColor: "#FF4D8D", // Hồng chủ đạo
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#FF4D8D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    color: "#FFE4EC",
    fontWeight: "600",
    marginTop: 2,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)"
  },

  // CATEGORY BAR (Style giống Home)
  catContainer: {
    marginTop: 20,
    marginBottom: 5,
  },
  catList: {
    paddingHorizontal: 16,
    paddingBottom: 15, // Cho shadow
  },
  catWrapper: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  catImageWrap: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFC1D6",

    // Shadow hồng
    shadowColor: "#FF4D8D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  catImageWrapActive: {
    backgroundColor: "#FF4D8D", // Selected
    borderColor: "#FF4D8D",
  },
  catImage: {
    width: 40,
    height: 40,
  },
  catName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#8F3A5B",
    textAlign: "center",
  },
  catNameActive: {
    color: "#FF4D8D",
    fontWeight: "800",
  },

  // LIST
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120, // Chừa chỗ cho Bottom Tab
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: "48%",
  },

  // EMPTY
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    color: "#8F3A5B", // Màu chữ tối hơn chút
    fontSize: 16,
    fontWeight: "500"
  },
});
