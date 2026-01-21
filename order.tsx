import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_ORDERS, getProductImageUrl, PUT_CANCEL_ORDER, GET_CHECK_ORDER_REVIEW } from "../../../APIService";
import { useCart } from "../../components/cart/CartContext";


export default function OrderScreen() {
    const router = useRouter();
    const cartContext = useCart();
    const addToCart = cartContext?.addToCart;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    // [UPDATED] Use string state for 5 tabs
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<string>(params.tab ? (params.tab as string) : "Chờ xác nhận");
    // [NEW] Sub-tab cho mục Đánh giá
    const [reviewSubTab, setReviewSubTab] = useState<"Chưa đánh giá" | "Đã đánh giá">("Chưa đánh giá");
    // [NEW] State lưu trạng thái đánh giá của từng đơn hàng
    const [reviewedOrders, setReviewedOrders] = useState<{ [key: string]: boolean }>({});

    const TABS = ["Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đánh giá", "Đã hủy"];
    // Dùng chung trong file
    const COLORS = {
        bg: "#FFF0F6",
        primary: "#FF4D8D",
        text: "#3A0D22",
        subText: "#8F3A5B",
        white: "#FFFFFF",
        border: "#FFE4EC",
        success: "#00C853",
        cancel: "#FF3D00",
    };



    // --- HÀM TẢI DANH SÁCH ---
    const fetchOrders = async () => {
        try {
            const email = await AsyncStorage.getItem("saved-email");
            if (!email) {
                setLoading(false);
                return;
            }
            const response = await GET_USER_ORDERS(email);
            const data = response.data || [];
            const sorted = data.sort((a: any, b: any) => b.orderId - a.orderId);
            setOrders(sorted);

            // [NEW] Kiểm tra trạng thái đánh giá cho các đơn hàng đã giao
            checkReviewStatus(sorted);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // [NEW] Hàm kiểm tra trạng thái đánh giá
    const checkReviewStatus = async (orderList: any[]) => {
        const deliveredOrders = orderList.filter(o =>
            o.orderStatus === 'Delivered' || o.orderStatus === 'Completed'
        );

        const statusMap: { [key: string]: boolean } = {};

        for (const order of deliveredOrders) {
            const firstProduct = order.orderItems?.[0]?.product;
            if (firstProduct?.productId && order.orderId) {
                try {
                    const res = await GET_CHECK_ORDER_REVIEW(firstProduct.productId, order.orderId);
                    statusMap[order.orderId] = res.data?.hasReviewed || false;
                } catch (e) {
                    statusMap[order.orderId] = false;
                }
            }
        }

        setReviewedOrders(statusMap);
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // --- HÀM MUA LẠI (ĐÃ FIX DEADLOCK) ---
    const handleReOrder = async (orderItems: any[]) => {
        console.log("Bấm mua lại:", orderItems);

        // 1. Kiểm tra hàm addToCart
        if (!addToCart) {
            const msg = "Lỗi: Chưa cập nhật CartContext. Hãy cập nhật file CartContext.tsx trước.";
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert("Lỗi Code", msg);
            return;
        }

        // 2. Kiểm tra sản phẩm
        if (!orderItems || orderItems.length === 0) {
            const msg = "Đơn hàng này không có sản phẩm nào.";
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert("Thông báo", msg);
            return;
        }

        try {
            setLoading(true);
            let count = 0;

            // [FIX DEADLOCK QUAN TRỌNG] 
            // Thêm 'await' để gửi từng món một, tránh gửi ồ ạt làm sập Database
            for (const item of orderItems) {
                const product = item.product;
                const quantity = item.quantity || 1;

                if (product) {
                    // Chờ Server xử lý xong món này mới gửi món tiếp theo
                    await addToCart(product, quantity);
                    count++;
                }
            }

            if (count > 0) {
                if (Platform.OS === 'web') {
                    if (window.confirm(`Thành công! Đã thêm ${count} món vào giỏ. Bạn có muốn đến giỏ hàng ngay không?`)) {
                        router.push("/components/cart/cart");
                    }
                } else {
                    Alert.alert(
                        "Thành công",
                        `Đã thêm ${count} món vào giỏ hàng!`,
                        [
                            {
                                text: "Đến giỏ hàng ngay",
                                onPress: () => router.push("/components/cart/cart")
                            },
                            { text: "Ở lại", style: "cancel" }
                        ]
                    );
                }
            } else {
                const msg = "Không tìm thấy thông tin sản phẩm (ID/Name) để thêm lại.";
                if (Platform.OS === 'web') alert(msg);
                else Alert.alert("Lỗi", msg);
            }

        } catch (error) {
            console.error("Lỗi mua lại:", error);
            if (Platform.OS === 'web') alert("Có lỗi xảy ra khi thêm vào giỏ.");
            else Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng.");
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM HỦY ĐƠN ---
    const executeCancel = async (orderId: number) => {
        try {
            setLoading(true);
            const email = await AsyncStorage.getItem("saved-email");
            if (!email) return;

            await PUT_CANCEL_ORDER(email, orderId);

            if (Platform.OS === 'web') alert("Thành công: Đã hủy đơn hàng.");
            else Alert.alert("Thành công", "Đã hủy đơn hàng.");

            await fetchOrders();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Không thể hủy đơn hàng này.";
            if (Platform.OS === 'web') alert("Lỗi: " + msg);
            else Alert.alert("Lỗi", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = (orderId: number) => {
        if (Platform.OS === 'web') {
            if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
                executeCancel(orderId);
            }
            return;
        }

        Alert.alert(
            "Hủy đơn hàng",
            "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            [
                { text: "Không", style: "cancel" },
                { text: "Đồng ý Hủy", style: "destructive", onPress: () => executeCancel(orderId) }
            ]
        );
    };

    // --- RENDER ---
    const filteredOrders = orders.filter((order) => {
        const s = order.orderStatus || "";
        // Map status sang Tab
        let tabName = "";

        switch (s) {
            case 'Pending Payment':
            case 'Order Accepted!': tabName = "Chờ xác nhận"; break;
            case 'Pending': tabName = "Chờ lấy hàng"; break;
            case 'Shipped': tabName = "Đang giao"; break;
            case 'Delivered':
            case 'Completed': tabName = "Đánh giá"; break;
            case 'Cancelled':
            case 'Fail': tabName = "Đã hủy"; break;
            default: tabName = "Khác";
        }

        // Tab "Đánh giá" thực chất là "Đã giao hàng"
        if (activeTab === "Đánh giá") {
            const isDelivered = s === 'Delivered' || s === 'Completed';
            if (!isDelivered) return false;

            // [NEW] Lọc theo sub-tab
            const isReviewed = !!reviewedOrders[order.orderId];
            if (reviewSubTab === "Chưa đánh giá") {
                return !isReviewed;
            } else {
                return isReviewed;
            }
        }

        return activeTab === tabName;
    });

    const getStatusVietnamese = (status: string) => {
        if (!status) return "";
        switch (status) {
            case 'Order Accepted!': return "Chờ xác nhận";
            case 'Pending': return "Chờ lấy hàng";
            case 'Shipped': return "Đang giao";
            case 'Delivered': return "Đã giao hàng";
            case 'Cancelled': return "Đã hủy";
            case 'Pending Payment': return "Chờ thanh toán";
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const firstProduct = item.orderItems && item.orderItems.length > 0 ? item.orderItems[0].product : null;
        const productName = firstProduct ? firstProduct.productName : "Đơn hàng hệ thống";
        const productImg = firstProduct ? getProductImageUrl(firstProduct.image) : "https://via.placeholder.com/100";
        const itemCount = item.orderItems ? item.orderItems.length : 0;
        const statusVN = getStatusVietnamese(item.orderStatus);

        const isSuccess = item.orderStatus?.toLowerCase().includes('delivered') || item.orderStatus?.toLowerCase().includes('completed');
        const isCancel = item.orderStatus?.toLowerCase().includes('cancel');

        // Logic biến điều kiện
        const canReorder = isSuccess || isCancel;
        // Chỉ hiện nút Đánh giá khi đơn đã thành công VÀ đang ở Tab Đánh giá
        const canReview = isSuccess && activeTab === "Đánh giá";


        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: productImg }} style={styles.img} />
                    <View style={styles.info}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title} numberOfLines={1}>{productName}</Text>
                            <Text style={styles.id}>#{item.orderId}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.price}>{Number(item.totalAmount).toLocaleString('vi-VN')} đ</Text>
                            <Text style={styles.pipe}> | </Text>
                            <Text style={styles.items}>{itemCount} Món</Text>
                        </View>
                        <Text style={[styles.status, { color: isSuccess ? '#00C853' : (isCancel ? '#FF3D00' : '#FF7A00') }]}>
                            {statusVN}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.btnRow}>
                    {!isSuccess && !isCancel ? (
                        <>
                            <TouchableOpacity
                                style={styles.btnPrimary}
                                onPress={() => router.push({
                                    pathname: "/components/order/order-detail",
                                    params: { orderData: JSON.stringify(item) }
                                })}
                            >
                                <Text style={styles.btnPrimaryText}>Theo dõi</Text>
                            </TouchableOpacity>

                            {/* Chỉ cho hủy nếu chưa giao hàng (Shipped) */}
                            {item.orderStatus !== 'Shipped' && (
                                <TouchableOpacity
                                    style={styles.btnOutline}
                                    onPress={() => handleCancelOrder(item.orderId)}
                                >
                                    <Text style={styles.btnOutlineText}>Hủy đơn</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.btnOutline}
                                onPress={() => router.push({
                                    pathname: "/components/order/order-detail",
                                    params: { orderData: JSON.stringify(item) }
                                })}
                            >
                                <Text style={styles.btnOutlineText}>Xem chi tiết</Text>
                            </TouchableOpacity>

                            {/* Nút Đánh giá chỉ hiện khi đã giao hàng thành công */}
                            {canReview && (
                                reviewedOrders[item.orderId] ? (
                                    // [ĐÃ ĐÁNH GIÁ]
                                    <View style={[styles.btnOutline, { borderColor: '#00C853', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }]}>
                                        <Ionicons name="checkmark-circle" size={16} color="#00C853" />
                                        <Text style={[styles.btnOutlineText, { color: '#00C853', marginLeft: 4, fontSize: 13 }]} numberOfLines={1} adjustsFontSizeToFit>Đã đánh giá</Text>
                                    </View>
                                ) : (
                                    // [CHƯA ĐÁNH GIÁ]
                                    <TouchableOpacity
                                        style={[styles.btnOutline, { borderColor: '#FF7A00' }]}
                                        onPress={() => router.push({
                                            pathname: "/components/order/WriteReview",
                                            params: {
                                                product: JSON.stringify(firstProduct),
                                                orderId: item.orderId
                                            }
                                        })}
                                    >
                                        <Text style={styles.btnOutlineText}>Đánh giá</Text>
                                    </TouchableOpacity>
                                )
                            )}

                            {/* Nút Repayment: Nếu Pending Payment thì hiện nút Thanh toán lại */}
                            {item.orderStatus === 'Pending Payment' && (
                                <TouchableOpacity
                                    style={[styles.btnPrimary, { marginLeft: 10 }]}
                                    onPress={() => router.push({
                                        pathname: "/components/order/order-detail",
                                        params: { orderData: JSON.stringify(item) }
                                    })}
                                >
                                    <Text style={styles.btnPrimaryText}>Thanh toán</Text>
                                </TouchableOpacity>
                            )}

                            {canReorder && (
                                <TouchableOpacity
                                    style={styles.btnPrimary}
                                    onPress={() => handleReOrder(item.orderItems)}
                                >
                                    <Text style={styles.btnPrimaryText}>Mua lại</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/"); // hoặc "/"
                        }
                    }}
                    style={styles.iconBtn}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* SCROLLABLE TABS */}
            <View style={{ height: 50 }}>
                <FlatList
                    data={TABS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveTab(item)}
                            style={styles.tab}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === item && styles.tabTextActive
                                ]}
                            >
                                {item}
                            </Text>

                            {activeTab === item && (
                                <View
                                    style={[
                                        styles.tabIndicator,
                                        {
                                            backgroundColor:
                                                item === "Đã hủy"
                                                    ? "#FF3D00"
                                                    : item === "Đang giao"
                                                        ? "#FF7A00"
                                                        : item === "Đánh giá"
                                                            ? "#00C853"
                                                            : "#FF4D8D",
                                        },
                                    ]}
                                />
                            )}
                        </TouchableOpacity>

                    )}
                />
            </View>

            {/* [NEW] Sub-tabs cho tab "Đánh giá" */}
            {activeTab === "Đánh giá" && (
                <View style={styles.subTabContainer}>
                    <TouchableOpacity
                        style={[styles.subTabBtn, reviewSubTab === "Chưa đánh giá" && styles.subTabBtnActive]}
                        onPress={() => setReviewSubTab("Chưa đánh giá")}
                    >
                        <Text style={[styles.subTabText, reviewSubTab === "Chưa đánh giá" && styles.subTabTextActive]}>Chưa đánh giá</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.subTabBtn, reviewSubTab === "Đã đánh giá" && styles.subTabBtnActive]}
                        onPress={() => setReviewSubTab("Đã đánh giá")}
                    >
                        <Text style={[styles.subTabText, reviewSubTab === "Đã đánh giá" && styles.subTabTextActive]}>Đã đánh giá</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.orderId.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 80 }}>
                            <Ionicons name="receipt-outline" size={60} color="#ddd" />
                            <Text style={{ color: '#999', marginTop: 10, fontSize: 16 }}>
                                {activeTab === "Ongoing" ? "Không có đơn đang xử lý" : "Chưa có lịch sử đơn hàng"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF0F6", // 🌸 nền hồng nhạt
    },

    /* ---------- HEADER ---------- */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 18,
        backgroundColor: "#FF4D8D",
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#FFF",
    },

    /* ---------- TABS ---------- */
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        marginTop: -20,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },


    activeTab: {
        backgroundColor: "#FF4D8D",
    },

    activeTabText: {
        color: "#FFF",
        fontWeight: "900",
    },

    list: {
        padding: 20,
        paddingTop: 30,
    },

    /* ---------- CARD ---------- */
    card: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        padding: 16,
        marginBottom: 18,
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#FFE4EC",
    },

    cardHeader: {
        flexDirection: "row",
        marginBottom: 14,
    },

    img: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: "#FFE4EC",
    },

    info: {
        flex: 1,
        marginLeft: 14,
        justifyContent: "center",
    },

    title: {
        fontSize: 16,
        fontWeight: "800",
        color: "#3A0D22",
        flex: 1,
        paddingRight: 5,
    },

    id: {
        color: "#B23A6F",
        fontSize: 12,
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },

    price: {
        fontSize: 15,
        fontWeight: "900",
        color: "#FF4D8D",
    },

    pipe: {
        color: "#E5A3BB",
        marginHorizontal: 8,
    },

    items: {
        color: "#8F3A5B",
        fontSize: 13,
        fontWeight: "600",
    },

    status: {
        fontSize: 13,
        marginTop: 6,
        fontWeight: "700",
    },

    divider: {
        height: 1,
        backgroundColor: "#FFE4EC",
        marginBottom: 14,
    },

    /* ---------- BUTTONS ---------- */
    btnRow: {
        flexDirection: "row",
        gap: 12,
    },

    btnPrimary: {
        flex: 1,
        backgroundColor: "#FF4D8D",
        borderRadius: 22,
        paddingVertical: 12,
        alignItems: "center",
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },

    btnPrimaryText: {
        color: "#FFF",
        fontWeight: "900",
        fontSize: 14,
        letterSpacing: 0.8,
    },

    btnOutline: {
        flex: 1,
        backgroundColor: "#FFF",
        borderRadius: 22,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FF4D8D",
    },

    btnOutlineText: {
        color: "#FF4D8D",
        fontWeight: "800",
        fontSize: 14,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
    },

    tabText: {
        fontSize: 13,
        color: "#8F3A5B",
        fontWeight: "700",
    },

    tabTextActive: {
        color: "#FF4D8D",
        fontWeight: "900",
    },

    tabIndicator: {
        marginTop: 6,
        width: 26,
        height: 3,
        borderRadius: 2,
    },
    // [NEW] Sub-tab styles
    subTabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        gap: 10,
    },
    subTabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    subTabBtnActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#00C853',
    },
    subTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    subTabTextActive: {
        color: '#00C853',
        fontWeight: 'bold',
    },
});
