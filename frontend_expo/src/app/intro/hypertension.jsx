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

export default function HypertensionReportPage() {
  const riskFactors = [
    "국내 30세 이상 성인 약 28%가 고혈압 (질병관리청 2022)",
    "무증상 진행으로 발견 시 이미 표적 장기 손상 가능",
    "저염식·체중 관리·약물 치료의 병행이 필수",
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
            고혈압(Hypertension)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            대한고혈압학회 2022 진료지침 기준 진료실 혈압 140/90 mmHg 이상,
            가정혈압 135/85 mmHg 이상일 때 진단되는 만성 질환입니다. 초기 증상이
            없어 '침묵의 살인자'로 불리며, 뇌졸중·심근경색 등 합병증 예방을 위해
            체계적인 관리가 필수입니다.
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            고혈압이란?
          </Text>
          <Text className="text-[14px] text-gray-600 leading-loose">
            고혈압은 혈관 벽에 가해지는 압력이 지속적으로 정상 범위를 넘어선
            상태입니다(WHO). 질병관리청 국민건강영양조사 2022에 따르면 국내 30세
            이상 성인 약 28%가 고혈압을 가지고 있으며, 65세 이상에서는 절반을
            넘습니다. 만성적 압력 상승은 혈관 내피를 손상시키고 동맥경화를
            가속화하여 뇌졸중·심근경색 등 치명적 합병증으로 이어집니다.
            {"\n\n"}
            고혈압은 대사증후군과 밀접하며, 관리되지 않을 경우
            심부전·신부전(투석)·망막병증·치매 위험을 높입니다. 가정혈압 측정과
            정기적 의료기관 방문을 통한 지속 관리가 핵심입니다.
          </Text>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader icon={Stethoscope} title="진단 기준 (Diagnosis)" />
        <DiagnosisCard
          icon={Target}
          title="진료실 혈압 140/90 mmHg 이상"
          subTitle="대한고혈압학회 2022 기준"
          desc="2회 이상 방문 시 측정한 진료실 혈압이 수축기 140 또는 이완기 90 mmHg 이상이면 고혈압으로 진단합니다. 130~139/80~89는 주의 단계입니다."
          borderColor="border-l-emerald-500"
        />
        <DiagnosisCard
          icon={Activity}
          title="가정혈압 135/85 mmHg 이상"
          subTitle="가정·24시간 활동혈압 측정"
          desc="백의(白衣) 고혈압·가면 고혈압을 감별하기 위해 가정혈압 또는 24시간 활동혈압을 측정합니다. 활동혈압 주간 평균 135/85, 야간 120/70 이상이 진단 기준입니다."
          borderColor="border-l-blue-500"
        />
        <DiagnosisCard
          icon={Zap}
          title="표적 장기 손상 평가"
          subTitle="합병증 동반 검사"
          desc="심전도·심초음파·안저 검사·소변(미세알부민뇨)·신기능 검사를 통해 좌심실 비대, 망막병증, 신장 손상 등 표적 장기 손상을 평가합니다."
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
                초기 혈압 조절
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • ACE 억제제·ARB(안지오텐신 수용체 차단제)·칼슘채널차단제(CCB)·이뇨제가
                1차 약제로 사용되며, 환자 상태에 따라 단독 또는 복합 요법으로 목표
                혈압까지 안전하게 조절합니다.
              </Text>
            </View>
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                장기적 유지
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • 가정혈압 측정, 규칙적 운동, 처방대로의 꾸준한 복용을 통해 일반
                성인은 140/90 mmHg 미만, 당뇨·신장질환 동반 시 130/80 mmHg 미만
                유지를 목표로 합니다.
              </Text>
            </View>
          </ContentCard>
        </View>

        {/* 식이 및 생활습관 */}
        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <Activity size={18} color="#374151" />
            <Text className="font-extrabold text-[14px] text-[#0F172A]">
              영양 및 생활습관
            </Text>
          </View>
          <View className="mb-4">
            <Text className="text-[12px] font-bold text-rose-500 mb-3">
              자제해야 할 음식
            </Text>
            <View className="gap-3">
              <FoodItem text="고나트륨 식품 (라면, 젓갈, 김치, 가공육)" isBad />
              <FoodItem text="과도한 음주 (남 2잔/여 1잔 이하로 제한)" isBad />
              <FoodItem text="포화지방·트랜스지방·단순당" isBad />
            </View>
          </View>
          <View>
            <Text className="text-[12px] font-bold text-emerald-600 mb-3">
              권장 사항
            </Text>
            <View className="gap-3">
              <FoodItem text="DASH 식단 (채소·과일·저지방 유제품)" />
              <FoodItem text="칼륨 풍부 식품 (바나나, 시금치, 감자)" />
              <FoodItem text="통곡물 및 저지방 단백질 (생선, 콩, 닭가슴살)" />
            </View>
          </View>
        </ContentCard>

        {/* 체중 관리 강조 카드 */}
        <View className="bg-[#0F172A] rounded-[18px] p-8 mb-8 overflow-hidden">
          <Text className="text-[20px] font-bold mb-4 text-white">
            체중 관리 및 유산소 운동{"\n"}(Lifestyle Changes)
          </Text>
          <Text className="text-[13px] text-white/70 leading-relaxed">
            WHO는 주 150~300분의 중강도 유산소 운동을 권장하며, 소금 섭취를 하루
            5g(나트륨 2,000mg) 미만으로 제한하도록 권고합니다. 체중 1kg 감량 시
            혈압이 약 1 mmHg 낮아집니다.
          </Text>
        </View>

        {/* 임상 증상 및 징후 */}
        <SectionHeader icon={AlertCircle} title="임상 증상 및 징후" />
        <StepInfoCard
          number="01"
          title="초기 무증상 (Silent Phase)"
          desc="대부분의 환자가 혈압 상승을 자각하지 못합니다. '침묵의 살인자'로 불리는 이유이며, 가정혈압 측정과 정기 건강검진을 통해서만 발견됩니다."
        />
        <StepInfoCard
          number="02"
          title="경고 증상 (Warning Signs)"
          desc="혈압이 급격히 오를 때 후두부 두통, 어지러움, 코피, 시야 흐림이 나타날 수 있으며, 180/120 mmHg 이상의 응급 고혈압은 즉시 응급실 진료가 필요합니다."
        />
        <StepInfoCard
          number="03"
          title="만성 합병증 (Chronic Complications)"
          desc="장기간 방치 시 동맥경화가 진행되어 뇌졸중·심근경색·심부전·만성신장병·고혈압성 망막병증 등 표적 장기 손상으로 이어집니다."
        />
        <CautionBox>
          당뇨·이상지질혈증·비만 등 동반 질환을 함께 관리하고, 6개월~1년 간격의
          정기 검진을 통해 합병증을 조기 발견하는 것이 중요합니다.
        </CautionBox>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Hypertension Fact Sheet, 2023" },
            { source: "대한고혈압학회", detail: "고혈압 진료지침 2022" },
            {
              source: "질병관리청(KDCA)",
              detail: "국민건강통계 2022 (고혈압 유병률)",
            },
            {
              source: "ESC/ESH",
              detail:
                "Guidelines for the Management of Arterial Hypertension, 2023",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
