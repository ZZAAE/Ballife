import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

SplashScreen.preventAutoHideAsync().catch(() => {});

// 하단 네비를 숨길 화면(인증/진입)
const HIDE_NAV = ["/", "/login", "/signup", "/disease"];

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    // 첫 레이아웃 후 스플래시 숨김(흰 화면 방지)
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const showNav = !HIDE_NAV.includes(pathname);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <View className="flex-1 bg-[#F9FAFB]">
          <View className="flex-1">
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#F9FAFB" },
              }}
            />
          </View>
          {showNav && <BottomNav />}
        </View>
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
