import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// "확인" 허브 — 각 확인 페이지 + 전체 요약으로 진입 (웹의 '확인' 드롭다운 대응)
const ITEMS = [
  { icon: "📋", label: "전체 요약", desc: "오늘 하루 건강 기록 한눈에", href: "/check/all", color: "#A142FF" },
  { icon: "🍽️", label: "식단", desc: "끼니별 식단·영양", href: "/check/meal", color: "#FF8A2A" },
  { icon: "💊", label: "약(복약)", desc: "처방·복약 일정", href: "/check/medicine", color: "#2E86FF" },
  { icon: "🏃", label: "운동", desc: "운동 기록·소모 칼로리", href: "/check/exercise", color: "#20D36B" },
  { icon: "⚖️", label: "체중", desc: "체중·BMI 추이", href: "/check/weight", color: "#2E86FF" },
  { icon: "🩸", label: "혈당", desc: "혈당 변화 추이", href: "/check/blood-sugar", color: "#FF8A2A" },
  { icon: "🩺", label: "혈압", desc: "혈압 변화 추이", href: "/check/blood-pressure", color: "#FF3B5F" },
];

export default function CheckHub() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        <Text className="text-[30px] font-extrabold text-[#0F172A]">확인</Text>
        <Text className="mt-2 text-[14px] text-[#64748B]">
          항목별 건강 기록을 확인하세요.
        </Text>

        <View className="mt-6 gap-3">
          {ITEMS.map((it) => (
            <Pressable
              key={it.href}
              onPress={() => router.push(it.href)}
              className="flex-row items-center overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-sm"
            >
              <View
                style={{ backgroundColor: `${it.color}1A` }}
                className="h-12 w-12 items-center justify-center rounded-[14px]"
              >
                <Text className="text-[22px]">{it.icon}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-[16px] font-bold text-[#0F172A]">
                  {it.label}
                </Text>
                <Text className="mt-0.5 text-[12px] text-[#64748B]">
                  {it.desc}
                </Text>
              </View>
              <Text className="text-[18px] text-[#94A3B8]">›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
