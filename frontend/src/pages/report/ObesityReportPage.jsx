import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  HeartPulse,
  Activity,
  Utensils,
  BrainCircuit,
  Stethoscope,
} from "lucide-react";
import {
  SectionHeader,
  ContentCard,
  RiskFactorCard,
  DiagnosisCard,
  StepInfoCard,
  CautionBox,
  ReferenceFooter,
} from "../../components/report/DiseaseComponents";

const ObesityReportPage = () => {
  const riskFactors = [
    "국내 성인 약 38%가 비만 (BMI ≥ 25, 질병관리청 2022)",
    "지방세포의 염증성 사이토카인 분비로 대사·호르몬 불균형 유발",
    "식이·운동·행동요법 병행과 필요 시 약물·수술 치료 고려",
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">비만(Obesity)</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
WHO 서태평양 지역 및 대한비만학회(KSSO) 기준 체질량지수(BMI) 25 kg/m² 이상일 때 비만으로 정의되는, 건강에 악영향을 미치는 만성 질환입니다.
            <br />
            제2형 당뇨·고혈압·이상지질혈증·심혈관질환의 주요 원인이 되는 독립적인 질병으로 관리되어야 합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">비만이란?</h3>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-4">
                <p>
                  비만은 에너지 섭취가 소비를 초과해 체지방이 과도하게 축적된 상태입니다(WHO).
                  한국인은 BMI 25 kg/m² 이상을 비만으로 분류하며, 허리둘레가 남성 90cm·여성 85cm 이상이면
                  복부비만으로 진단합니다. 질병관리청 2022 조사에 따르면 국내 성인 비만 유병률은 약 38%이며 남성에서 특히 높습니다.
                </p>
                <p>
                  비만은 미용적 문제를 넘어 대사증후군의 핵심 원인으로, 제2형 당뇨, 고혈압, 이상지질혈증, 심뇌혈관 질환,
                  지방간, 수면무호흡, 골관절염, 일부 암종(대장암·유방암 등)의 위험을 증가시키며 우울증과도 연관됩니다.
                </p>
              </div>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        <SectionHeader
          title="진단 기준 (Diagnosis)"
          subTitle="* 체질량지수(BMI) = 체중(kg) / [신장(m)]²"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DiagnosisCard
            icon={CheckCircle2}
            title="18.5 - 22.9"
            subTitle="정상 체중"
            desc="건강 유지를 위한 정상 BMI 권장 범위(KSSO)"
            color="border-l-emerald-400"
          />
          <DiagnosisCard
            icon={TrendingDown}
            title="23.0 - 24.9"
            subTitle="비만 전단계 (과체중)"
            desc="비만 전단계, 생활 습관 교정이 강력히 권고됨"
            color="border-l-sky-400"
          />
          <DiagnosisCard
            icon={TrendingUp}
            title="25.0 - 29.9"
            subTitle="1단계 비만"
            desc="1단계 비만, 당뇨·고혈압 등 동반 위험 유의하게 증가"
            color="border-l-orange-400"
          />
          <DiagnosisCard
            icon={AlertTriangle}
            title="30.0+"
            subTitle="2단계 이상 비만"
            desc="2~3단계 비만, 전문 의료 개입과 약물·수술 고려"
            color="border-l-rose-400"
          />
        </div>

        <SectionHeader icon={HeartPulse} title="관리 가이드라인" />

        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Stethoscope size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                체중 감량 보조
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>BMI 25 이상 또는 동반 질환이 있는 BMI 23 이상에서 GLP-1 유사체, 식욕억제제, 지방흡수저해제 등 처방 고려</li>
                <li>전문의 처방하에 식이·운동요법과 병행하여 효과 극대화</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                지속적 유지 관리
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>감량한 체중을 유지하기 위해 장기적 약물 사용 및 추적 관찰</li>
                <li>초기 체중의 5~10% 감량 목표 달성 후에도 정기 상담과 생활 습관 모니터링 지속</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col gap-6">
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                액상과당의 위험성
              </span>
              WHO는 첨가당을 총 열량의 10% 미만(가능하면 5% 미만)으로 제한하라 권고합니다. 액상과당은 간으로 직행해 지방간·인슐린 저항성을 유발합니다.
            </CautionBox>
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                야식과 대사 장애
              </span>
              취침 3시간 이내 식사는 인슐린 분비 리듬을 교란하고 지방으로 저장되기 쉬우며, 수면의 질과 다음 날 식욕 호르몬(렙틴·그렐린) 균형을 무너뜨립니다.
            </CautionBox>
          </div>
          <div className="md:col-span-2">
            <ContentCard className="flex flex-col sm:flex-row gap-6 sm:gap-8 !p-6 md:!p-8 h-full items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="text-emerald-500" size={22} />
                  <h3 className="text-lg font-bold text-gray-900">
                    신체 활동 요법 (Physical Activity)
                  </h3>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  WHO 권고에 따라 주 150~300분의 중강도 유산소 운동(빠르게 걷기, 수영, 자전거) 또는 75~150분의 고강도 운동에 주 2회 이상의 근력 운동을 병행합니다.
                </p>
                <div className="flex gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg flex-1">
                    <h4 className="font-bold text-[13px] mb-1.5 text-gray-900">
                      유산소 운동
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      심폐지구력 향상 및 체지방 감소
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg flex-1">
                    <h4 className="font-bold text-[13px] mb-1.5 text-gray-900">
                      근력 운동
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      기초대사량 증가 및 근육 손실 예방
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-40 h-40 max-w-full rounded-2xl overflow-hidden shrink-0">
                <img
                  src="/path/to/your/exercise-image.jpg" // 실제 이미지 경로로 변경하세요.
                  alt="운동하는 여성"
                  className="w-full h-full object-cover"
                />
              </div>
            </ContentCard>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0a5a4a] text-white p-8 rounded-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Utensils size={20} className="text-emerald-300" />
              <h3 className="text-[15px] font-bold">식사 요법</h3>
            </div>
            <ul className="space-y-4 flex-1">
              {[
                "1일 500~750 kcal 감량(주당 0.5~1kg 감소 목표)",
                "단백질·식이섬유 위주의 균형 잡힌 식단",
                "규칙적 식사 시간 준수 및 취침 3시간 전 금식",
              ].map((text, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-[13px] text-emerald-50"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-300 shrink-0 mt-0.5"
                  />
                  {text}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-emerald-200 mt-8 leading-relaxed">
              * 굶는 다이어트는 근손실·요요를 유발하므로, 양질의 영양소를 적절량 섭취하는 것이 핵심입니다.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 ml-1">
              <BrainCircuit size={20} className="text-blue-600" />
              <h3 className="text-[15px] font-bold text-gray-900">행동 치료</h3>
            </div>
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
          </div>

          {/* Surgery/Procedure */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 ml-1">
              <Stethoscope size={20} className="text-blue-600" />
              <h3 className="text-[15px] font-bold text-gray-900">
                약물 및 수술
              </h3>
            </div>
            <StepInfoCard
              number="01"
              title="BMI 35 이상 또는 동반 질환이 있는 BMI 30 이상의 고도 비만에서는 위소매절제술 등 대사·비만 수술을 고려할 수 있습니다."
            />
            <StepInfoCard
              number="02"
              title="고혈압·당뇨·이상지질혈증 등 동반 질환이 있는 경우 질환 치료와 비만 관리를 동시에 진행하는 통합 치료 계획을 수립합니다."
            />
          </div>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Obesity and Overweight Fact Sheet, 2024" },
            { source: "대한비만학회(KSSO)", detail: "비만 진료지침 2022" },
            { source: "질병관리청(KDCA)", detail: "국민건강영양조사 2022, 비만 유병률" },
            { source: "WHO Western Pacific Region", detail: "BMI Cut-offs for Asian Populations" },
          ]}
        />
      </main>
    </div>
  );
};

export default ObesityReportPage;
