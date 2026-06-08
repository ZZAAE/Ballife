import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ClipboardCheck,
  AlertTriangle,
  Utensils,
  Activity,
  Droplets,
  Search,
  Calendar,
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

export default function DiabetesReportPage() {
  const riskFactors = [
    "복부 비만 및 인슐린 저항성 (한국인 제2형 당뇨의 핵심 위험요인)",
    "신체활동 부족과 정제 탄수화물 위주의 식습관",
    "가족력, 40세 이상 연령, 고혈압·이상지질혈증 동반",
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
            당뇨병(Diabetes Mellitus)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            당뇨병은 인슐린 분비 결핍 또는 인슐린 저항성에 의해 혈당이 만성적으로
            상승하는 대사 질환입니다(WHO). 대한당뇨병학회 2023 진료지침에 따라
            공복혈당, HbA1c, 식후혈당 기준으로 진단하며, 체계적인 혈당 관리와 생활
            습관 교정이 합병증 예방의 핵심입니다.
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            당뇨병이란?
          </Text>
          <Text className="text-[14px] text-gray-600 leading-loose">
            당뇨병은 고혈당을 공통된 특징으로 하는 만성 대사 질환군입니다(WHO).
            만성적인 혈당 상승은 망막·신장·신경 등 미세혈관 합병증과
            심근경색·뇌졸중 같은 대혈관 합병증을 유발합니다. 질병관리청
            국민건강영양조사(2022)에 따르면 국내 30세 이상 성인의 약 14%가 당뇨병을
            가지고 있으며, 당뇨 전단계까지 포함하면 절반 가까이에 이릅니다.
            {"\n\n"}
            정상적으로 혈당은 췌장 베타세포에서 분비되는 인슐린에 의해 조절됩니다.
            당뇨병에서는 인슐린 분비 부족 또는 인슐린 저항성으로 이 조절 기전이
            무너지며, 치료 없이 방치할 경우 심혈관 질환·신부전·실명 등 중대한
            합병증으로 이어집니다.
          </Text>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader icon={ClipboardCheck} title="진단 기준 (Diagnosis)" />
        <DiagnosisCard
          icon={Droplets}
          title="공복혈당 126 mg/dL 이상"
          subTitle="대한당뇨병학회 2023 기준"
          desc="8시간 이상 공복 후 혈당이 126 mg/dL 이상이면 당뇨, 100~125 mg/dL이면 공복혈당장애(당뇨 전단계)에 해당합니다. 식후 2시간 혈당 200 mg/dL 이상도 진단 기준입니다."
          borderColor="border-l-emerald-500"
        />
        <DiagnosisCard
          icon={Search}
          title="당화혈색소(HbA1c) 6.5% 이상"
          subTitle="장기 혈당 지표"
          desc="지난 2~3개월간의 평균 혈당을 반영합니다. HbA1c 6.5% 이상이면 당뇨, 5.7~6.4%는 당뇨 전단계로 분류됩니다(WHO·대한당뇨병학회)."
          borderColor="border-l-blue-500"
        />
        <DiagnosisCard
          icon={Calendar}
          title="75g 경구당부하검사(OGTT)"
          subTitle="확진 및 합병증 평가"
          desc="75g 포도당 섭취 2시간 후 혈당 200 mg/dL 이상이면 당뇨로 진단합니다. 진단 후 안저·미세알부민뇨·신경 검사를 통해 표적 장기 합병증을 평가합니다."
          borderColor="border-l-emerald-300"
        />

        {/* 당뇨의 종류 */}
        <SectionHeader title="당뇨의 종류" />
        <View className="mb-10">
          <View className="bg-[#0F172A] p-5 rounded-t-[18px] flex-row items-center gap-3">
            <Activity size={18} color="#34D399" />
            <Text className="font-semibold text-[14px] text-white">
              당뇨의 종류
            </Text>
          </View>
          <ContentCard className="rounded-t-none gap-6">
            <View>
              <Text className="font-extrabold text-[14px] mb-4 text-gray-800 border-b border-[#E5E7EB] pb-2">
                제1형 당뇨병
              </Text>
              <Text className="text-[12px] text-gray-500 leading-relaxed mb-3">
                췌장 베타세포의 자가면역성 파괴로 인슐린 분비가 절대적으로 결핍된
                형태입니다. 주로 소아·청소년기에 발병하며, 외부 인슐린 투여 없이는
                생존이 어렵습니다.
              </Text>
              <Text className="text-[12px] text-emerald-600 font-bold ml-4">
                • 외부 인슐린 주입 필수
              </Text>
            </View>
            <View>
              <Text className="font-extrabold text-[14px] mb-4 text-gray-800 border-b border-[#E5E7EB] pb-2">
                제2형 당뇨병
              </Text>
              <Text className="text-[12px] text-gray-500 leading-relaxed mb-3">
                한국인 당뇨 환자의 90% 이상을 차지하는 가장 흔한 형태로, 인슐린
                저항성과 상대적 인슐린 분비 부족이 결합된 상태입니다.
                비만·운동 부족·노화와 강한 연관이 있습니다.
              </Text>
              <Text className="text-[12px] text-emerald-600 font-bold ml-4">
                • 대사 진행성 질환
              </Text>
            </View>
          </ContentCard>
        </View>

        {/* 영양 및 신체 활동 */}
        <ContentCard className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <Utensils size={18} color="#374151" />
            <Text className="font-extrabold text-[14px] text-[#0F172A]">
              영양 및 생활습관
            </Text>
          </View>
          <View className="mb-4">
            <Text className="text-[12px] font-bold text-rose-500 mb-3">
              피해야 할 음식
            </Text>
            <View className="gap-2">
              <FoodItem
                text="단순당·정제 탄수화물 (설탕, 탄산음료, 흰쌀밥, 떡)"
                isBad
              />
              <FoodItem text="가당 음료 및 과량의 과일주스" isBad />
              <FoodItem text="포화·트랜스지방 함유 가공식품" isBad />
            </View>
          </View>
          <View>
            <Text className="text-[12px] font-bold text-emerald-600 mb-3">
              권장 사항
            </Text>
            <View className="gap-2">
              <FoodItem text="식이섬유 풍부한 통곡물 (현미, 잡곡, 귀리)" />
              <FoodItem text="신선한 채소 및 양질의 단백질 (콩, 두부, 생선)" />
              <FoodItem text="불포화지방산 (견과류, 등푸른 생선, 올리브유)" />
            </View>
          </View>
        </ContentCard>

        {/* 신체 활동 강조 카드 */}
        <View className="bg-[#0F172A] rounded-[18px] p-8 mb-8 overflow-hidden">
          <Text className="text-[20px] font-bold mb-4 text-white">
            규칙적인 신체 활동{"\n"}(Physical Activity)
          </Text>
          <Text className="text-[13px] text-white/70 leading-relaxed">
            WHO 권고에 따라 주 150~300분의 중강도 유산소 운동과 주 2회 이상의 근력
            운동을 권장합니다. 특히 식후 30분~1시간 뒤 걷기는 식후 혈당 상승을
            효과적으로 억제합니다.
          </Text>
        </View>

        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
        <StepInfoCard
          number="01"
          title="삼다(三多) 증상 - 초기 신호"
          desc="다음(多飮)·다뇨(多尿)·다식(多食)이 대표적입니다. 고혈당으로 소변에 당이 빠져나가며 삼투압성 이뇨가 발생하기 때문입니다."
        />
        <StepInfoCard
          number="02"
          title="경고 증상 - 체중 감소·시야 변화"
          desc="인슐린 작용 저하로 포도당 대신 지방·단백질을 분해하며 단기간에 체중이 줄어듭니다. 시야 흐림, 잦은 감염, 손발 저림도 위험 신호입니다."
        />
        <StepInfoCard
          number="03"
          title="만성 합병증"
          desc="장기간 방치 시 당뇨망막병증, 당뇨신증(투석 원인 1위), 당뇨신경병증, 심근경색·뇌졸중 등 전신 합병증이 발생할 수 있습니다."
        />
        <CautionBox>
          초기 당뇨병은 무증상인 경우가 많아, 질병관리청은 40세 이상 또는
          위험요인 보유자에게 매년 공복혈당·HbA1c 정기 검사를 권고합니다.
        </CautionBox>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            {
              source: "WHO (World Health Organization)",
              detail: "Diabetes Fact Sheet, 2024",
            },
            { source: "대한당뇨병학회", detail: "당뇨병 진료지침 2023" },
            {
              source: "질병관리청(KDCA)",
              detail: "국민건강영양조사 2022, 만성질환 통계",
            },
            {
              source: "American Diabetes Association",
              detail: "Standards of Care in Diabetes, 2024",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
