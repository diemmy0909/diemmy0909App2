import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GET_PAGE, getProductImageUrl } from "../../../APIService";
import ProductCard from "../product/ProductCard";

export default function CategoryList() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Lấy dữ liệu từ màn hình trước
  const name = String(params.name ?? "Danh mục");
  const categoryId = params.id;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      console.log(`Đang tải sản phẩm cho danh mục ID: ${categoryId} (${name})`);

      // 1. Gọi API lấy TOÀN BỘ sản phẩm (size 1000) giống bên Menu
      // Vì Backend API /public/products hiện không hỗ trợ lọc theo CategoryId, nên ta phải lấy hết về rồi lọc Client
      const response = await GET_PAGE("public/products", 0, 1000);

      const allData = response.data.content || response.data || [];

      // 2. Lọc lại ở phía App
      const filteredData = allData.filter((p: any) => {
        if (p.category && p.category.categoryId) {
          return String(p.category.categoryId) === String(categoryId);
        }
        return false;
      });

      // Format dữ liệu ảnh để ProductCard dùng được ngay
      const formatted = filteredData.map((item: any) => ({
        ...item,
        image: item.image ? getProductImageUrl(item.image) : null,
      }));

      setProducts(formatted);

    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductsByCategory();
  };

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
            if (router.canGoBack()) router.back();
            else router.replace("/(home)/home" as any);
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{name.toUpperCase()}</Text>
          <Text style={styles.headerSub}>Các món ngon thuộc {name}</Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push("/components/search/search")}
        >
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* LIST SẢN PHẨM */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4D8D" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => (item.id || item.productId || Math.random()).toString()}
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
              <Ionicons name="fast-food-outline" size={80} color="#FFC0CB" />
              <Text style={styles.emptyText}>
                Không tìm thấy món nào thuộc {name}.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

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

  // LIST
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
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
    color: "#8F3A5B",
    fontSize: 16,
    fontWeight: "500"
  },
});