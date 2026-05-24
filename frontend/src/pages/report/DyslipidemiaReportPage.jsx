import React from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  AlertCircle, 
  Waves,
  Activity,
  Stethoscope,
  Target,
  Zap
} from "lucide-react";

import { 
  SectionHeader, 
  ContentCard, 
  RiskFactorCard, 
  DiagnosisCard, 
  FoodItem, 
  StepInfoCard,
  CautionBox,
  ReferenceFooter
} from '../../components/report/DiseaseComponents';

export default function DyslipidemiaReportPage() {
  const riskFactors = [
    "국내 30세 이상 성인 약 40%가 이상지질혈증 (질병관리청 2022)",
    "자각 증상 없이 동맥경화·심뇌혈관 질환으로 진행",
    "식이·운동·체중 관리와 스타틴 등 약물 치료 병행 필수"
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">고지혈증 (Hyperlipidemia)</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
한국지질·동맥경화학회(KSoLA) 2022 진료지침 기준 LDL 160·총콜레스테롤 240·중성지방 200 mg/dL 이상 또는 HDL 40 mg/dL 미만일 때 진단되는 만성 대사 질환입니다.
          </p>
        </div>

        {/* 개요 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">고지혈증이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                이상지질혈증은 혈중 LDL 콜레스테롤·총콜레스테롤·중성지방 상승 또는 HDL 콜레스테롤 저하로 정의됩니다(KSoLA). 질병관리청 2022 조사에서
                국내 30세 이상 성인의 약 40%가 이상지질혈증을 가진 것으로 보고되었으며, 연령이 증가할수록 유병률이 급격히 상승합니다.
                <br /><br />
                과잉 지질은 혈관 내피에 플라크를 형성하여 동맥경화를 가속화하고, 결국 협심증·심근경색·뇌졸중·말초혈관질환을 유발합니다.
                대사증후군·당뇨·고혈압과 동반되는 경우가 많아 통합적인 위험도 평가와 LDL 목표 수치 관리가 핵심입니다.
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 섹션 */}
        <SectionHeader 
          icon={Stethoscope} 
          title="진단 기준 (Diagnosis)" 
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DiagnosisCard 
            icon={Target} 
            title="LDL 160 / TC 240 / TG 200 mg/dL"
            subTitle="KSoLA 2022 진단 기준"
            desc="LDL 160 mg/dL 이상, 총콜레스테롤 240 mg/dL 이상, 중성지방 200 mg/dL 이상, HDL 40 mg/dL 미만 중 하나에 해당하면 이상지질혈증으로 진단합니다."
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Activity} 
            title="9~12시간 공복 혈액 검사"
            subTitle="지질 패널 측정"
            desc="중성지방 정확도를 위해 9~12시간 공복 후 채혈하여 TC·LDL·HDL·TG를 측정합니다. 1~2주 간격 재검으로 일시적 변동을 배제합니다."
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Zap} 
            title="심혈관 위험도 평가"
            subTitle="동반 위험인자 분석"
            desc="경동맥 초음파·관상동맥 CT로 동맥경화를 확인하고, 연령·고혈압·당뇨·흡연·가족력을 통합해 10년 심혈관 위험도를 평가하여 LDL 목표를 설정합니다."
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 섹션 */}
        <SectionHeader icon={ShieldCheck} title="관리 가이드라인" />
        
        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <HeartPulse size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
             <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">지질 수치 강하</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>스타틴(Statin)이 1차 약제로 간 콜레스테롤 합성을 억제해 LDL을 30~50% 감소시킵니다. 필요 시 에제티미브, PCSK9 억제제를 병용합니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">지속적 모니터링</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>위험도에 따라 목표 LDL(고위험군 70 mg/dL 미만, 중등도 100 mg/dL 미만, 저위험 130 mg/dL 미만)을 유지하며, 정기 혈액 검사로 모니터링합니다.</li>
              </ul>
             </div>
          </ContentCard>
        </div>

        {/* 식이 및 신체 활동 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">영양 및 생활습관</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">피해야 할 음식</h5>
                <ul className="space-y-3">
                  <FoodItem text="포화지방·트랜스지방 (삼겹살, 버터, 튀김, 마가린)" isBad={true} />
                  <FoodItem text="과도한 음주 (중성지방 급상승의 주원인)" isBad={true} />
                  <FoodItem text="단순당·액상과당 (탄산음료, 믹스커피, 디저트)" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-3">
                  <FoodItem text="수용성 식이섬유 풍부한 통곡물·귀리·콩" isBad={false} />
                  <FoodItem text="오메가-3 불포화지방산 (등푸른 생선, 견과류)" isBad={false} />
                  <FoodItem text="신선한 채소·과일·해조류" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 네이비) */}
          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[20px] font-bold mb-4">신체 활동 및 체중 관리<br/>(Physical Activity)</h4>
              <p className="text-[13px] text-white/70 leading-relaxed">
WHO 권고대로 주 150~300분 중강도 또는 75~150분 고강도 유산소 운동은 HDL을 높이고 TG를 낮춥니다. 체중 5~10% 감량만으로도 LDL·TG가 유의하게 개선됩니다.
              </p>
            </div>
            <div className="absolute right-[-5%] bottom-[-5%] opacity-10 text-blue-400">
               <Waves size={160} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 섹션 */}
        <SectionHeader icon={AlertCircle} title="임상 증상 및 징후" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title="초기 무증상 (Silent Phase)" desc="이상지질혈증 자체는 통증·외관 변화가 거의 없으며, 정기 혈액 검사(40세 이상 4년마다 국가검진)로만 발견됩니다." />
          <StepInfoCard number="02" title="경고 징후 (Warning Signs)" desc="중증의 경우 눈꺼풀 황색종, 각막환, 발뒤꿈치 건황색종이 나타날 수 있고, 협심증 양상의 가슴 답답함이 동반될 수 있습니다." />
          <StepInfoCard number="03" title="만성 합병증 (Chronic Complications)" desc="동맥경화 진행으로 심근경색·뇌경색·말초혈관질환이 발생하며, 중성지방 500 mg/dL 초과 시에는 급성 췌장염 위험도 급증합니다." />
          
          <CautionBox>
            고혈압·당뇨·비만 등 동반 질환을 함께 관리하고, 위험도에 따라 6개월~1년 간격으로 지질 검사 모니터링이 필요합니다.
          </CautionBox>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Cardiovascular Diseases (CVDs) Fact Sheet, 2023" },
            { source: "한국지질·동맥경화학회(KSoLA)", detail: "이상지질혈증 진료지침 제5판, 2022" },
            { source: "질병관리청(KDCA)", detail: "국민건강영양조사 2022, 만성질환 현황보고" },
            { source: "ESC/EAS", detail: "Guidelines for the Management of Dyslipidaemias, 2019/2023 update" },
          ]}
        />
      </main>
    </div>
  );
}