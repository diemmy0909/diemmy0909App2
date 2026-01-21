
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { POST_ADD_REVIEW, getProductImageUrl, GET_CHECK_ORDER_REVIEW } from '../../../APIService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WriteReview() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const product = params.product ? JSON.parse(params.product as string) : null;
    const orderId = params.orderId ? String(params.orderId) : null;

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    // [NEW] State kiểm tra đã đánh giá chưa
    const [checkingReview, setCheckingReview] = useState(true);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);

    // [NEW] Kiểm tra đã đánh giá chưa khi component mount
    useEffect(() => {
        const checkIfReviewed = async () => {
            if (!orderId || !product?.productId) {
                setCheckingReview(false);
                return;
            }
            try {
                const response = await GET_CHECK_ORDER_REVIEW(product.productId, orderId);
                setAlreadyReviewed(response.data?.hasReviewed || false);
            } catch (error) {
                console.log("Lỗi kiểm tra đánh giá:", error);
            } finally {
                setCheckingReview(false);
            }
        };
        checkIfReviewed();
    }, [orderId, product?.productId]);

    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy thông tin sản phẩm.</Text>
            </View>
        );
    }

    // [NEW] Hiển thị loading khi đang kiểm tra
    if (checkingReview) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF7A00" />
                <Text style={{ marginTop: 10, color: '#888' }}>Đang kiểm tra...</Text>
            </View>
        );
    }

    // [NEW] Hiển thị thông báo nếu đã đánh giá rồi
    if (alreadyReviewed) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.alreadyReviewedCard}>
                    <Ionicons name="checkmark-circle" size={80} color="#00C853" />
                    <Text style={styles.alreadyReviewedTitle}>Đã đánh giá!</Text>
                    <Text style={styles.alreadyReviewedText}>
                        Bạn đã đánh giá sản phẩm này trong đơn hàng #{orderId} rồi.
                    </Text>
                    <Text style={styles.thankYouText}>Cảm ơn bạn đã chia sẻ nhận xét!</Text>
                    <TouchableOpacity style={styles.backToOrderBtn} onPress={() => router.back()}>
                        <Text style={styles.backToOrderText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleSubmit = async () => {
        if (comment.trim().length === 0) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá của bạn.");
            return;
        }

        try {
            setLoading(true);
            const email = await AsyncStorage.getItem("saved-email");
            if (!email) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
                return;
            }

            const { GET_USER_BY_EMAIL } = require('../../../APIService');
            const userRes = await GET_USER_BY_EMAIL(email);
            const userId = userRes.data.userId || userRes.data.id;

            if (!userId) {
                throw new Error("Không lấy được ID người dùng.");
            }

            await POST_ADD_REVIEW(product.productId, userId, orderId, rating, comment);

            await POST_ADD_REVIEW(product.productId, userId, orderId, rating, comment);

            // [UPDATED] Thay vì Alert và Back, hiển thị màn hình thành công
            setAlreadyReviewed(true);

        } catch (error: any) {
            console.error("Lỗi gửi đánh giá:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.";
            Alert.alert("Lỗi", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.productCard}>
                    <Image
                        source={{ uri: getProductImageUrl(product.image) }}
                        style={styles.img}
                    />
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={2}>{product.productName}</Text>
                        <Text style={styles.category}>Phân loại: {product.categoryName || "Mặc định"}</Text>
                    </View>
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.label}>Chất lượng sản phẩm</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color="#FFD700"
                                    style={{ marginHorizontal: 5 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : "Tệ"}
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm..."
                        multiline
                        numberOfLines={5}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Gửi Đánh Giá</Text>}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F9F9F9', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
    img: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    category: { fontSize: 13, color: '#888', marginTop: 4 },
    ratingSection: { alignItems: 'center', marginBottom: 25 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    stars: { flexDirection: 'row', marginBottom: 10 },
    ratingText: { color: '#FF7A00', fontWeight: 'bold', fontSize: 16 },
    inputSection: { marginBottom: 30 },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, height: 120, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
    submitBtn: { backgroundColor: '#FF7A00', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    // [NEW] Styles cho trạng thái đã đánh giá
    alreadyReviewedCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 20,
        padding: 30,
    },
    alreadyReviewedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00C853',
        marginTop: 15,
    },
    alreadyReviewedText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    thankYouText: {
        fontSize: 14,
        color: '#FF7A00',
        fontWeight: '600',
        marginTop: 15,
    },
    backToOrderBtn: {
        backgroundColor: '#FF7A00',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 40,
        marginTop: 25,
    },
    backToOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

