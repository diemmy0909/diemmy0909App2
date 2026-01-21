import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// Component ảnh động hỗ trợ Shared Element Transition
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

interface ProductCardProps {
  item: any;
  onAddPress?: (product: any) => void; // Truyền toàn bộ item để Home/Chat lấy ảnh làm hiệu ứng bay
}

export default function ProductCard({ item, onAddPress }: ProductCardProps) {
  const router = useRouter();

  // Chuẩn hóa ID từ dữ liệu Server (productId hoặc id)
  const finalId = item.id || item.productId;

  const handlePress = () => {
    // Rung nhẹ khi chạm vào thẻ
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.push({
      pathname: "/components/product/[id]",
      params: {
        id: finalId,
        name: item.name || item.productName,
        price: item.price || item.specialPrice,
        image: typeof item.image === 'string' ? item.image : item.image?.uri,

        desc: item.desc || item.description,
        discount: item.discount // [NEW] Truyền discount sang chi tiết
      },
    });
  };

  const handleAddCart = (e: any) => {
    // Ngăn chặn nổi bọt sự kiện (không nhảy vào trang chi tiết khi bấm nút thêm)
    e.stopPropagation();

    if (onAddPress) {
      // Gọi hàm xử lý từ component cha (kèm theo dữ liệu món ăn)
      onAddPress(item);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.85}
    >
      {/* ẢNH SẢN PHẨM: Sẽ là điểm bắt đầu của hiệu ứng bay */}
      <AnimatedImage
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={styles.image}
        resizeMode="cover"
        sharedTransitionTag={`product-image-${finalId}`}
      />

      {/* [NEW] BADGE GIẢM GIÁ */}
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.productName}
        </Text>
        <Text style={styles.shop} numberOfLines={1}>
          {item.shop || "Gourmet Kitchen"}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {Number(item.price || item.specialPrice).toLocaleString("vi-VN")}
            <Text style={styles.currency}> đ</Text>
          </Text>

          {/* NÚT THÊM: Thiết kế nhỏ gọn, sang trọng hơn */}
          <TouchableOpacity
            onPress={handleAddCart}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#e15a85', '#FF4B2B']}
              style={styles.gradientAdd}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#F0F0F0'
  },
  image: {
    width: "100%",
    height: 125, // Cân đối lại tỷ lệ ảnh
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22
  },
  content: {
    padding: 10, // Giảm padding một chút để thanh thoát hơn
  },
  name: {
    fontWeight: "700",
    fontSize: 14,
    color: '#181C2E'
  },
  shop: {
    color: "#A0A5BA",
    fontSize: 11,
    marginTop: 2
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center"
  },
  price: {
    fontWeight: "800",
    color: "#e31181",
    fontSize: 14
  },
  currency: {
    fontSize: 10,
    fontWeight: '600',
    color: "#ff2252"
  },
  addButton: {
    borderRadius: 10, // Squircle gọn gàng
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#ff2294",
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  gradientAdd: {
    width: 30, // Kích thước 30x30 tinh tế hơn
    height: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  // [NEW] Style cho badge giảm giá
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff347e', // Màu hồng đậm nổi bật
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10, // Đảm bảo nằm trên ảnh
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }
});
