import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from "react-native";
import { GET_PAGE, getProductImageUrl } from "../../../APIService";
import { useCart } from "../../components/cart/CartContext";

// ================= THEME HỒNG (ĐỒNG BỘ PRODUCTCARD) =================
const COLORS = {
  primary: "#e31181",
  primaryLight: "#ff2252",
  bg: "#FFF0F6",
  white: "#FFFFFF",
  text: "#181C2E",
  subText: "#A0A5BA",
  border: "#FFE4EC",
  Ionicons: "#d8267c",
  cart: "#d8267c",
};

const RECENT_KEYWORDS = ["Kem que", "Kem ly", "Matcha", "Socola", "Dâu tây"];

// ================= HELPER =================
function removeVietnameseTones(str: string) {
  if (!str) return "";
  return str
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function SearchScreen() {
  const router = useRouter();

  // ===== SAFE BACK (FIX GO_BACK) =====
  const safeBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  // ===== CART COUNT =====
  let cartCount = 0;
  try {
    const { state } = useCart();
    cartCount = state.items.length;
  } catch { }

  const [keyword, setKeyword] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await GET_PAGE("public/products", 0, 100);
        setAllProducts(res.data.content || res.data || []);
      } catch { }
    })();
  }, []);

  const handleType = (text: string) => {
    setKeyword(text);
    setHasSearched(false);

    if (!text.trim()) {
      setIsTyping(false);
      setSuggestions([]);
      return;
    }

    setIsTyping(true);
    const normalized = removeVietnameseTones(text);
    const guesses = allProducts
      .filter((p: any) =>
        removeVietnameseTones(p.productName).includes(normalized)
      )
      .slice(0, 5);

    setSuggestions(guesses);
  };

  const performSearch = (text: string) => {
    if (!text.trim()) return;

    Keyboard.dismiss();
    setKeyword(text);
    setIsTyping(false);
    setHasSearched(true);
    setLoading(true);

    setTimeout(() => {
      const key = removeVietnameseTones(text);
      const filtered = allProducts.filter((p: any) => {
        const name = removeVietnameseTones(p.productName);
        const cat = removeVietnameseTones(p.category?.categoryName);
        const desc = removeVietnameseTones(p.description);
        return name.includes(key) || cat.includes(key) || desc.includes(key);
      });
      setResults(filtered);
      setLoading(false);
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={safeBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tìm kiếm</Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/components/cart/cart")}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.white} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ================= SEARCH BAR ================= */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.primary} />
        <TextInput
          placeholder="Tìm món ăn, đồ uống..."
          placeholderTextColor={COLORS.subText}
          value={keyword}
          onChangeText={handleType}
          onSubmitEditing={() => performSearch(keyword)}
          style={styles.input}
          returnKeyType="search"
        />
        {keyword.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setKeyword("");
              setResults([]);
              setIsTyping(false);
              setHasSearched(false);
            }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= SUGGESTIONS ================= */}
      {isTyping && suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>Gợi ý nhanh</Text>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.productId}
              style={styles.suggestionItem}
              onPress={() => performSearch(item.productName)}
            >
              <Ionicons
                name="search-outline"
                size={16}
                color={COLORS.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={{ flex: 1, color: COLORS.text }}>
                {item.productName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ================= RESULTS ================= */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        {!hasSearched && !isTyping && (
          <>
            <Text style={styles.sectionTitle}>Bài của tôi</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {RECENT_KEYWORDS.map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => performSearch(k)}
                  style={styles.tag}
                >
                  <Text style={{ color: COLORS.primary }}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 30 }}
          />
        ) : (
          results.map((p) => (
            <TouchableOpacity
              key={p.productId}
              style={styles.resultCard}
              onPress={() =>
                router.push({
                  pathname: "/components/product/[id]",
                  params: { id: p.productId },
                })
              }
            >
              <Image
                source={{ uri: getProductImageUrl(p.image) }}
                style={styles.resultImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{p.productName}</Text>
                <Text style={styles.shopName} numberOfLines={1}>
                  {p.category?.categoryName || "Cửa hàng"}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {Number(p.specialPrice).toLocaleString("vi-VN")} đ
                  </Text>
                  <View style={styles.miniAddBtn}>
                    <Ionicons name="add" size={16} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingTop: 45,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f55b75",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.text,
  },

  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },

  resultCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 14,
  },
  productName: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.text,
  },
  shopName: {
    fontSize: 13,
    color: COLORS.subText,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
  miniAddBtn: {
    marginLeft: "auto",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  suggestionBox: {
    position: "absolute",
    top: 130,
    left: 18,
    right: 18,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 999,
  },
  suggestionTitle: {
    fontSize: 12,
    color: COLORS.subText,
    marginBottom: 8,
    fontWeight: "600",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
