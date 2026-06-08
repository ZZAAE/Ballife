import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  HeartPulse,
  MessageCircle,
  PillBottle,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

const HERO_BADGES = [
  "식단·운동 기록",
  "혈압·혈당 추적",
  "AI 분석 리포트",
  "질환별 가이드",
];

const FEATURES = [
  {
    icon: Activity,
    title: "일일 건강 기록",
    description:
      "식단, 운동, 수분 섭취, 체중, 혈압, 혈당, 복약까지 하루의 모든 건강 기록을 한 화면에서 입력하고 관리합니다.",
    tags: ["식단", "운동", "수분", "혈압/혈당"],
    accent: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: BarChart3,
    title: "기록 통계 & 리포트",
    description:
      "기간별 통계와 시각화된 그래프로 변화의 흐름을 한눈에 확인하고, 주간 종합 리포트를 받아볼 수 있습니다.",
    tags: ["일/주/월 통계", "추이 그래프", "종합 리포트"],
    accent: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Target,
    title: "맞춤 목표 설정",
    description:
      "목표 체중·음수량·섭취/소모 칼로리를 설정하고 하루 생활 루틴(기상·식사·취침)에 맞춰 알림을 받아보세요.",
    tags: ["목표 지표", "루틴 알림", "달성률"],
    accent: "#F97316",
    bg: "#FFF7ED",
  },
  {
    icon: PillBottle,
    title: "복약 관리",
    description:
      "처방전 사진 한 장이면 복용 중인 약을 자동으로 등록하고, 시간대별 복약 알림으로 빠짐없이 챙길 수 있습니다.",
    tags: ["처방전 OCR", "복약 알림", "복약 이력"],
    accent: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: Stethoscope,
    title: "질환별 가이드",
    description:
      "고혈압·당뇨·고지혈증·비만·통풍·골다공증 등 주요 만성질환에 대한 신뢰성 있는 의학 정보와 관리법을 제공합니다.",
    tags: ["WHO·KDCA 기반", "6대 질환", "관리법"],
    accent: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: MessageCircle,
    title: "건강 커뮤니티",
    description:
      "같은 고민을 가진 사람들과 경험을 나누고, 카테고리별 게시판에서 질문·노하우·일상을 자유롭게 공유하세요.",
    tags: ["카테고리 게시판", "질문/응답", "추천/조회"],
    accent: "#0EA5E9",
    bg: "#F0F9FF",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "기록한다",
    description:
      "오늘 먹은 식단, 운동, 혈압·혈당·체중을 가볍게 입력해 두기만 해도 데이터가 차곡차곡 쌓입니다.",
  },
  {
    step: "02",
    title: "분석한다",
    description:
      "쌓인 데이터를 AI가 분석해 변화 추이, 위험 신호, 개선이 필요한 영역을 알려드립니다.",
  },
  {
    step: "03",
    title: "관리한다",
    description:
      "맞춤 목표·루틴·복약 알림과 커뮤니티의 응원을 통해 건강한 습관을 지속할 수 있도록 돕습니다.",
  },
];

