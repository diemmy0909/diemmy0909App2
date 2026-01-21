import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Step3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/nen3.webp")}
        style={styles.image}
      />

      <Text style={styles.title}>Tất cả món kem bạn yêu thích</Text>

      <Text style={styles.desc}>
        Thưởng thức trọn vẹn các hương vị kem yêu thích tại MIXTA iCream.
        Bạn chỉ cần đặt hàng, mọi thứ còn lại hãy để chúng tôi lo.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/onboarding/step4")}
      >
        <Text style={styles.btnText}>TIẾP TỤC</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/auth/login")}>
        <Text style={styles.skip}>Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFF0F6", // 🌸 hồng nhạt nền
  },

  image: {
    width: 260,
    height: 260,
    marginTop: 50,
    resizeMode: "contain",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 24,
    color: "#3A0D22", // chữ hồng đậm
    textAlign: "center",
  },

  desc: {
    textAlign: "center",
    color: "#8F3A5B",
    marginVertical: 14,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: 14,
  },

  /* ---------- BUTTON NEXT ---------- */
  btn: {
    backgroundColor: "#FF4D8D", // 🌸 hồng đậm chủ đạo
    paddingVertical: 16,
    borderRadius: 30,
    width: "80%",
    marginTop: 36,

    shadowColor: "#FF4D8D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  btnText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  /* ---------- SKIP ---------- */
  skip: {
    marginTop: 24,
    color: "#B23A6F",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
