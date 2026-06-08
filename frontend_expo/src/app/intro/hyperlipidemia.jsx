import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  Waves,
  Activity,
  Stethoscope,
  Target,
  Zap,
  CheckCircle2,
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

function FoodItem({ text, isBad }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`w-1.5 h-1.5 rounded-full ${
          isBad ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      <Text className="flex-1 text-[13px] text-[#475569]">{text}</Text>
    </View>
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
        <Text className="text-[13px] text-[#64748B] leading-relaxed">
          {desc}
        </Text>
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

export default function DyslipidemiaReportPage() {
  const riskFactors = [
    "국내 30세 이상 성인 약 40%가 이상지질혈증 (질병관리청 2022)",
    "자각 증상 없이 동맥경화·심뇌혈관 질환으로 진행",
    "식이·운동·체중 관리와 스타틴 등 약물 치료 병행 필수",
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
            고지혈증 (Hyperlipidemia)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            한국지질·동맥경화학회(KSoLA) 2022 진료지침 기준 LDL 160·총콜레스테롤
            240·중성지방 200 mg/dL 이상 또는 HDL 40 mg/dL 미만일 때 진단되는 만성
            대사 질환입니다.
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            고지혈증이란?
          </Text>
          <Text className="text-[14px] text-gray-600 leading-loose">
            이상지질혈증은 혈중 LDL 콜레스테롤·총콜레스테롤·중성지방 상승 또는 HDL
            콜레스테롤 저하로 정의됩니다(KSoLA). 질병관리청 2022 조사에서 국내 30세
            이상 성인의 약 40%가 이상지질혈증을 가진 것으로 보고되었으며, 연령이
            증가할수록 유병률이 급격히 상승합니다.
            {"\n\n"}
            과잉 지질은 혈관 내피에 플라크를 형성하여 동맥경화를 가속화하고, 결국
            협심증·심근경색·뇌졸중·말초혈관질환을 유발합니다. 대사증후군·당뇨·고혈압과
            동반되는 경우가 많아 통합적인 위험도 평가와 LDL 목표 수치 관리가
            핵심입니다.
          </Text>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader icon={Stethoscope} title="진단 기준 (Diagnosis)" />
        <DiagnosisCard
          icon={Target}
          title="LDL 160 / TC 240 / TG 200 mg/dL"
          subTitle="KSoLA 2022 진단 기준"
          desc="LDL 160 mg/dL 이상, 총콜레스테롤 240 mg/dL 이상, 중성지방 200 mg/dL 이상, HDL 40 mg/dL 미만 중 하나에 해당하면 이상지질혈증으로 진단합니다."
          borderColor="border-l-emerald-500"
        />
        <DiagnosisCard
          icon={Activity}
          title="9~12시간 공복 혈액 검사"
          subTitle="지질 패널 측정"
          desc="중성지방 정확도를 위해 9~12시간 공복 후 채혈하여 TC·LDL·HDL·TG를 측정합니다. 1~2주 간격 재검으로 일시적 변동을 배제합니다."
          borderColor="border-l-blue-500"
        />
        <DiagnosisCard
          icon={Zap}
          title="심혈관 위험도 평가"
          subTitle="동반 위험인자 분석"
          desc="경동맥 초음파·관상동맥 CT로 동맥경화를 확인하고, 연령·고혈압·당뇨·흡연·가족력을 통합해 10년 심혈관 위험도를 평가하여 LDL 목표를 설정합니다."
          borderColor="border-l-emerald-300"
        />

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldCheck} title="관리 가이드라인" />

        {/* 약물 치료 */}
        <View className="mb-10">
          <View className="bg-[#0F172A] p-5 rounded-t-[18px] flex-row items-center gap-3">
            <HeartPulse size={18} color="#34D399" />
            <Text className="font-semibold text-[14px] text-white">
              약물 치료 (Pharmacology)
            </Text>
          </View>
          <ContentCard className="rounded-t-none gap-6">
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                지질 수치 강하
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • 스타틴(Statin)이 1차 약제로 간 콜레스테롤 합성을 억제해 LDL을
                30~50% 감소시킵니다. 필요 시 에제티미브, PCSK9 억제제를
                병용합니다.
              </Text>
            </View>
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                지속적 모니터링
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • 위험도에 따라 목표 LDL(고위험군 70 mg/dL 미만, 중등도 100 mg/dL
                미만, 저위험 130 mg/dL 미만)을 유지하며, 정기 혈액 검사로
                모니터링합니다.
              </Text>
            </View>
          </ContentCard>
        </View>

        {/* 식이 및 신체 활동 */}
        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <Activity size={18} color="#374151" />
            <Text className="font-extrabold text-[14px] text-[#0F172A]">
              영양 및 생활습관
            </Text>
          </View>
          <View className="mb-4">
            <Text className="text-[12px] font-bold text-rose-500 mb-3">
              피해야 할 음식
            </Text>
            <View className="gap-3">
              <FoodItem
                text="포화지방·트랜스지방 (삼겹살, 버터, 튀김, 마가린)"
                isBad
              />
              <FoodItem text="과도한 음주 (중성지방 급상승의 주원인)" isBad />
              <FoodItem
                text="단순당·액상과당 (탄산음료, 믹스커피, 디저트)"
                isBad
              />
            </View>
          </View>
          <View>
            <Text className="text-[12px] font-bold text-emerald-600 mb-3">
              권장 사항
            </Text>
            <View className="gap-3">
              <FoodItem text="수용성 식이섬유 풍부한 통곡물·귀리·콩" />
              <FoodItem text="오메가-3 불포화지방산 (등푸른 생선, 견과류)" />
              <FoodItem text="신선한 채소·과일·해조류" />
            </View>
          </View>
        </ContentCard>

        {/* 신체 활동 강조 카드 */}
        <View className="bg-[#0F172A] rounded-[18px] p-8 mb-8 overflow-hidden">
          <Text className="text-[20px] font-bold mb-4 text-white">
            신체 활동 및 체중 관리{"\n"}(Physical Activity)
          </Text>
          <Text className="text-[13px] text-white/70 leading-relaxed">
            WHO 권고대로 주 150~300분 중강도 또는 75~150분 고강도 유산소 운동은
            HDL을 높이고 TG를 낮춥니다. 체중 5~10% 감량만으로도 LDL·TG가 유의하게
            개선됩니다.
          </Text>
        </View>

        {/* 임상 증상 및 징후 */}
        <SectionHeader icon={AlertCircle} title="임상 증상 및 징후" />
        <StepInfoCard
          number="01"
          title="초기 무증상 (Silent Phase)"
          desc="이상지질혈증 자체는 통증·외관 변화가 거의 없으며, 정기 혈액 검사(40세 이상 4년마다 국가검진)로만 발견됩니다."
        />
        <StepInfoCard
          number="02"
          title="경고 징후 (Warning Signs)"
          desc="중증의 경우 눈꺼풀 황색종, 각막환, 발뒤꿈치 건황색종이 나타날 수 있고, 협심증 양상의 가슴 답답함이 동반될 수 있습니다."
        />
        <StepInfoCard
          number="03"
          title="만성 합병증 (Chronic Complications)"
          desc="동맥경화 진행으로 심근경색·뇌경색·말초혈관질환이 발생하며, 중성지방 500 mg/dL 초과 시에는 급성 췌장염 위험도 급증합니다."
        />
        <CautionBox>
          고혈압·당뇨·비만 등 동반 질환을 함께 관리하고, 위험도에 따라 6개월~1년
          간격으로 지질 검사 모니터링이 필요합니다.
        </CautionBox>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            {
              source: "WHO",
              detail: "Cardiovascular Diseases (CVDs) Fact Sheet, 2023",
            },
            {
              source: "한국지질·동맥경화학회(KSoLA)",
              detail: "이상지질혈증 진료지침 제5판, 2022",
            },
            {
              source: "질병관리청(KDCA)",
              detail: "국민건강영양조사 2022, 만성질환 현황보고",
            },
            {
              source: "ESC/EAS",
              detail:
                "Guidelines for the Management of Dyslipidaemias, 2019/2023 update",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
