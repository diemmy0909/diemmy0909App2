import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Step4() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/nen1.webp")}
        style={styles.image}
      />

      <Text style={styles.title}>Đặt kem từ MIXTA iCream</Text>

      <Text style={styles.desc}>
        Khám phá và đặt những hương vị kem bạn yêu thích.
        Chỉ cần đặt hàng, mọi việc còn lại hãy để chúng tôi chăm sóc.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/onboarding/step5")}
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
    backgroundColor: "#FFF0F6",
  },

  image: {
    width: 260,
    height: 260,
    marginTop: 40,
    resizeMode: "contain",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 24,
    color: "#3A0D22",
    textAlign: "center",
  },

  desc: {
    textAlign: "center",
    color: "#8F3A5B",
    marginVertical: 12,
    paddingHorizontal: 26,
    lineHeight: 22,
    fontSize: 14,
  },

  btn: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 16,
    borderRadius: 32,
    width: "80%",
    marginTop: 32,

    elevation: 6,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  btnText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },

  skip: {
    marginTop: 22,
    color: "#B23A6F",
    fontSize: 14,
    fontWeight: "600",
  },
});


