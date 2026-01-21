import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from "../../components/cart/CartContext";
import {
    GET_USER_BY_EMAIL,
    PUT_UPDATE_QUANTITY,
    DELETE_ID,
} from "../../../APIService";

export default function Cart() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Logic giữ nguyên hoàn toàn
    const { state, getTotal, updateQuantity, removeFromCart } = useCart();
    const items = state.items || [];

    const [address, setAddress] = useState("Đang tải địa chỉ...");
    const [addressId, setAddressId] = useState<number | null>(null); // [NEW] Lưu ID địa chỉ
    const [loading, setLoading] = useState(true);
    const [cartId, setCartId] = useState<number | null>(null);

    // ✅ Xử lý thông báo khi thanh toán MoMo thất bại
    useEffect(() => {
        if (params.paymentFailed === "true") {
            const message = params.message
                ? decodeURIComponent(params.message as string)
                : "Giao dịch đã bị hủy";

            if (Platform.OS === 'web') {
                alert("Thanh toán thất bại: " + message);
            } else {
                Alert.alert("Thanh toán thất bại", message);
            }

            // Xóa query params sau khi hiển thị
            router.replace("/components/cart/cart");
        }

        // [NEW] Xử lý khi chọn địa chỉ xong quay về
        if (params.selectedAddressId) {
            setAddressId(Number(params.selectedAddressId));
            if (params.selectedAddressStr) {
                setAddress(params.selectedAddressStr as string);
            }
        }
    }, [params]);

    useEffect(() => {
        // Chỉ load data nếu chưa có addressId (hoặc lần đầu)
        if (!params.selectedAddressId) {
            loadData();
        } else {
            setLoading(false); // Nếu đã chọn địa chỉ thì ko load lại profile
        }
    }, []);

    const loadData = async () => {
        try {
            const email = await AsyncStorage.getItem("saved-email");
            if (email) {
                try {
                    const userRes = await GET_USER_BY_EMAIL(email);
                    const userData = userRes.data;

                    if (userData.cart && userData.cart.cartId) {
                        setCartId(userData.cart.cartId);
                    }

                    // [LOGIC MỚI] Lấy địa chỉ mặc định đầu tiên nếu chưa chọn
                    // Ưu tiên userData.addresses (list)
                    let defaultAddr = null;
                    if (userData.addresses && userData.addresses.length > 0) {
                        defaultAddr = userData.addresses[0];
                    } else if (userData.address) {
                        defaultAddr = userData.address;
                    }

                    if (defaultAddr) {
                        setAddressId(defaultAddr.addressId); // Lưu ID

                        // Format hiển thị
                        const parts = [
                            defaultAddr.buildingName, defaultAddr.street, defaultAddr.city, defaultAddr.state, defaultAddr.country
                        ].filter(part => part && String(part).trim() !== "");
                        if (parts.length > 0) setAddress(parts.join(", "));
                        else setAddress("Địa chỉ trống");
                    } else {
                        setAddress("Chưa cập nhật địa chỉ");
                    }

                } catch (err) {
                    console.log("Lỗi lấy Profile:", err);
                    setAddress("Không tải được thông tin");
                }
            } else {
                if (Platform.OS !== 'web') {
                    Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để xem giỏ hàng.");
                }
            }
        } catch (error) {
            console.error("Lỗi tải trang giỏ hàng:", error);
        } finally {
            setLoading(false);
        }
    }

    // ... (Giữ nguyên handleDeleteItem, handleQuantityChange) ...
    const handleDeleteItem = async (productId: any) => {
        // ... (Giữ nguyên code cũ) ...
        const confirmDelete = async () => {
            try {
                if (cartId) {
                    await DELETE_ID(`public/carts/${cartId}/product`, productId);
                }
                removeFromCart(productId);
            } catch (e) {
                console.error(e);
                Alert.alert("Lỗi", "Không xóa được sản phẩm.");
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Bạn muốn xóa sản phẩm này?")) confirmDelete();
        } else {
            Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa?", [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", style: "destructive", onPress: confirmDelete }
            ]);
        }
    }

    const handleQuantityChange = async (productId: string | number, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) {
            handleDeleteItem(productId);
            return;
        }
        if (!cartId) {
            updateQuantity(productId, newQty);
            return;
        }
        try {
            await PUT_UPDATE_QUANTITY(cartId, productId, newQty);
            updateQuantity(productId, newQty);
        } catch (error) {
            console.error("Lỗi update:", error);
        }
    };


    const handlePlaceOrder = () => {
        if (!cartId) {
            alert("Đang đồng bộ dữ liệu...");
            loadData();
            return;
        }
        if (items.length === 0) {
            alert("Giỏ hàng đang trống!");
            return;
        }

        // [UPDATE] Truyền thêm addressId sang trang Payment
        router.push({
            pathname: "/components/payment/payment",
            params: {
                cartId: cartId,
                totalAmount: getTotal(),
                addressId: addressId // Truyền ID địa chỉ đã chọn
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Pink Top Section Background */}
            <View style={styles.topBackground} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(home)/home' as any);
                    }
                }} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ hàng</Text>
                <View style={{ width: 40 }} />
            </View>

            {
                loading ? (
                    <ActivityIndicator size="large" color="#FF7622" style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {items.length > 0 ? (
                            items.map((item) => (
                                <View key={item.id} style={styles.itemCard}>
                                    {/* Phần 1: Ảnh (Bên trái) */}
                                    <Image
                                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                        style={styles.itemImage}
                                    />

                                    {/* Phần 2: Thông tin (Ở giữa) */}
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.itemSize}>Size: {item.size || "M"}</Text>
                                        <Text style={styles.itemPrice}>
                                            {Number(item.price).toLocaleString("vi-VN")} ₫
                                        </Text>
                                    </View>

                                    {/* Phần 3: Hành động (Bên phải - Thùng rác & Số lượng) */}
                                    <View style={styles.actionsColumn}>
                                        {/* Nút xóa nằm góc trên cùng bên phải */}
                                        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteBtn}>
                                            <Feather name="x" size={16} color="#FF4B4B" />
                                        </TouchableOpacity>

                                        {/* Bộ chỉnh số lượng nằm góc dưới */}
                                        <View style={styles.qtyContainer}>
                                            <TouchableOpacity
                                                onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                style={styles.qtyButton}
                                            >
                                                <Feather name="minus" size={12} color="#333" />
                                            </TouchableOpacity>

                                            <Text style={styles.qtyText}>{item.quantity}</Text>

                                            <TouchableOpacity
                                                onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                style={styles.qtyButton}
                                            >
                                                <Feather name="plus" size={12} color="#333" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cart-outline" size={80} color="#ccc" />
                                <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                                <Text style={styles.emptySub}>Hãy thêm món ngon vào nhé!</Text>
                            </View>
                        )}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                )
            }

            {/* Bottom Sheet Payment Area */}
            {
                items.length > 0 && (
                    <View style={styles.bottomSheet}>
                        {/* Delivery Address */}
                        <View style={styles.addressRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addressLabel}>ĐỊA CHỈ GIAO HÀNG</Text>
                                <View style={styles.addressBox}>
                                    <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => router.push({
                                pathname: "/components/profile/address-selector",
                                params: { currentId: addressId }
                            })}>
                                <Text style={styles.editAddress}>CHỌN</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Total */}
                        <View style={styles.totalRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.totalLabel}>TỔNG:</Text>
                                <Text style={styles.totalAmount}>
                                    {getTotal().toLocaleString("vi-VN")} ₫
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.breakdown}>Chi tiết {'>'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Button */}
                        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
                            <Text style={styles.placeOrderText}>ĐẶT HÀNG</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF0F6", // 🌸 nền hồng nhạt
    },

    /* ---------- TOP BACKGROUND ---------- */
    topBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 190,
        backgroundColor: "#FF4D8D", // 🌸 hồng đậm
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },

    /* ---------- HEADER ---------- */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: Platform.OS === "android" ? 40 : 20,
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    editBtn: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 13,
        textDecorationLine: "underline",
    },

    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },

    /* ---------- ITEM CARD ---------- */
    itemCard: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        padding: 14,
        borderRadius: 22,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#FF4D8D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 4,
    },
    itemImage: {
        width: 76,
        height: 76,
        borderRadius: 16,
        backgroundColor: "#FFE4EC",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: "center",
        height: "100%",
    },
    itemName: {
        color: "#3A0D22",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
        lineHeight: 22,
    },
    itemSize: {
        color: "#8F3A5B",
        fontSize: 12,
        marginBottom: 4,
    },
    itemPrice: {
        color: "#FF4D8D",
        fontSize: 15,
        fontWeight: "800",
    },

    /* ---------- ACTIONS ---------- */
    actionsColumn: {
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 76,
        paddingLeft: 6,
    },
    deleteBtn: {
        padding: 6,
        backgroundColor: "#FFE4EC",
        borderRadius: 12,
    },

    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF0F6",
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    qtyButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    qtyText: {
        color: "#3A0D22",
        fontSize: 14,
        fontWeight: "800",
        marginHorizontal: 8,
    },

    /* ---------- EMPTY ---------- */
    emptyContainer: {
        alignItems: "center",
        marginTop: 100,
    },
    emptyText: {
        color: "#3A0D22",
        fontSize: 20,
        fontWeight: "800",
        marginTop: 20,
    },
    emptySub: {
        color: "#8F3A5B",
        fontSize: 14,
        marginTop: 8,
    },

    /* ---------- BOTTOM SHEET ---------- */
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFF",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#FF4D8D",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 20,
    },
    addressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    addressLabel: {
        color: "#B23A6F",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 8,
        letterSpacing: 1,
    },
    addressBox: {
        backgroundColor: "#FFF0F6",
        padding: 12,
        borderRadius: 14,
        marginRight: 15,
    },
    addressText: {
        color: "#3A0D22",
        fontSize: 14,
        fontWeight: "600",
    },
    editAddress: {
        color: "#FF4D8D",
        fontWeight: "800",
        fontSize: 13,
        marginTop: 28,
    },

    /* ---------- TOTAL ---------- */
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    totalLabel: {
        color: "#3A0D22",
        fontSize: 16,
        fontWeight: "700",
        marginRight: 10,
    },
    totalAmount: {
        color: "#FF4D8D",
        fontSize: 26,
        fontWeight: "900",
    },
    breakdown: {
        color: "#FF4D8D",
        fontSize: 14,
        fontWeight: "700",
    },

    /* ---------- BUTTON ---------- */
    placeOrderBtn: {
        backgroundColor: "#FF4D8D",
        height: 58,
        borderRadius: 29,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF4D8D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    placeOrderText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 1.2,
    },
});
