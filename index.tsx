import { Redirect } from "expo-router";
import { useAuth } from "./components/context/AuthContext";

export default function Index() {
  const { isLoggedIn, hasOnboarded } = useAuth();

  // 🔥 Chưa onboarding → onboarding
  if (!hasOnboarded) {
    return <Redirect href="/onboarding/step1" />;
  }

  // 🔥 Đã onboarding nhưng chưa login
  if (!isLoggedIn) {
    return <Redirect href="/auth/login" />;
  }

  // 🔥 Đã login
  return <Redirect href="/(home)/home" />;
}
