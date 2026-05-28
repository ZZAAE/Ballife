import { Link } from "react-router-dom";
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
} from "lucide-react";
import logo from "../../assets/icons/ballifeLogo.svg";
import { useAuth } from "../../contexts/AuthContext";

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
    bg: "#EFF6FF"
  },
  {
    icon: BarChart3,
    title: "기록 통계 & 리포트",
    description:
      "기간별 통계와 시각화된 그래프로 변화의 흐름을 한눈에 확인하고, 주간 종합 리포트를 받아볼 수 있습니다.",
    tags: ["일/주/월 통계", "추이 그래프", "종합 리포트"],
    accent: "#10B981",
    bg: "#ECFDF5"
  },
  {
    icon: Target,
    title: "맞춤 목표 설정",
    description:
      "목표 체중·음수량·섭취/소모 칼로리를 설정하고 하루 생활 루틴(기상·식사·취침)에 맞춰 알림을 받아보세요.",
    tags: ["목표 지표", "루틴 알림", "달성률"],
    accent: "#F97316",
    bg: "#FFF7ED"
  },
  {
    icon: PillBottle,
    title: "복약 관리",
    description:
      "처방전 사진 한 장이면 복용 중인 약을 자동으로 등록하고, 시간대별 복약 알림으로 빠짐없이 챙길 수 있습니다.",
    tags: ["처방전 OCR", "복약 알림", "복약 이력"],
    accent: "#8B5CF6",
    bg: "#F5F3FF"
  },
  {
    icon: Stethoscope,
    title: "질환별 가이드",
    description:
      "고혈압·당뇨·고지혈증·비만·통풍·골다공증 등 주요 만성질환에 대한 신뢰성 있는 의학 정보와 관리법을 제공합니다.",
    tags: ["WHO·KDCA 기반", "6대 질환", "관리법"],
    accent: "#EF4444",
    bg: "#FEF2F2"
  },
  {
    icon: MessageCircle,
    title: "건강 커뮤니티",
    description:
      "같은 고민을 가진 사람들과 경험을 나누고, 카테고리별 게시판에서 질문·노하우·일상을 자유롭게 공유하세요.",
    tags: ["카테고리 게시판", "질문/응답", "추천/조회"],
    accent: "#0EA5E9",
    bg: "#F0F9FF"
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

function FeatureCard({ icon, title, description, tags, accent, bg, to }) {
  const Icon = icon;
  return (
    <div
      to={to}
      className="group bg-white rounded-[18px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center"
          style={{ backgroundColor: bg, color: accent }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-[17px] font-bold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-[13px] text-[#64748B] leading-relaxed mb-4">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-[11px] font-medium text-[#475569] bg-[#F1F5F9] rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MainReportPage() {
  const { isAuthenticated } = useAuth();
  const startPath = isAuthenticated ? "/" : "/login";

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* ───────── 히어로 ───────── */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] text-white text-[11px] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Balance + Life
              </span>
              <h1 className="mt-5 text-[44px] leading-[1.15] font-extrabold text-[#0F172A] tracking-tight">
                매일의 작은 기록이,
                <br />
                <span className="text-[#3B82F6]">평생의 건강</span>이 됩니다.
              </h1>
              <p className="mt-5 text-[15px] text-[#64748B] leading-relaxed max-w-[520px]">
                BalLife는 식단·운동·혈압·혈당·복약까지 흩어져 있던 건강 데이터를
                한 곳에 모으고, AI가 분석한 인사이트와 커뮤니티의 응원으로
                지속 가능한 건강 관리를 돕습니다.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {HERO_BADGES.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[12px] font-medium border border-[#E5E7EB]"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={startPath}
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-[12px] bg-[#0F172A] text-white text-[14px] font-semibold hover:bg-[#1E293B] transition"
                >
                  지금 바로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center h-12 px-7 rounded-[12px] bg-white border border-[#E5E7EB] text-[#0F172A] text-[14px] font-semibold hover:bg-gray-50 transition"
                >
                  주요 기능 살펴보기
                </a>
              </div>
            </div>

            {/* 히어로 비주얼 */}
            <div className="relative">
              <div className="bg-[#0F172A] rounded-[24px] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.15)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#3B82F6]/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#10B981]/20 blur-3xl" />

                <div className="relative flex items-center gap-3 mb-6">
                  <img src={logo} alt="BalLife" className="w-9 h-9" />
                  <span className="text-white text-[13px] font-semibold">
                    오늘의 건강 요약
                  </span>
                  <span className="ml-auto text-[11px] text-white/50">
                    2026.05.22
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur rounded-[14px] p-4 border border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      혈압
                    </div>
                    <p className="text-white text-[22px] font-bold">
                      118 / 78
                      <span className="ml-1 text-[11px] font-normal text-white/50">
                        mmHg
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-[14px] p-4 border border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-1">
                      <Activity className="w-3.5 h-3.5" />
                      혈당
                    </div>
                    <p className="text-white text-[22px] font-bold">
                      96
                      <span className="ml-1 text-[11px] font-normal text-white/50">
                        mg/dL
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-[14px] p-4 border border-white/10 col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-white/60">
                        오늘의 목표 달성률
                      </span>
                      <span className="text-[12px] font-semibold text-[#3B82F6]">
                        78%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 핵심 기능 ───────── */}
      <section id="features" className="py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[12px] font-semibold text-[#3B82F6] tracking-widest uppercase">
              Features
            </span>
            <h2 className="mt-3 text-[32px] font-extrabold text-[#0F172A]">
              건강 관리에 필요한 모든 것을, 한 곳에
            </h2>
            <p className="mt-3 text-[14px] text-[#64748B]">
              BalLife가 제공하는 6가지 핵심 기능으로 건강 관리를 더 쉽게,
              더 똑똑하게.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 사용 흐름 ───────── */}
      <section className="py-20 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[12px] font-semibold text-[#10B981] tracking-widest uppercase">
              How it works
            </span>
            <h2 className="mt-3 text-[32px] font-extrabold text-[#0F172A]">
              3단계로 시작하는 건강한 습관
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-[#F9FAFB] rounded-[18px] border border-[#E5E7EB] p-7"
              >
                <span className="text-[40px] font-extrabold text-[#0F172A]/10 leading-none">
                  {item.step}
                </span>
                <h3 className="mt-3 text-[18px] font-bold text-[#0F172A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── AI 챗봇 ───────── */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-[#0F172A] rounded-[24px] overflow-hidden p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium">
                <Bot className="w-3.5 h-3.5" />
                AI Assistant
              </span>
              <h3 className="mt-4 text-[28px] font-bold leading-tight">
                24시간 함께하는
                <br />
                AI 건강 도우미
              </h3>
              <p className="mt-4 text-[14px] text-white/70 leading-relaxed">
                건강 관련 궁금증, 식단 사진 분석, 복약 시간 알림까지.
                당신의 라이프스타일에 맞춰 맞춤형 조언을 제공합니다.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  "복용 중인 약과 상호작용 확인",
                  "오늘 먹은 음식의 영양 분석",
                  "혈압·혈당 수치 해석",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[13px] text-white/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur rounded-[16px] p-4 border border-white/10 max-w-[85%] ml-auto">
                <p className="text-[13px] text-white/90">
                  오늘 점심 후 혈당이 180 나왔어요. 괜찮은 건가요?
                </p>
              </div>
              <div className="bg-[#3B82F6]/15 backdrop-blur rounded-[16px] p-4 border border-[#3B82F6]/30 max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span className="text-[11px] font-semibold text-[#60A5FA]">
                    BalLife AI
                  </span>
                </div>
                <p className="text-[13px] text-white/90 leading-relaxed">
                  식후 2시간 혈당이 180mg/dL이면 정상 기준(140 미만)보다 다소
                  높은 수치예요. 식이섬유가 풍부한 잡곡과 채소 위주의 식사,
                  식후 20분 가벼운 산책이 도움이 됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="pb-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-12 text-center">
            <h2 className="text-[32px] font-extrabold text-[#0F172A]">
              내일의 더 나은 나를 위한 첫걸음
            </h2>
            <p className="mt-3 text-[14px] text-[#64748B]">
              지금 BalLife에 합류하여 더 나은 사용자와 함께
              건강한 라이프스타일을 시작해보세요.
            </p>
            <Link
              to={startPath}
              className="mt-7 inline-flex items-center gap-2 h-12 px-8 rounded-[12px] bg-[#0F172A] text-white text-[14px] font-semibold hover:bg-[#1E293B] transition"
            >
              지금 바로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