function FeatureCard({ icon, title, description, tags, accent, bg }) {
  const Icon = icon;
  return (
    <View className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 mb-5">
      <View className="flex-row items-start justify-between mb-5">
        <View
          className="w-12 h-12 rounded-[14px] items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Icon size={24} color={accent} />
        </View>
      </View>
      <Text className="text-[17px] font-bold text-[#0F172A] mb-2">{title}</Text>
      <Text className="text-[13px] text-[#64748B] leading-relaxed mb-4">
        {description}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {tags.map((tag) => (
          <View
            key={tag}
            className="px-2.5 py-1 bg-[#F1F5F9] rounded-full"
          >
            <Text className="text-[11px] font-medium text-[#475569]">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MainReportPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const startPath = isAuthenticated ? "/home" : "/login";

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ───────── 히어로 ───────── */}
        <View className="bg-white border-b border-[#E5E7EB] px-6 pt-12 pb-12">
          <View
            className="self-start flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A]"
          >
            <Sparkles size={14} color="#FFFFFF" />
            <Text className="text-white text-[11px] font-medium">
              Balance + Life
            </Text>
          </View>
          <Text className="mt-5 text-[36px] leading-[1.15] font-extrabold text-[#0F172A]">
            매일의 작은 기록이,{"\n"}
            <Text className="text-[#3B82F6]">평생의 건강</Text>이 됩니다.
          </Text>
          <Text className="mt-5 text-[15px] text-[#64748B] leading-relaxed">
            BalLife는 식단·운동·혈압·혈당·복약까지 흩어져 있던 건강 데이터를 한
            곳에 모으고, AI가 분석한 인사이트와 커뮤니티의 응원으로 지속 가능한
            건강 관리를 돕습니다.
          </Text>

          <View className="mt-6 flex-row flex-wrap gap-2">
            {HERO_BADGES.map((label) => (
              <View
                key={label}
                className="px-3 py-1.5 rounded-full bg-[#F1F5F9] border border-[#E5E7EB]"
              >
                <Text className="text-[#475569] text-[12px] font-medium">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8 gap-3">
            <Pressable
              onPress={() => router.push(startPath)}
              className="flex-row items-center justify-center gap-2 h-12 px-7 rounded-[12px] bg-[#0F172A]"
            >
              <Text className="text-white text-[14px] font-semibold">
                지금 바로 시작하기
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* 히어로 비주얼 */}
          <View className="mt-8 bg-[#0F172A] rounded-[24px] p-8 overflow-hidden">
            <View className="flex-row items-center gap-3 mb-6">
              <HeartPulse size={20} color="#FFFFFF" />
              <Text className="text-white text-[13px] font-semibold">
                오늘의 건강 요약
              </Text>
              <Text className="ml-auto text-[11px] text-white/50">
                2026.05.22
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <View className="bg-white/5 rounded-[14px] p-4 border border-white/10 flex-1 min-w-[45%]">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <HeartPulse size={14} color="rgba(255,255,255,0.6)" />
                  <Text className="text-[11px] text-white/60">혈압</Text>
                </View>
                <Text className="text-white text-[22px] font-bold">
                  118 / 78
                  <Text className="text-[11px] font-normal text-white/50">
                    {" "}
                    mmHg
                  </Text>
                </Text>
              </View>
              <View className="bg-white/5 rounded-[14px] p-4 border border-white/10 flex-1 min-w-[45%]">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Activity size={14} color="rgba(255,255,255,0.6)" />
                  <Text className="text-[11px] text-white/60">혈당</Text>
                </View>
                <Text className="text-white text-[22px] font-bold">
                  96
                  <Text className="text-[11px] font-normal text-white/50">
                    {" "}
                    mg/dL
                  </Text>
                </Text>
              </View>
              <View className="bg-white/5 rounded-[14px] p-4 border border-white/10 w-full">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] text-white/60">
                    오늘의 목표 달성률
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#3B82F6]">
                    78%
                  </Text>
                </View>
                <View className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#3B82F6] rounded-full"
                    style={{ width: "78%" }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ───────── 핵심 기능 ───────── */}
        <View className="py-14 px-6">
          <View className="items-center mb-12">
            <Text className="text-[12px] font-semibold text-[#3B82F6] tracking-widest">
              FEATURES
            </Text>
            <Text className="mt-3 text-[26px] font-extrabold text-[#0F172A] text-center">
              건강 관리에 필요한 모든 것을, 한 곳에
            </Text>
            <Text className="mt-3 text-[14px] text-[#64748B] text-center">
              BalLife가 제공하는 6가지 핵심 기능으로 건강 관리를 더 쉽게, 더
              똑똑하게.
            </Text>
          </View>

          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </View>

        {/* ───────── 사용 흐름 ───────── */}
        <View className="py-14 px-6 bg-white border-y border-[#E5E7EB]">
          <View className="items-center mb-12">
            <Text className="text-[12px] font-semibold text-[#10B981] tracking-widest">
              HOW IT WORKS
            </Text>
            <Text className="mt-3 text-[26px] font-extrabold text-[#0F172A] text-center">
              3단계로 시작하는 건강한 습관
            </Text>
          </View>

          {HOW_IT_WORKS.map((item) => (
            <View
              key={item.step}
              className="bg-[#F9FAFB] rounded-[18px] border border-[#E5E7EB] p-7 mb-5"
            >
              <Text className="text-[40px] font-extrabold text-[#0F172A]/10 leading-none">
                {item.step}
              </Text>
              <Text className="mt-3 text-[18px] font-bold text-[#0F172A]">
                {item.title}
              </Text>
              <Text className="mt-2 text-[13px] text-[#64748B] leading-relaxed">
                {item.description}
              </Text>
            </View>
          ))}
        </View>

        {/* ───────── AI 챗봇 ───────── */}
        <View className="py-14 px-6">
          <View className="bg-[#0F172A] rounded-[24px] overflow-hidden p-8">
            <View
              className="self-start flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/10"
            >
              <Bot size={14} color="#FFFFFF" />
              <Text className="text-white text-[11px] font-medium">
                AI Assistant
              </Text>
            </View>
            <Text className="mt-4 text-[24px] font-bold leading-tight text-white">
              24시간 함께하는{"\n"}AI 건강 도우미
            </Text>
            <Text className="mt-4 text-[14px] text-white/70 leading-relaxed">
              건강 관련 궁금증, 식단 사진 분석, 복약 시간 알림까지. 당신의
              라이프스타일에 맞춰 맞춤형 조언을 제공합니다.
            </Text>
            <View className="mt-6 gap-2.5">
              {[
                "복용 중인 약과 상호작용 확인",
                "오늘 먹은 음식의 영양 분석",
                "혈압·혈당 수치 해석",
              ].map((item) => (
                <View key={item} className="flex-row items-center gap-2">
                  <CheckCircle2 size={16} color="#3B82F6" />
                  <Text className="text-[13px] text-white/80">{item}</Text>
                </View>
              ))}
            </View>

            <View className="mt-6 gap-3">
              <View className="bg-white/5 rounded-[16px] p-4 border border-white/10 self-end max-w-[85%]">
                <Text className="text-[13px] text-white/90">
                  오늘 점심 후 혈당이 180 나왔어요. 괜찮은 건가요?
                </Text>
              </View>
              <View className="bg-[#3B82F6]/15 rounded-[16px] p-4 border border-[#3B82F6]/30 self-start max-w-[85%]">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Bot size={14} color="#60A5FA" />
                  <Text className="text-[11px] font-semibold text-[#60A5FA]">
                    BalLife AI
                  </Text>
                </View>
                <Text className="text-[13px] text-white/90 leading-relaxed">
                  식후 2시간 혈당이 180mg/dL이면 정상 기준(140 미만)보다 다소
                  높은 수치예요. 식이섬유가 풍부한 잡곡과 채소 위주의 식사, 식후
                  20분 가벼운 산책이 도움이 됩니다.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ───────── CTA ───────── */}
        <View className="pb-12 px-6">
          <View className="bg-white rounded-[24px] border border-[#E5E7EB] p-12 items-center">
            <Text className="text-[26px] font-extrabold text-[#0F172A] text-center">
              내일의 더 나은 나를 위한 첫걸음
            </Text>
            <Text className="mt-3 text-[14px] text-[#64748B] text-center">
              지금 BalLife에 합류하여 더 나은 사용자와 함께 건강한
              라이프스타일을 시작해보세요.
            </Text>
            <Pressable
              onPress={() => router.push(startPath)}
              className="mt-7 flex-row items-center justify-center gap-2 h-12 px-8 rounded-[12px] bg-[#0F172A]"
            >
              <Text className="text-white text-[14px] font-semibold">
                지금 바로 시작하기
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
