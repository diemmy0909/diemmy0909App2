import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import Animated from "react-native-reanimated";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import QuantitySelector from "../../components/home/QuantitySelector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../product/ProductCard";

import { useCart } from "../../components/cart/CartContext";
import {
  GET_ID,
  getProductImageUrl,
  POST_ADD,
  PUT_UPDATE_QUANTITY,
  GET_USER_BY_EMAIL,
  GET_PAGE,
  GET_ALL,
  GET_PRODUCT_REVIEWS, // [NEW] Import API đánh giá
} from "../../../APIService";

const AnimatedImage = Animated.createAnimatedComponent(Image) as any;
const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const { id, image: paramImage, name: paramName, price: paramPrice } = params;

  const router = useRouter();
  const { state, dispatch, updateQuantity } = useCart();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [currentCartQty, setCurrentCartQty] = useState(0);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  const [qty, setQty] = useState(1);
  const size = "Default";

  // [NEW] State cho đánh giá
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  /* ================= FETCH PRODUCT DETAIL ================= */
  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (state.items?.length) {
      const existingItem = state.items.find(
        (cartItem) => String(cartItem.id) === String(id)
      );
      setCurrentCartQty(existingItem ? existingItem.quantity : 0);
    }
  }, [state.items, id]);

  const fetchProductDetail = async () => {
    try {
      const response = await GET_ID("public/products", id as string);
      const product = response.data;
      setItem(product);

      if (product?.categoryId) {
        fetchRelatedProductsByCategory(product.categoryId);
      } else {
        fetchRandomProducts();
      }
      // [NEW] Lấy đánh giá sản phẩm
      fetchProductReviews();
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH RELATED PRODUCTS (CHUẨN) ================= */
  const fetchRelatedProductsByCategory = async (categoryId: number) => {
    try {
      const response = await GET_PAGE(
        `public/categories/${categoryId}/products`,
        0,
        6
      );

      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      const filtered = list.filter(
        (p: any) =>
          String(p.productId) !== String(id) && p.quantity > 0
      );

      // [NEW] Nếu không có sản phẩm liên quan nào, hiển thị random
      if (filtered.length === 0) {
        fetchRandomProducts();
      } else {
        setRelatedItems(processData(filtered));
      }
    } catch (e) {
      console.log("Error fetching related products", e);
      fetchRandomProducts(); // Fallback khi lỗi
    }
  };

  // [NEW] HÀM GỢI Ý NGẪU NHIÊN (MÓN HOT / RẺ NHẤT)
  const fetchRandomProducts = async () => {
    try {
      // Lấy 6 sản phẩm rẻ nhất hoặc bán chạy (tùy API sort)
      const response = await GET_ALL(
        "public/products?page=0&size=6&sortBy=price&sortOrder=asc"
      );

      const list = response.data.content || [];
      const filtered = list.filter(
        (p: any) => String(p.productId) !== String(id)
      );

      setRelatedItems(processData(filtered));
    } catch (error) {
      console.error("Lỗi lấy sản phẩm gợi ý:", error);
    }
  };

  const processData = (list: any[]) => {
    return list.map((item) => ({
      ...item,
      image: item.image ? { uri: getProductImageUrl(item.image) } : null,
    }));
  };

  // [NEW] Fetch đánh giá sản phẩm
  const fetchProductReviews = async () => {
    try {
      const response = await GET_PRODUCT_REVIEWS(id as string);
      setReviews(response.data.reviews || []);
      setAvgRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  /* ================= QUANTITY ================= */
  const handleQuantityChange = (type: "inc" | "dec") => {
    Haptics.selectionAsync();
    const maxQty = item ? item.quantity : 99;

    if (type === "inc") {
      setQty(Math.min(qty + 1, maxQty));
    } else {
      setQty(Math.max(1, qty - 1));
    }
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!item) return;
    Haptics.selectionAsync();

    if (item.quantity <= 0) {
      Alert.alert("Thông báo", "Sản phẩm này hiện đã hết hàng.");
      return;
    }

    const totalQty = currentCartQty + qty;
    if (totalQty > item.quantity) {
      Alert.alert(
        "Thông báo",
        `Kho chỉ còn ${item.quantity} sản phẩm. Bạn đã có ${currentCartQty} trong giỏ.`
      );
      return;
    }

    setAdding(true);
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        router.replace("/auth/login");
        return;
      }

      const userRes = await GET_USER_BY_EMAIL(email);
      const cartId = userRes.data.cart?.cartId;

      if (!cartId) throw new Error("Không tìm thấy mã giỏ hàng.");

      if (currentCartQty > 0) {
        const newQuantity = currentCartQty + qty;
        await PUT_UPDATE_QUANTITY(cartId, item.productId, newQuantity);
        updateQuantity(item.productId, newQuantity);
      } else {
        await POST_ADD(
          `public/carts/${cartId}/products/${item.productId}/quantity/${qty}`,
          {}
        );
        dispatch({
          type: "ADD_TO_CART",
          payload: {
            id: item.productId,
            name: item.productName,
            price: item.specialPrice,
            image: getProductImageUrl(item.image),
            quantity: qty,
            size,
          },
        });
      }

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      router.push("/components/cart/cart");
    } catch (error) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  };

  const displayImage = item
    ? getProductImageUrl(item.image)
    : (paramImage as string);
  const displayName = item ? item.productName : paramName;
  const displayPrice = item ? item.specialPrice : paramPrice;
  const isOutOfStock = item && item.quantity <= 0;

  if (!id) return null;

  /* ================= UI ================= */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* TOP SECTION */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(home)/home" as any)
            }
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>mixta</Text>
            <Text style={styles.logoSubText}>ice cream</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <MotiView
          from={{ translateY: 50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.productCardWrapper}
        >
          <View style={styles.productCard}>
            <AnimatedImage
              source={{ uri: displayImage }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>
        </MotiView>
      </View>

      {/* INFO */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>
          {displayName ? displayName.replace(" ", "\n") : ""}
        </Text>

        <Text style={styles.description}>
          {item?.description || ""}
        </Text>

        <View style={styles.controlsRow}>
          <View>
            <Text style={styles.priceLabel}>Giá</Text>
            <Text style={styles.priceValue}>
              {Number(displayPrice).toLocaleString("vi-VN")}đ
            </Text>
          </View>

          {!isOutOfStock && (
            <QuantitySelector
              value={qty}
              onDecrease={() => handleQuantityChange("dec")}
              onIncrease={() => handleQuantityChange("inc")}
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addToCartBtn, isOutOfStock && styles.disabledBtn]}
            onPress={handleAddToCart}
            disabled={adding || isOutOfStock}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addToCartText}>
                {isOutOfStock ? "SOLD OUT" : "Thêm Vào Giỏ"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* RELATED */}
      {relatedItems.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Bạn có thể thích</Text>
          <FlatList
            horizontal
            data={relatedItems}
            keyExtractor={(item) => String(item.productId)}
            renderItem={({ item }) => (
              <View style={{ width: 160, marginRight: 15 }}>
                <ProductCard item={item} />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      )}
      {/* REVIEWS SECTION */}
      {totalReviews > 0 && (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Đánh giá từ khách hàng</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.avgRatingText}>{avgRating}</Text>
              <Text style={styles.totalReviewsText}>({totalReviews})</Text>
            </View>
          </View>
          {reviews.slice(0, 3).map((review: any, index: number) => (
            <View key={review.reviewId || index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* ================= STYLES (GIỮ NGUYÊN) ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF0F6" },
  topSection: {
    flex: 1.2,
    backgroundColor: "#FF4D8D",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center" },
  logoText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  logoSubText: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#FFE4EC",
  },
  productCardWrapper: { alignItems: "center", flex: 1 },
  productCard: {
    width: width * 0.75,
    height: width * 0.85,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 42,
    padding: 20,
  },
  mainImage: { width: "100%", height: "100%", borderRadius: 32 },
  bottomSection: {
    backgroundColor: "#FFF",
    padding: 30,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginTop: -20,
  },
  title: { fontSize: 32, fontWeight: "900", color: "#3A0D22" },
  description: { fontSize: 14, color: "#8F3A5B", marginTop: 10 },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  priceLabel: { fontSize: 12, color: "#B23A6F" },
  priceValue: { fontSize: 26, fontWeight: "900", color: "#FF4D8D" },
  footer: { marginTop: 20 },
  addToCartBtn: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
  },
  disabledBtn: { opacity: 0.5 },
  relatedSection: { marginTop: 20 },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3A0D22",
    marginLeft: 20,
    marginBottom: 15,
  },
  // [NEW] Review Styles
  reviewsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3A0D22",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  avgRatingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF9900",
    marginLeft: 4,
  },
  totalReviewsText: {
    fontSize: 12,
    color: "#A0A5BA",
    marginLeft: 4,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#32343E",
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 13,
    color: "#6B6E82",
    lineHeight: 18,
  },
});
