import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { useEffect } from "react";
import { CartProvider } from "./components/cart/CartContext";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const first = segments[0];

    const inAuth = first === "auth";
    const inOnboarding = first === "onboarding";

    if (!isLoggedIn && !inAuth && !inOnboarding) {
      router.replace("/auth/login");
      return;
    }

    if (isLoggedIn && inAuth) {
      router.replace("/(home)/home");
      return;
    }
  }, [isLoggedIn, segments, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFE4EC", // 🌸 hồng nhạt
        }}
      >
        <ActivityIndicator size="large" color="#FF4D8D" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#FFF0F6", // 🌸 nền hồng rất nhạt
        },
      }}
    >
      <Stack.Screen name="(home)" />

      {/* Auth */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/forgot" />

      {/* Onboarding */}
      <Stack.Screen name="onboarding/step1" />
      <Stack.Screen name="onboarding/step2" />
      <Stack.Screen name="onboarding/step3" />
      <Stack.Screen name="onboarding/step4" />
      <Stack.Screen name="onboarding/step5" />

      {/* Cart modal */}
      <Stack.Screen
        name="components/cart/cart"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen name="components/product/[id]" />

      {/* Payment */}
      <Stack.Screen name="components/payment/payment" />
      <Stack.Screen name="components/payment/payment-result" />
      <Stack.Screen
        name="components/payment/order-success"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "#FFE4EC", // 🌸 hồng SafeArea
            }}
          >
            <StatusBar
              barStyle="dark-content" // chữ tối hợp nền hồng
              backgroundColor="#FFE4EC"
            />
            <RootNavigator />
          </SafeAreaView>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
