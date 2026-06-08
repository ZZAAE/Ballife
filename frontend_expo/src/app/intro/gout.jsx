import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ClipboardCheck,
  ShieldPlus,
  AlertTriangle,
  GlassWater,
  Activity,
  Search,
  Layers,
  Thermometer,
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

export default function GoutReportPage() {
  const riskFactors = [
    "남성 발병률이 여성보다 약 3~4배 높고 40~50대에서 급증",
    "급성 발작의 절반 이상이 엄지발가락 제1중족지절관절에서 시작",
    "식이 조절·체중 관리·요산저하제 복용 병행이 필수",
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
            통풍(Gout)
          </Text>
          <Text className="text-[14px] text-[#64748B] leading-relaxed">
            혈청 요산 7.0 mg/dL 초과로 정의되는 고요산혈증으로 인해 관절에 요산
            결정(MSU)이 침착되며 발생하는 만성 염증성 관절염입니다(ACR/대한류마티스학회
            2020).
          </Text>
        </View>

        {/* 개요 */}
        <ContentCard className="border-t-[5px] border-t-emerald-500 mb-8">
          <Text className="text-lg font-extrabold mb-5 text-[#0F172A]">
            통풍이란?
          </Text>
          <Text className="text-[14px] text-gray-600 leading-loose">
            통풍은 퓨린 대사 이상으로 혈청 요산이 7.0 mg/dL을 초과(고요산혈증)하여
            관절·연부조직에 단일나트륨요산(MSU) 결정이 침착되며 발생합니다. 관절에
            침착된 결정은 급격한 염증 반응을 유발하여 극심한 통증·부종·발적·열감을
            동반하는 급성 발작을 일으킵니다. 국내 통풍 환자는 최근 10년간 약 2배
            증가했습니다.
            {"\n\n"}
            통풍은 단순 관절 질환을 넘어 대사증후군·고혈압·만성신장병과 밀접하게
            연관되며, 관리되지 않을 경우 만성 결절성 통풍, 신결석, 신부전 등으로
            진행될 수 있습니다.
          </Text>
        </ContentCard>
        <RiskFactorCard factors={riskFactors} />

        {/* 진단 기준 */}
        <SectionHeader icon={ClipboardCheck} title="진단 기준 (Diagnosis)" />
        <DiagnosisCard
          icon={Thermometer}
          title="혈청 요산 > 7.0 mg/dL"
          subTitle="고요산혈증 기준"
          desc="혈청 요산 7.0 mg/dL 초과를 고요산혈증으로 정의합니다(ACR/KCR 2020). 단, 급성 발작 중에는 정상 수치를 보이기도 하므로 시기에 따른 재검이 필요합니다."
          borderColor="border-l-emerald-500"
        />
        <DiagnosisCard
          icon={Layers}
          title="관절액 MSU 결정 확인"
          subTitle="확진 골드 스탠다드"
          desc="관절천자로 채취한 활액에서 편광현미경상 음성 복굴절을 보이는 바늘 모양의 단일나트륨요산(MSU) 결정을 확인하면 확진됩니다."
          borderColor="border-l-blue-500"
        />
        <DiagnosisCard
          icon={Search}
          title="초음파·DECT 영상 진단"
          subTitle="비침습적 진단"
          desc="관절 초음파에서 'Double Contour' 사인을 확인하거나 이중에너지 CT(DECT)로 요산 결정 침착을 시각화하여 비침습적으로 진단할 수 있습니다."
          borderColor="border-l-emerald-300"
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
                급성기 완화
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • NSAIDs, 콜히친(저용량), 스테로이드 제제를 단독 또는 병용하여
                발작 24시간 이내에 염증을 억제합니다.
              </Text>
            </View>
            <View>
              <Text className="font-bold text-[14px] mb-4 text-gray-900">
                장기적 예방(ULT)
              </Text>
              <Text className="text-[12px] text-gray-600 leading-relaxed ml-4">
                • 요산저하제(알로푸리놀, 페북소스타트)를 꾸준히 복용해 혈청 요산을
                6.0 mg/dL 미만(결절성 통풍은 5.0 mg/dL 미만)으로 유지합니다.
              </Text>
            </View>
          </ContentCard>
        </View>

        {/* 영양 및 수분 섭취 */}
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
              <FoodItem text="맥주·증류주 등 알코올 (요산 생성 촉진)" isBad />
              <FoodItem text="고퓨린 육류 (붉은 고기, 베이컨)" isBad />
              <FoodItem
                text="동물 내장, 멸치, 정어리, 고등어 등 고퓨린 어류"
                isBad
              />
            </View>
          </View>
          <View>
            <Text className="text-[12px] font-bold text-emerald-600 mb-3">
              권장 사항
            </Text>
            <View className="gap-3">
              <FoodItem text="저지방 우유·요거트 등 유제품 (요산 배출 도움)" />
              <FoodItem text="채소·체리 및 비타민 C 풍부 식품" />
              <FoodItem text="통곡물 위주의 복합 탄수화물" />
            </View>
          </View>
        </ContentCard>

        {/* 수분 섭취 강조 카드 */}
        <View className="bg-[#0F172A] rounded-[18px] p-8 mb-8 overflow-hidden">
          <View className="bg-white/10 w-10 h-10 rounded-lg items-center justify-center mb-4">
            <GlassWater size={20} color="#93C5FD" />
          </View>
          <Text className="text-[20px] font-bold mb-4 text-white">
            수분 섭취{"\n"}(Hydration)
          </Text>
          <Text className="text-[13px] text-white/70 leading-relaxed">
            매일 2L 이상의 물 섭취는 신장을 통한 요산 배설을 촉진하고 요산 결석
            형성을 예방합니다. 가당 음료·과당 음료는 오히려 요산 생성을
            증가시키므로 피해야 합니다.
          </Text>
        </View>

        {/* 임상 증상 및 징후 */}
        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
        <StepInfoCard
          number="01"
          title="급성 통풍성 관절염"
          desc="주로 야간에 급격히 시작되며 관절이 붉게 붓고 극심한 통증이 발생합니다. 첫 발작의 50% 이상이 엄지발가락 제1중족지절관절에서 일어납니다."
        />
        <StepInfoCard
          number="02"
          title="간헐기 통풍"
          desc="발작 후 증상이 사라진 무증상 기간으로, 치료를 중단하기 쉬우나 요산 조절을 하지 않으면 재발 간격이 점점 짧아집니다."
        />
        <StepInfoCard
          number="03"
          title="만성 결절성 통풍"
          desc="수년간 방치 시 요산 결정이 결절(Tophus)을 형성하여 관절 파괴와 변형을 유발하고, 신결석·요산 신증으로 신기능 저하를 초래합니다."
        />
        <CautionBox>
          고혈압·당뇨·이상지질혈증·비만 등 대사증후군 동반 관리가 통풍 예후에
          결정적이며, 정기적 요산·신기능 검사가 필요합니다.
        </CautionBox>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "대한류마티스학회(KCR)", detail: "통풍 진료지침 2020" },
            {
              source: "American College of Rheumatology (ACR)",
              detail: "Guideline for the Management of Gout, 2020",
            },
            {
              source: "질병관리청(KDCA)",
              detail: "만성질환 통계 (통풍 유병 추이)",
            },
            {
              source: "EULAR",
              detail: "Recommendations for the Management of Gout, 2016 (updated)",
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
