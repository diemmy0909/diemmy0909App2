import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PUT_UPDATE_ADDRESS } from "../../../APIService";

export default function EditAddressScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    // Lấy dữ liệu từ params
    const addressId = params.addressId ? Number(params.addressId) : null;

    // Form State
    const [buildingName, setBuildingName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [country, setCountry] = useState("Vietnam");

    // Load data vào form khi mở
    useEffect(() => {
        if (params.buildingName) setBuildingName(params.buildingName as string);
        if (params.street) setStreet(params.street as string);
        if (params.city) setCity(params.city as string);
        if (params.state) setState(params.state as string);
        if (params.pincode) setPincode(params.pincode as string);
        if (params.country) setCountry(params.country as string);
    }, []); // Chỉ chạy 1 lần khi mount để tránh reset form khi gõ phím

    const handleUpdate = async () => {
        if (!addressId) {
            alert("Lỗi: Không tìm thấy ID địa chỉ.");
            return;
        }

        if (!buildingName || !street || !city || !state || !pincode) {
            const msg = "Vui lòng nhập đầy đủ thông tin.";
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert("Thiếu thông tin", msg);
            return;
        }

        try {
            setLoading(true);

            const addressData = {
                addressId,
                buildingName,
                street,
                city,
                state,
                country,
                pincode
            };

            await PUT_UPDATE_ADDRESS(addressId, addressData);

            if (Platform.OS === 'web') {
                alert("Cập nhật địa chỉ thành công!");
            } else {
                Alert.alert("Thành công", "Đã cập nhật địa chỉ.");
            }
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/components/profile/address');
            }

        } catch (error) {
            console.error("Lỗi cập nhật địa chỉ:", error);
            if (Platform.OS === 'web') alert("Lỗi khi cập nhật địa chỉ.");
            else Alert.alert("Lỗi", "Không thể cập nhật địa chỉ này.");
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.title}>SỬA ĐỊA CHỈ</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form}>

                {/* BUILDING / APARTMENT */}
                <Text style={styles.label}>TÊN TÒA NHÀ / SỐ NHÀ (*)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Tòa nhà Bitexco, Số 123"
                    value={buildingName}
                    onChangeText={setBuildingName}
                />

                {/* STREET */}
                <Text style={styles.label}>TÊN ĐƯỜNG (*)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Đường Nguyễn Huệ"
                    value={street}
                    onChangeText={setStreet}
                />

                {/* ROW: CITY & STATE */}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>THÀNH PHỐ (*)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="TP.HCM"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>QUẬN / HUYỆN (*)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Quận 1"
                            value={state}
                            onChangeText={setState}
                        />
                    </View>
                </View>

                {/* ROW: PINCODE & COUNTRY */}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>MÃ BƯU ĐIỆN (*)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="700000"
                            value={pincode}
                            onChangeText={setPincode}
                        />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>QUỐC GIA</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#FFF0F6', color: '#888' }]}
                            value={country}
                            editable={false}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveText}>CẬP NHẬT ĐỊA CHỈ</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#FFF0F6"
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

    /* ---------- FORM ---------- */
    form: {
        padding: 24,
    },

    label: {
        color: "#B23A6F",
        fontSize: 13,
        marginTop: 18,
        marginBottom: 8,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    input: {
        backgroundColor: "#FFF",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        fontSize: 15,
        color: "#3A0D22",
        borderWidth: 1,
        borderColor: "#FFE4EC",
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        marginTop: 6
    },

    saveBtn: {
        marginTop: 40,
        backgroundColor: "#FF4D8D",
        paddingVertical: 16,
        borderRadius: 24,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: "#FF4D8D",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },

    saveText: {
        textAlign: "center",
        color: "#FFF",
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 1,
    },
});
