import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  HeartPulse,
  Utensils,
  BrainCircuit,
  Stethoscope,
  Info,
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

function DiagnosisCard({ icon: Icon, title, subTitle, desc, borderColor }) {
  return (
    <ContentCard className={`mb-6 border-l-4 ${borderColor}`}>
      <Icon size={20} color="#10B981" style={{ marginBottom: 12 }} />
      <Text className="text-[14px] font-bold text-[#0F172A] mb-1">{title}</Text>
      <Text className="text-[12px] font-semibold text-emerald-600 mb-3">
        {subTitle}
      </Text>
      <Text className="text-[12px] text-[#64748B] leading-relaxed">{desc}</Text>
    </ContentCard>
  );
}

function StepInfoCard({ number, title, desc }) {
  return (
    <View className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 flex-row items-start gap-5 mb-4">
      <Text className="text-[36px] font-extrabold text-[#0F172A]/15 leading-none w-16">
        {number}
      </Text>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#0F172A] mb-1.5">
          {title}
        </Text>
        {desc && (
          <Text className="text-[13px] text-[#64748B] leading-relaxed">
            {desc}
          </Text>
        )}
      </View>
    </View>
  );
}

function CautionBox({ children }) {
  return (
    <View className="bg-rose-50 border border-rose-100 rounded-[18px] p-5 flex-row items-start gap-3 mb-4">
      <Info size={18} color="#F43F5E" style={{ marginTop: 2 }} />
      <Text className="flex-1 text-[13px] text-[#475569]">
        <Text className="font-semibold text-rose-600">주의 : </Text>
        {children}
      </Text>
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

export default function ObesityReportPage() {
  const riskFactors = [
    "국내 성인 약 38%가 비만 (BMI ≥ 25, 질병관리청 2022)",
    "지방세포의 염증성 사이토카인 분비로 대사·호르몬 불균형 유발",
    "식이·운동·행동요법 병행과 필요 시 약물·수술 치료 고려",
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
            비만(Obesity)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            WHO 서태평양 지역 및 대한비만학회(KSSO) 기준 체질량지수(BMI) 25 kg/m²
            이상일 때 비만으로 정의되는, 건강에 악영향을 미치는 만성 질환입니다.
            {"\n"}
            제2형 당뇨·고혈압·이상지질혈증·심혈관질환의 주요 원인이 되는 독립적인
            질병으로 관리되어야 합니다.
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            비만이란?
          </Text>
          <View className="gap-4">
            <Text className="text-[13px] text-gray-600 leading-relaxed">
              비만은 에너지 섭취가 소비를 초과해 체지방이 과도하게 축적된
              상태입니다(WHO). 한국인은 BMI 25 kg/m² 이상을 비만으로 분류하며,
              허리둘레가 남성 90cm·여성 85cm 이상이면 복부비만으로 진단합니다.
              질병관리청 2022 조사에 따르면 국내 성인 비만 유병률은 약 38%이며
              남성에서 특히 높습니다.
            </Text>
            <Text className="text-[13px] text-gray-600 leading-relaxed">
              비만은 미용적 문제를 넘어 대사증후군의 핵심 원인으로, 제2형 당뇨,
              고혈압, 이상지질혈증, 심뇌혈관 질환, 지방간, 수면무호흡, 골관절염,
              일부 암종(대장암·유방암 등)의 위험을 증가시키며 우울증과도
              연관됩니다.
            </Text>
          </View>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader
          title="진단 기준 (Diagnosis)"
          subTitle="* 체질량지수(BMI) = 체중(kg) / [신장(m)]²"
        />
        <DiagnosisCard
          icon={CheckCircle2}
          title="18.5 - 22.9"
          subTitle="정상 체중"
          desc="건강 유지를 위한 정상 BMI 권장 범위(KSSO)"
          borderColor="border-l-emerald-400"
        />
        <DiagnosisCard
          icon={TrendingDown}
          title="23.0 - 24.9"
          subTitle="비만 전단계 (과체중)"
          desc="비만 전단계, 생활 습관 교정이 강력히 권고됨"
          borderColor="border-l-sky-400"
        />
        <DiagnosisCard
          icon={TrendingUp}
          title="25.0 - 29.9"
          subTitle="1단계 비만"
          desc="1단계 비만, 당뇨·고혈압 등 동반 위험 유의하게 증가"
          borderColor="border-l-orange-400"
        />
        <DiagnosisCard
          icon={AlertTriangle}
          title="30.0+"
          subTitle="2단계 이상 비만"
          desc="2~3단계 비만, 전문 의료 개입과 약물·수술 고려"
          borderColor="border-l-rose-400"
        />

        {/* 관리 가이드라인 */}
        <SectionHeader icon={HeartPulse} title="관리 가이드라인" />

        {/* 약물 치료 */}
        <View className="mb-10">
          <View className="bg-[#0F172A] p-5 rounded-t-[18px] flex-row items-center gap-3">
            <Stethoscope size={18} color="#34D399" />
            <Text className="font-semibold text-[14px] text-white">
              약물 치료 (Pharmacology)
            </Text>
          </View>
          <ContentCard className="rounded-t-none gap-6">
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                체중 감량 보조
              </Text>
              <View className="ml-4 gap-2">
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • BMI 25 이상 또는 동반 질환이 있는 BMI 23 이상에서 GLP-1
                  유사체, 식욕억제제, 지방흡수저해제 등 처방 고려
                </Text>
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 전문의 처방하에 식이·운동요법과 병행하여 효과 극대화
                </Text>
              </View>
            </View>
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                지속적 유지 관리
              </Text>
              <View className="ml-4 gap-2">
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 감량한 체중을 유지하기 위해 장기적 약물 사용 및 추적 관찰
                </Text>
                <Text className="text-[12px] text-gray-600 leading-relaxed">
                  • 초기 체중의 5~10% 감량 목표 달성 후에도 정기 상담과 생활 습관
                  모니터링 지속
                </Text>
              </View>
            </View>
          </ContentCard>
        </View>

        {/* 주의 박스 */}
        <CautionBox>
          <Text className="font-bold text-gray-800">액상과당의 위험성{"\n"}</Text>
          WHO는 첨가당을 총 열량의 10% 미만(가능하면 5% 미만)으로 제한하라
          권고합니다. 액상과당은 간으로 직행해 지방간·인슐린 저항성을 유발합니다.
        </CautionBox>
        <CautionBox>
          <Text className="font-bold text-gray-800">야식과 대사 장애{"\n"}</Text>
          취침 3시간 이내 식사는 인슐린 분비 리듬을 교란하고 지방으로 저장되기
          쉬우며, 수면의 질과 다음 날 식욕 호르몬(렙틴·그렐린) 균형을 무너뜨립니다.
        </CautionBox>

        {/* 신체 활동 요법 */}
        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <Dumbbell size={22} color="#10B981" />
            <Text className="text-lg font-bold text-gray-900">
              신체 활동 요법 (Physical Activity)
            </Text>
          </View>
          <Text className="text-[13px] text-gray-600 leading-relaxed mb-6">
            WHO 권고에 따라 주 150~300분의 중강도 유산소 운동(빠르게 걷기, 수영,
            자전거) 또는 75~150분의 고강도 운동에 주 2회 이상의 근력 운동을
            병행합니다.
          </Text>
          <View className="flex-row gap-4">
            <View className="bg-gray-100 p-4 rounded-lg flex-1">
              <Text className="font-bold text-[13px] mb-1.5 text-gray-900">
                유산소 운동
              </Text>
              <Text className="text-[11px] text-gray-500">
                심폐지구력 향상 및 체지방 감소
              </Text>
            </View>
            <View className="bg-gray-100 p-4 rounded-lg flex-1">
              <Text className="font-bold text-[13px] mb-1.5 text-gray-900">
                근력 운동
              </Text>
              <Text className="text-[11px] text-gray-500">
                기초대사량 증가 및 근육 손실 예방
              </Text>
            </View>
          </View>
        </ContentCard>

        {/* 식사 요법 */}
        <View className="bg-[#0a5a4a] p-8 rounded-2xl mb-8">
          <View className="flex-row items-center gap-3 mb-6">
            <Utensils size={20} color="#6EE7B7" />
            <Text className="text-[15px] font-bold text-white">식사 요법</Text>
          </View>
          <View className="gap-4">
            {[
              "1일 500~750 kcal 감량(주당 0.5~1kg 감소 목표)",
              "단백질·식이섬유 위주의 균형 잡힌 식단",
              "규칙적 식사 시간 준수 및 취침 3시간 전 금식",
            ].map((text, idx) => (
              <View key={idx} className="flex-row items-start gap-3">
                <CheckCircle2 size={16} color="#6EE7B7" style={{ marginTop: 2 }} />
                <Text className="flex-1 text-[13px] text-emerald-50">
                  {text}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-[11px] text-emerald-200 mt-8 leading-relaxed">
            * 굶는 다이어트는 근손실·요요를 유발하므로, 양질의 영양소를 적절량
            섭취하는 것이 핵심입니다.
          </Text>
        </View>

        {/* 행동 치료 */}
        <View className="flex-row items-center gap-3 mb-4 ml-1">
          <BrainCircuit size={20} color="#2563EB" />
          <Text className="text-[15px] font-bold text-gray-900">행동 치료</Text>
        </View>
        <StepInfoCard
          number="01"
          title="자기 모니터링"
          desc="식사·체중·운동을 매일 기록하여 생활 패턴을 객관적으로 파악하고 개선점을 도출합니다."
        />
        <StepInfoCard
          number="02"
          title="스트레스 관리"
          desc="신체적 허기와 정서적 허기를 구분하고, 명상·취미 활동으로 스트레스성 폭식을 예방합니다."
        />
        <StepInfoCard
          number="03"
          title="현실적 목표 설정"
          desc="6개월에 초기 체중의 5~10% 감량을 목표로 단계별 계획을 세워 성취감과 동기를 유지합니다."
        />

        {/* 약물 및 수술 */}
        <View className="flex-row items-center gap-3 mb-4 mt-6 ml-1">
          <Stethoscope size={20} color="#2563EB" />
          <Text className="text-[15px] font-bold text-gray-900">
            약물 및 수술
          </Text>
        </View>
        <StepInfoCard
          number="01"
          title="BMI 35 이상 또는 동반 질환이 있는 BMI 30 이상의 고도 비만에서는 위소매절제술 등 대사·비만 수술을 고려할 수 있습니다."
        />
        <StepInfoCard
          number="02"
          title="고혈압·당뇨·이상지질혈증 등 동반 질환이 있는 경우 질환 치료와 비만 관리를 동시에 진행하는 통합 치료 계획을 수립합니다."
        />

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Obesity and Overweight Fact Sheet, 2024" },
            { source: "대한비만학회(KSSO)", detail: "비만 진료지침 2022" },
            {
              source: "질병관리청(KDCA)",
              detail: "국민건강영양조사 2022, 비만 유병률",
            },
            {
              source: "WHO Western Pacific Region",
              detail: "BMI Cut-offs for Asian Populations",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
