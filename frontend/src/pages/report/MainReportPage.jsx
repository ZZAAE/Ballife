import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import i18n from "../../i18n";
import { useAuth } from "../../contexts/AuthContext";

const HERO_BADGES = [
  i18n.t("mainReportPage.heroBadges.diet"),
  i18n.t("mainReportPage.heroBadges.bloodTracking"),
  i18n.t("mainReportPage.heroBadges.aiReport"),
  i18n.t("mainReportPage.heroBadges.diseaseGuide"),
];

const FEATURES = [
  {
    icon: Activity,
    title: i18n.t("mainReportPage.features.dailyRecord.title"),
    description: i18n.t("mainReportPage.features.dailyRecord.description"),
    tags: [
      i18n.t("mainReportPage.features.dailyRecord.tags.diet"),
      i18n.t("mainReportPage.features.dailyRecord.tags.exercise"),
      i18n.t("mainReportPage.features.dailyRecord.tags.water"),
      i18n.t("mainReportPage.features.dailyRecord.tags.bloodPressureSugar"),
    ],
    accent: "#3B82F6",
    bg: "#EFF6FF"
  },
  {
    icon: BarChart3,
    title: i18n.t("mainReportPage.features.stats.title"),
    description: i18n.t("mainReportPage.features.stats.description"),
    tags: [
      i18n.t("mainReportPage.features.stats.tags.periodStats"),
      i18n.t("mainReportPage.features.stats.tags.trendGraph"),
      i18n.t("mainReportPage.features.stats.tags.comprehensiveReport"),
    ],
    accent: "#10B981",
    bg: "#ECFDF5"
  },
  {
    icon: Target,
    title: i18n.t("mainReportPage.features.goal.title"),
    description: i18n.t("mainReportPage.features.goal.description"),
    tags: [
      i18n.t("mainReportPage.features.goal.tags.goalMetric"),
      i18n.t("mainReportPage.features.goal.tags.routineAlert"),
      i18n.t("mainReportPage.features.goal.tags.achievementRate"),
    ],
    accent: "#F97316",
    bg: "#FFF7ED"
  },
  {
    icon: PillBottle,
    title: i18n.t("mainReportPage.features.medication.title"),
    description: i18n.t("mainReportPage.features.medication.description"),
    tags: [
      i18n.t("mainReportPage.features.medication.tags.prescriptionOcr"),
      i18n.t("mainReportPage.features.medication.tags.medicationAlert"),
      i18n.t("mainReportPage.features.medication.tags.medicationHistory"),
    ],
    accent: "#8B5CF6",
    bg: "#F5F3FF"
  },
  {
    icon: Stethoscope,
    title: i18n.t("mainReportPage.features.diseaseGuide.title"),
    description: i18n.t("mainReportPage.features.diseaseGuide.description"),
    tags: [
      i18n.t("mainReportPage.features.diseaseGuide.tags.whoKdca"),
      i18n.t("mainReportPage.features.diseaseGuide.tags.sixDiseases"),
      i18n.t("mainReportPage.features.diseaseGuide.tags.management"),
    ],
    accent: "#EF4444",
    bg: "#FEF2F2"
  },
  {
    icon: MessageCircle,
    title: i18n.t("mainReportPage.features.community.title"),
    description: i18n.t("mainReportPage.features.community.description"),
    tags: [
      i18n.t("mainReportPage.features.community.tags.categoryBoard"),
      i18n.t("mainReportPage.features.community.tags.qa"),
      i18n.t("mainReportPage.features.community.tags.recommendView"),
    ],
    accent: "#0EA5E9",
    bg: "#F0F9FF"
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: i18n.t("mainReportPage.howItWorks.record.title"),
    description: i18n.t("mainReportPage.howItWorks.record.description"),
  },
  {
    step: "02",
    title: i18n.t("mainReportPage.howItWorks.analyze.title"),
    description: i18n.t("mainReportPage.howItWorks.analyze.description"),
  },
  {
    step: "03",
    title: i18n.t("mainReportPage.howItWorks.manage.title"),
    description: i18n.t("mainReportPage.howItWorks.manage.description"),
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
  const { t } = useTranslation();
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
                {t("mainReportPage.hero.titleLine1")}
                <br />
                <span className="text-[#3B82F6]">{t("mainReportPage.hero.titleHighlight")}</span>{t("mainReportPage.hero.titleLine2Suffix")}
              </h1>
              <p className="mt-5 text-[15px] text-[#64748B] leading-relaxed max-w-[520px]">
                {t("mainReportPage.hero.description")}
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
                  {t("mainReportPage.hero.startNow")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center h-12 px-7 rounded-[12px] bg-white border border-[#E5E7EB] text-[#0F172A] text-[14px] font-semibold hover:bg-gray-50 transition"
                >
                  {t("mainReportPage.hero.exploreFeatures")}
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
                    {t("mainReportPage.heroVisual.todaySummary")}
                  </span>
                  <span className="ml-auto text-[11px] text-white/50">
                    2026.05.22
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur rounded-[14px] p-4 border border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      {t("mainReportPage.heroVisual.bloodPressure")}
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
                      {t("mainReportPage.heroVisual.bloodSugar")}
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
                        {t("mainReportPage.heroVisual.goalAchievement")}
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
              {t("mainReportPage.featuresSection.title")}
            </h2>
            <p className="mt-3 text-[14px] text-[#64748B]">
              {t("mainReportPage.featuresSection.subtitle")}
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
              {t("mainReportPage.howItWorksSection.title")}
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
                {t("mainReportPage.aiSection.titleLine1")}
                <br />
                {t("mainReportPage.aiSection.titleLine2")}
              </h3>
              <p className="mt-4 text-[14px] text-white/70 leading-relaxed">
                {t("mainReportPage.aiSection.description")}
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  t("mainReportPage.aiSection.points.interaction"),
                  t("mainReportPage.aiSection.points.nutrition"),
                  t("mainReportPage.aiSection.points.interpretation"),
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
                  {t("mainReportPage.aiSection.chatUser")}
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
                  {t("mainReportPage.aiSection.chatAi")}
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
              {t("mainReportPage.cta.title")}
            </h2>
            <p className="mt-3 text-[14px] text-[#64748B]">
              {t("mainReportPage.cta.subtitle")}
            </p>
            <Link
              to={startPath}
              className="mt-7 inline-flex items-center gap-2 h-12 px-8 rounded-[12px] bg-[#0F172A] text-white text-[14px] font-semibold hover:bg-[#1E293B] transition"
            >
              {t("mainReportPage.hero.startNow")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
