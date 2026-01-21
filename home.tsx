import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    StyleSheet
} from "react-native";
// [THÊM MỚI] Import thư viện hiệu ứng
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

import { GET_ALL, getProductImageUrl, searchByImage } from "../../APIService";
import * as ImagePicker from 'expo-image-picker';
import { useCart } from "../../app/components/cart/CartContext";
import CategoryCard from "../../app/components/category/CategoryCard";
import ProductCard from "../../app/components/product/ProductCard";

export default function Home() {
    const router = useRouter();
    const { state } = useCart();
    const cartCount = state.items.length;

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                GET_ALL("public/categories"),
                GET_ALL("public/products")
            ]);
            setCategories(catRes.data.content || []);
            setProducts(prodRes.data.content || []);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu từ Server:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        // [MOD] Rung nhẹ khi kéo xuống để refresh
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchInitialData();
    };

    // [THÊM MỚI] Hàm rung nhẹ khi bấm nút
    const handlePress = (route: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(route as any);
    };

    // 🆕 STATE VÀ HÀM TÌM KIẾM BẰNG HÌNH ẢNH
    const [imageSearching, setImageSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleImageSearch = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Mở thư viện ảnh
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });

            if (result.canceled) return;

            const imageUri = result.assets[0].uri;
            setImageSearching(true);
            setSearchResults([]);

            // Gọi API tìm kiếm bằng ảnh
            const response = await searchByImage(imageUri);

            if (response.products && response.products.length > 0) {
                setSearchResults(response.products);
                setSearchKeyword(response.keyword || '');
            } else {
                setSearchResults([]);
                setSearchKeyword(response.keyword || 'Không tìm thấy');
            }
        } catch (error) {
            console.error('Image search error:', error);
        } finally {
            setImageSearching(false);
        }
    };

    const clearSearchResults = () => {
        setSearchResults([]);
        setSearchKeyword('');
    };
    {/* FLOATING CHAT BUTTON */ }
    <TouchableOpacity
        style={styles.chatButton}
        activeOpacity={0.85}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/chat/chatgemine");
        }}
    >
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
    </TouchableOpacity>

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => Haptics.selectionAsync()}>
                        <Ionicons name="menu" size={26} />
                    </TouchableOpacity>

                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.logoText}>MIXTA</Text>
                        <Text style={styles.logoSubText}>iCream</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => handlePress("/components/cart/cart")}
                    >
                        <Ionicons name="cart-outline" size={26} />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* SEARCH BAR + CAMERA BUTTON */}
                <View style={styles.searchRow}>
                    <TouchableOpacity
                        onPress={() => handlePress("/components/search/search")}
                        style={styles.searchBar}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={18} color="#9aa4b2" />
                        <Text style={styles.searchText}>Tìm món ngon, nhà hàng...</Text>
                    </TouchableOpacity>

                    {/* 🆕 NÚT TÌM KIẾM BẰNG ẢNH */}
                    <TouchableOpacity
                        style={styles.cameraBtn}
                        onPress={handleImageSearch}
                        disabled={imageSearching}
                    >
                        {imageSearching ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* 🆕 KẾT QUẢ TÌM KIẾM BẰNG ẢNH */}
                {searchKeyword !== '' && (
                    <View style={styles.searchResultsSection}>
                        <View style={styles.searchResultsHeader}>
                            <Text style={styles.searchResultsTitle}>
                                🔍 Kết quả cho "{searchKeyword}"
                            </Text>
                            <TouchableOpacity onPress={clearSearchResults}>
                                <Ionicons name="close-circle" size={24} color="#ff347e" />
                            </TouchableOpacity>
                        </View>

                        {searchResults.length > 0 ? (
                            <View style={styles.productGrid}>
                                {searchResults.map((item: any, index: number) => (
                                    <MotiView
                                        key={item.id || index}
                                        style={{ width: "48%" }}
                                        from={{ opacity: 0, translateY: 30 }}
                                        animate={{ opacity: 1, translateY: 0 }}
                                        transition={{ type: "timing", duration: 400, delay: index * 100 }}
                                    >
                                        <ProductCard
                                            item={{
                                                id: item.id,
                                                name: item.name,
                                                price: item.price,
                                                image: { uri: getProductImageUrl(item.image) },
                                                shop: "Cửa hàng",
                                                desc: item.description || "",
                                            }}
                                        />
                                    </MotiView>
                                ))}
                            </View>
                        ) : (
                            <Text style={{ color: "#9aa4b2", marginTop: 10 }}>
                                Không tìm thấy sản phẩm nào.
                            </Text>
                        )}
                    </View>
                )}

                {/* CATEGORIES */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>Xem tất cả →</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#ff346e" />
                ) : (
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "timing", duration: 500 }}
                    >
                        <CategoryCard data={categories} />
                    </MotiView>
                )}

                {/* PRODUCTS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Sản phẩm mới nhất</Text>
                    <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
                        <Text style={{ color: "#f63c67" }}>Xem thêm</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#ff347b" />
                ) : (
                    <View style={styles.productGrid}>
                        {products.map((item: any, index: number) => (
                            <MotiView
                                key={item.productId}
                                style={{ width: "48%" }}
                                from={{ opacity: 0, translateY: 50 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{
                                    type: "timing",
                                    duration: 500,
                                    delay: index * 100,
                                }}
                            >
                                <ProductCard
                                    item={{
                                        id: item.productId,
                                        name: item.productName,
                                        price: item.specialPrice,
                                        image: { uri: getProductImageUrl(item.image) },
                                        shop: "Cửa hàng Admin",
                                        desc: item.description,
                                    }}
                                />
                            </MotiView>
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ✅ FLOATING CHAT BUTTON (ĐÚNG VỊ TRÍ) */}
            <TouchableOpacity
                style={styles.chatButton}
                activeOpacity={0.85}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/chat/chatgemine");
                }}
            >
                <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 40 },
    deliverText: { color: "#ff347e", fontWeight: "700", fontSize: 10, letterSpacing: 0.5 },
    locationText: { fontWeight: "700", fontSize: 14 },
    greeting: { marginTop: 25, fontSize: 20, fontWeight: "400" },

    // 🆕 Search Row với Camera Button
    searchRow: {
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    searchBar: {
        flex: 1,
        backgroundColor: "#f3f5f7",
        padding: 12,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center"
    },
    searchText: { marginLeft: 12, color: "#9aa4b2", fontSize: 15 },
    sectionHeader: { marginTop: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#32343e" },
    seeAll: { color: "#ff347e", fontWeight: "600" },
    productGrid: { marginTop: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    cartBtn: { position: 'relative', padding: 5 },
    badge: {
        position: 'absolute', top: 0, right: 0,
        backgroundColor: '#ff3478', borderRadius: 9, width: 18, height: 18,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'white'
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    logoText: {
        fontSize: 26,
        fontWeight: "900",
        color: "#FF5C7A",
        letterSpacing: 2,
    },

    logoSubText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FF8FA3",
        marginTop: -4,
    },
    chatButton: {
        position: "absolute",
        right: 20,
        bottom: 90, // tránh trùng bottom tab
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FF5C7A",
        justifyContent: "center",
        alignItems: "center",

        // shadow iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,

        // shadow Android
        elevation: 6,
    },

    // 🆕 Camera Button Style
    cameraBtn: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: "#ff347e",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ff347e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    // 🆕 Search Results Styles
    searchResultsSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "#fff5f8",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#ffe4ec",
    },
    searchResultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    searchResultsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#32343e",
    },

});
