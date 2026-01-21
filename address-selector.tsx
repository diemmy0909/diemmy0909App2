import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_BY_EMAIL } from "../../../APIService";

export default function AddressSelectorScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Lấy ID đang chọn từ params (nếu có)
    useEffect(() => {
        if (params.currentId) {
            setSelectedId(Number(params.currentId));
        }
    }, [params]);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const email = await AsyncStorage.getItem("saved-email");
            if (!email) {
                setLoading(false);
                return;
            }

            const res = await GET_USER_BY_EMAIL(email);
            if (res.data && res.data.addresses) {
                setAddresses(res.data.addresses);
            } else if (res.data && res.data.address) {
                // Fallback nếu chỉ có 1 địa chỉ cũ
                setAddresses([res.data.address]);
            }
        } catch (error) {
            console.error("Lỗi tải địa chỉ:", error);
            if (Platform.OS !== 'web') Alert.alert("Lỗi", "Không tải được danh sách địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (addr: any) => {
        // Quay lại màn hình trước và truyền params addressId mới
        // Lưu ý: Router.back() ko truyền params trực tiếp được, nhưng Cart có thể lắng nghe
        // Hoặc ta dùng router.replace/push về Cart với params
        // Cách tốt nhất là Cart dùng useLocalSearchParams để bắt sự kiện update?
        // Nhưng ở Expo Router, cách đơn giản là push lại trang Cart (sẽ reload lại Cart)
        // Hoặc dùng Context. 
        // Đơn giản nhất: router.dismiss() và set global state hoặc AsyncStorage?
        // Ở đây ta dùng router.push("/components/cart/cart") với params addressId

        router.push({
            pathname: "/components/cart/cart",
            params: {
                selectedAddressId: addr.addressId,
                selectedAddressStr: `${addr.buildingName}, ${addr.street}, ${addr.city}`
            }
        });
    };

    const renderItem = ({ item }: { item: any }) => {
        const fullAddress = [item.buildingName, item.street, item.city, item.state, item.country]
            .filter(p => p).join(", ");

        const isSelected = selectedId === item.addressId;

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.cardActive]}
                onPress={() => handleSelect(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                        name={isSelected ? "radio-button-on" : "radio-button-off"}
                        size={24}
                        color={isSelected ? "#FF4D8D" : "#888"}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.addressType}>
                            {item.city} - {item.pincode}
                        </Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {fullAddress}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Feather name="chevron-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>CHỌN ĐỊA CHỈ</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF4D8D" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.addressId.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#888' }}>Chưa có địa chỉ nào.</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => router.push("/components/profile/add-address")}
                            >
                                <Text style={styles.addBtnText}>+ Thêm địa chỉ mới</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF0F6" },
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
        fontWeight: "900", // Extra Bold
        color: "#FFF",
        letterSpacing: 1,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardActive: {
        borderColor: "#FF4D8D",
        backgroundColor: "#FFF5F8"
    },
    addressType: {
        fontSize: 14,
        fontWeight: "700",
        color: "#3A0D22",
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    addBtn: {
        marginTop: 20,
        backgroundColor: "#FF4D8D",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    addBtnText: {
        color: "#FFF",
        fontWeight: "700"
    }
});
