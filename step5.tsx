import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Step5() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/onboarding_3.jpg")}
        style={styles.image}
      />

      <Text style={styles.title}>Ưu đãi giao hàng miễn phí</Text>

      <Text style={styles.desc}>
        Thưởng thức những vị kem bạn yêu thích tại MIXTA iCream.
        Chỉ cần đặt hàng, chúng tôi sẽ giao tận nơi cho bạn.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.btnText}>BẮT ĐẦU</Text>
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
    paddingVertical: 18,
    borderRadius: 34,
    width: "85%",
    marginTop: 40,

    elevation: 8,
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  btnText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
});


