import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Step2() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/onboarding/step2");
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/splash-bg.png")} style={styles.img} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  img: { width: "100%", height: "100%", resizeMode: "cover" }
});
