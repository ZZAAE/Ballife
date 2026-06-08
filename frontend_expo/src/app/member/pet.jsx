import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { UNITY_PET_URL } from "../../lib/runtime";

// Unity WebGL 은 기본적으로 모바일 브라우저에서 차단되므로, WebView 에 데스크톱
// User-Agent 를 위장해 실행을 유도한다. (그래도 기기/성능에 따라 미동작 가능)
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function Header({ onBack }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
      <Pressable onPress={onBack} hitSlop={8}>
        <Text className="text-[15px] text-[#64748B]">‹ 뒤로</Text>
      </Pressable>
      <Text className="text-[15px] font-bold text-[#0F172A]">내 펫</Text>
      <View className="w-10" />
    </View>
  );
}

export default function PetScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Unity 호스팅 URL 미설정 시 안내 화면
  if (!UNITY_PET_URL) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]">
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[40px]">🐾</Text>
          <Text className="mt-3 text-[16px] font-bold text-[#0F172A]">
            펫 기능 준비 중
          </Text>
          <Text className="mt-2 text-center text-[13px] text-[#64748B]">
            Unity 펫 빌드 주소(EXPO_PUBLIC_UNITY_URL)가 설정되지 않았습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <Header onBack={() => router.back()} />
      <View className="flex-1">
        <WebView
          source={{ uri: UNITY_PET_URL }}
          userAgent={DESKTOP_UA}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        />
        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-[#F9FAFB]">
            <ActivityIndicator color="#0F172A" />
            <Text className="mt-2 text-[13px] text-[#64748B]">
              펫 불러오는 중…
            </Text>
          </View>
        )}
        {error && (
          <View className="absolute inset-0 items-center justify-center bg-[#F9FAFB] px-8">
            <Text className="text-center text-[13px] text-[#64748B]">
              펫을 불러오지 못했습니다. 네트워크를 확인해 주세요.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
