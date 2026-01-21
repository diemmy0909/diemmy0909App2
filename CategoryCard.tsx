import React from "react";
import { ScrollView, TouchableOpacity, Image, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
// [FIX] Import hàm lấy link ảnh (Chú ý đường dẫn ../ cho đúng vị trí file APIService)
import { getProductImageUrl } from "../../../APIService"; 

// Link ảnh mặc định nếu Category không có ảnh
const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/706/706164.png";

export default function CategoryCard({ data = [] }: { data: any[] }) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 15 }}
      contentContainerStyle={{ paddingRight: 16, paddingBottom: 10 }}
    >
      {data.map((cat) => (
        <TouchableOpacity
          key={cat.categoryId} 
          style={styles.container}
          onPress={() =>
            router.push({
              pathname: "/components/category/[name]",
              params: { id: cat.categoryId, name: cat.categoryName },
            })
          }
        >
          <View style={styles.imageWrapper}>
            <Image
              // [FIX QUAN TRỌNG] Dùng getProductImageUrl để gắn IP máy tính vào tên file
              source={{ uri: cat.image ? getProductImageUrl(cat.image) : DEFAULT_IMAGE }}
              style={styles.image}
            />
          </View>

          <Text style={styles.catName} numberOfLines={1}>
            {cat.categoryName} 
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 22,
    alignItems: "center",
    width: 85,
  },

  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#FFF0F6",     // 🌸 nền hồng nhạt
    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
    shadowColor: "#FF4D8D",         // 🌸 shadow hồng
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    borderWidth: 1,
    borderColor: "#FFC1D6",         // viền hồng nhẹ
  },

  image: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  catName: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 13,
    color: "#7A1E45",               // chữ hồng đậm
    textAlign: "center",
  },
});
