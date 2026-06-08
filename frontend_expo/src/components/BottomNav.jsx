import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  LineChart,
  ClipboardList,
  Users,
  User,
  Info,
} from "lucide-react-native";

const TABS = [
  { label: "홈", href: "/dashboard", icon: Home, match: ["/dashboard", "/home"] },
  { label: "기록", href: "/allRecord", icon: LineChart, match: ["/allRecord"] },
  { label: "확인", href: "/check", icon: ClipboardList, match: ["/check"] },
  { label: "커뮤니티", href: "/boards", icon: Users, match: ["/boards", "/posts"] },
  { label: "회원", href: "/member", icon: User, match: ["/member"] },
  { label: "소개", href: "/intro/web", icon: Info, match: ["/intro"] },
];

// 전역 하단 네비게이션. 인증 화면(로그인/회원가입 등)에서는 _layout 이 렌더하지 않는다.
export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-[#E5E7EB] bg-white"
      style={{ paddingBottom: insets.bottom || 6, paddingTop: 6 }}
    >
      {TABS.map((tab) => {
        const active = tab.match.some((m) => pathname === m || pathname.startsWith(m + "/") || pathname === m);
        const Icon = tab.icon;
        const color = active ? "#0F172A" : "#94A3B8";
        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            className="flex-1 items-center justify-center py-1"
          >
            <Icon size={22} color={color} />
            <Text
              style={{ color }}
              className="mt-0.5 text-[11px] font-semibold"
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
