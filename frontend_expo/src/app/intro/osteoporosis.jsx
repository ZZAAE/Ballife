import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ClipboardCheck,
  ShieldPlus,
  AlertTriangle,
  Utensils,
  Home,
  Activity,
  Check,
  CheckCircle2,
  BookOpen,
} from "lucide-react-native";

// ───────── 공유 컴포넌트 (DiseaseComponents 인라인) ─────────
function SectionHeader({ icon: Icon, title, subTitle }) {
  return (
    <View className="mb-6 mt-14">
      <View className="flex-row items-center gap-2 mb-1">
        {Icon && <Icon size={20} color="#0F172A" />}
        <Text className="text-[22px] font-bold text-[#0F172A]">{title}</Text>
      </View>
      {subTitle && (
        <Text className="text-[13px] text-[#64748B] ml-7">{subTitle}</Text>
      )}
    </View>
  );
}

function ContentCard({ children, className = "" }) {
  return (
    <View
      className={`bg-white p-6 rounded-[18px] border border-[#E5E7EB] ${className}`}
    >
      {children}
    </View>
  );
}

function RiskFactorCard({ factors }) {
  return (
    <View className="bg-[#0F172A] rounded-[18px] p-7">
      <Text className="text-[14px] font-bold text-white mb-5">
        주요 위험 요소
      </Text>
      <View className="gap-4">
        {factors.map((factor, idx) => (
          <View key={idx} className="flex-row items-start gap-3">
            <CheckCircle2 size={16} color="#34D399" style={{ marginTop: 2 }} />
            <Text className="flex-1 text-[13px] text-white/80">{factor}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ReferenceFooter({ items, lastUpdated }) {
  return (
    <View className="mt-16 bg-white rounded-[18px] border border-[#E5E7EB] p-7">
      <View className="flex-row items-center gap-2 mb-4">
        <BookOpen size={18} color="#0F172A" />
        <Text className="text-[15px] font-bold text-[#0F172A]">
          참고 자료 (References)
        </Text>
      </View>
      <Text className="text-[12px] text-[#94A3B8] mb-4 leading-relaxed">
        본 페이지의 의학 정보는 아래 공신력 있는 출처를 바탕으로 작성되었으며,
        진단·치료를 대신하지 않습니다. 개인별 상태는 반드시 의료진과 상담하시기
        바랍니다.
      </Text>
      <View className="gap-2.5">
        {items.map((item, idx) => (
          <View key={idx} className="flex-row items-start gap-2.5">
            <View
              className="w-1 h-1 rounded-full bg-[#94A3B8]"
              style={{ marginTop: 6 }}
            />
            <Text className="flex-1 text-[13px] text-[#475569] leading-relaxed">
              <Text className="font-semibold text-[#0F172A]">{item.source}</Text>
              {item.detail ? ` — ${item.detail}` : ""}
            </Text>
          </View>
        ))}
      </View>
      {lastUpdated && (
        <Text className="mt-4 text-[11px] text-[#94A3B8]">
          마지막 업데이트: {lastUpdated}
        </Text>
      )}
    </View>
  );
}

// ───────── 페이지 전용 서브 컴포넌트 ─────────
function TScoreCard({ label, score, color, textColor, desc }) {
  return (
    <ContentCard className="relative pt-8 overflow-hidden mb-6">
      <View className={`absolute top-0 left-0 w-1.5 h-full ${color}`} />
      <Text className="text-[12px] font-bold text-gray-400">{label}</Text>
      <Text className={`text-2xl font-black mt-1 mb-4 ${textColor}`}>
        {score}
      </Text>
      <Text className="text-[12px] text-gray-500 leading-relaxed">{desc}</Text>
    </ContentCard>
  );
}

function HabitItem({ icon, title, desc }) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="w-10 h-10 bg-emerald-50 rounded-lg items-center justify-center border border-emerald-100">
        <Text className="font-bold text-[12px] text-emerald-600">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[13px] mb-0.5 text-[#0F172A]">
          {title}
        </Text>
        <Text className="text-[12px] text-gray-400">{desc}</Text>
      </View>
    </View>
  );
}

function CheckItem({ text }) {
  return (
    <View className="flex-row items-center gap-2">
      <Check size={14} color="#9CA3AF" strokeWidth={3} />
      <Text className="flex-1 text-[12px] text-gray-600 font-medium">
        {text}
      </Text>
    </View>
  );
}

function SmallInfoCard({ title, desc }) {
  return (
    <ContentCard className="py-5 mb-4 flex-row items-center gap-5">
      <View className="bg-gray-50 p-3 rounded-xl">
        <Activity size={18} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text className="font-extrabold text-[13px] mb-1 text-[#0F172A]">
          {title}
        </Text>
        <Text className="text-[11px] text-gray-400 leading-snug">{desc}</Text>
      </View>
    </ContentCard>
  );
}

export default function OsteoporosisReportPage() {
  const riskFactors = [
    "고령 및 폐경 후 에스트로겐 감소 (국내 50세 이상 여성 약 38%가 골다공증)",
    "가족력 및 저체중 (BMI < 18.5)",
    "장기간의 스테로이드(글루코코르티코이드) 복용",
    "과도한 음주·흡연 및 신체 활동 부족",
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        {/* 타이틀 섹션 */}
        <View className="mb-12">
          <Text className="text-[32px] font-extrabold text-[#0F172A] mb-4">
            골다공증(Osteoporosis)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            WHO 정의에 따라 DXA 골밀도 T-score가 -2.5 이하일 때 진단되며, 골량
            감소와 미세구조 파괴로 골절 위험이 증가하는 전신 골격계 질환입니다.
            고령화로 국내 50세 이상 인구의 골다공증 유병률이 빠르게 상승하고 있어
            보건학적 관리가 매우 중요합니다.
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            골다공증이란?
          </Text>
          <Text className="text-[14px] text-gray-600 leading-loose">
            골다공증은 골량 감소와 골조직의 미세구조 변화로 골강도가 약해진
            상태입니다(WHO). 뼈는 평생 흡수와 형성을 반복하는데, 폐경·노화·특정
            약물 등으로 균형이 무너지면 골밀도가 감소합니다. 질병관리청 자료에
            따르면 국내 50세 이상 여성의 약 38%, 남성의 약 7%가 골다공증입니다.
            {"\n\n"}
            골다공증은 진행 중에는 거의 증상이 없으며, 결국{" "}
            <Text className="text-emerald-600 font-bold">
              가벼운 외상이나 일상 동작만으로도 척추·고관절·손목 골절이 발생하는
              취약한 상태
            </Text>
            로 이어집니다. 고관절 골절은 고령자에서 1년 내 사망률을 높이는 중대한
            합병증입니다.
          </Text>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader
          icon={ClipboardCheck}
          title="진단 기준 (WHO T-score)"
          subTitle="이중에너지 X선 흡수계측법(DXA)으로 요추·대퇴골 골밀도를 측정한 T-score가 표준 진단 기준입니다(WHO)."
        />
        <TScoreCard
          label="정상"
          score="T-score ≥ -1.0"
          color="bg-emerald-500"
          textColor="text-emerald-500"
          desc="골밀도가 젊은 성인 평균과 비교해 안정적인 상태로, 예방적 생활습관 유지가 권장됩니다."
        />
        <TScoreCard
          label="골감소증"
          score="-2.5 < T < -1.0"
          color="bg-orange-400"
          textColor="text-orange-400"
          desc="골량이 감소된 단계로, 골다공증 진행을 막기 위한 칼슘·비타민 D 섭취와 운동 강화가 필요합니다."
        />
        <TScoreCard
          label="골다공증"
          score="T-score ≤ -2.5"
          color="bg-rose-500"
          textColor="text-rose-500"
          desc="WHO 진단 기준에 해당하며, 비스포스포네이트 등 적극적인 약물 치료가 필요한 단계입니다."
        />

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title="관리 가이드라인" />

        {/* 약물 치료 */}
        <View className="mb-10">
          <View className="bg-[#0F172A] p-5 rounded-t-[18px] flex-row items-center gap-3">
            <Activity size={18} color="#34D399" />
            <Text className="font-semibold text-[14px] text-white">
              약물 치료 (Pharmacology)
            </Text>
          </View>
          <ContentCard className="rounded-t-none gap-6">
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                골흡수 억제제
              </Text>
              <View className="ml-4 gap-2">
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 비스포스포네이트 (Bisphosphonates) - 가장 보편적
                </Text>
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 데노수맙 (Denosumab) - 6개월 1회 주사제
                </Text>
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 선택적 에스트로겐 수용체 조절제 (SERM)
                </Text>
              </View>
            </View>
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                골형성 촉진제
              </Text>
              <View className="ml-4 gap-2">
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 테리파라타이드 (Teriparatide)
                </Text>
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 로모소주맙 (Romosozumab) - 최근 도입된 강력한 약제
                </Text>
              </View>
            </View>
          </ContentCard>
        </View>

        {/* 영양 및 낙상 예방 */}
        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <Utensils size={18} color="#374151" />
            <Text className="font-extrabold text-[14px] text-[#0F172A]">
              영양 및 생활습관
            </Text>
          </View>
          <View className="gap-5">
            <HabitItem
              icon="Ca"
              title="칼슘 섭취"
              desc="50세 이상 1일 800~1,000mg 권장 (우유, 멸치, 두부, 케일)"
            />
            <HabitItem
              icon="D3"
              title="비타민 D"
              desc="1일 800~1,000 IU 권장, 주 2~3회 햇볕 노출 병행"
            />
            <HabitItem
              icon="Ex"
              title="체중 부하 운동"
              desc="걷기·조깅·계단 오르기 주 3~5회, WHO 권고 주 150분 이상"
            />
          </View>
        </ContentCard>

        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <Home size={18} color="#374151" />
            <Text className="font-extrabold text-[14px] text-[#0F172A]">
              낙상 예방 (Fall Prevention)
            </Text>
          </View>
          <Text className="text-[12px] text-gray-500 mb-5 leading-relaxed">
            고령자 골절의 대부분은 낙상이 원인이므로, 뼈 강화만큼 넘어지지 않는
            환경 조성이 중요합니다(대한골대사학회 KSBMR).
          </Text>
          <View className="bg-[#eff3f8] p-5 rounded-lg gap-3">
            <CheckItem text="실내 조명 충분히 확보 및 바닥 장애물 제거" />
            <CheckItem text="욕실·계단에 미끄럼 방지 매트·손잡이 설치" />
            <CheckItem text="시력·청력 정기 점검 및 균형 감각 향상 운동(태극권 등)" />
          </View>
        </ContentCard>

        {/* 임상 증상 */}
        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
        <ContentCard className="mb-8">
          <View className="mb-4 bg-gray-50 w-10 h-10 rounded-lg items-center justify-center">
            <AlertTriangle size={20} color="#1F2937" />
          </View>
          <Text className="font-extrabold text-[15px] mb-3 text-[#0F172A]">
            골절 위험 (Fracture Risk)
          </Text>
          <Text className="text-[13px] text-gray-500 leading-relaxed">
            손목·척추·고관절 부위 골절이 가장 흔하며, 특히 고관절 골절은 1년 내
            사망률이 약 15~20%에 이를 정도로 치명적입니다. 척추는 가벼운 외상이나
            기침만으로도 압박 골절이 발생할 수 있습니다.
          </Text>
        </ContentCard>
        <SmallInfoCard
          title="체형 변화"
          desc="척추 압박 골절이 누적되면 키가 3cm 이상 줄거나 등이 굽는 척추후만증이 나타날 수 있습니다."
        />
        <SmallInfoCard
          title="둔한 통증"
          desc="골다공증 자체는 무증상이지만, 미세 골절·압박 골절이 발생하면 만성 요통과 전신 통증이 동반될 수 있습니다."
        />

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            {
              source: "WHO",
              detail:
                "Assessment of Fracture Risk and Application to Screening for Postmenopausal Osteoporosis",
            },
            { source: "대한골대사학회(KSBMR)", detail: "골다공증 진료지침 2022" },
            {
              source: "질병관리청(KDCA)",
              detail: "국민건강영양조사 2022, 골다공증 유병률",
            },
            {
              source: "International Osteoporosis Foundation (IOF)",
              detail: "Osteoporosis Compendium",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
