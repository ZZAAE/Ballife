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
  CautionBox 
} from '../../components/report/DiseaseComponents';

export default function DyslipidemiaReportPage() {
  const riskFactors = [
    "고열량·고지방 식단 및 운동 부족으로 인한 발병률 증가",
    "자각 증상이 없어 장기간 방치 시 혈관 폐색(동맥경화)으로 이어짐",
    "식이 요법, 체중 관리 및 전문적인 약물 치료의 병행이 필수적"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans text-gray-900">
      <main className="max-w-7xl mx-auto p-10">
        
        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">고지혈증 (Hyperlipidemia)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            혈중 지질(콜레스테롤 및 중성지방) 수치가 비정상적으로 높아지거나 낮아져 혈관 벽에 찌꺼기가 쌓이면서 발생하는 만성 대사성 질환의 진단 및 관리 지침.
          </p>
        </div>

        {/* 개요 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">고지혈증이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                고지혈증은 혈액 내에 콜레스테롤이나 중성지방과 같은 지방 성분이 정상 범위보다 높아지는 상태에 의해 유발됩니다. 
                과도한 지방 수치로 인해 혈관 내벽에 찌꺼기가 쌓이고 혈관이 좁아지거나 딱딱해지는 동맥경화가 진행되며, 별다른 전조 증상 없이 혈관을 막아 심근경색이나 뇌졸중과 같은 치명적인 합병증을 갑작스럽게 일으킬 수 있습니다.
                <br /><br />
                이는 단순한 혈액 수치의 상승을 넘어 대사 증후군과 밀접한 연관이 있으며, 적절한 관리가 이루어지지 않을 경우 혈관 내벽에 플라크(찌꺼기)가 쌓이는 동맥경화를 가속화하고, 심장 근육이 손상되는 심근경색이나 전신 혈류 장애 등 치명적인 합병증을 유발할 수 있습니다.
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
            title="LDL 콜레스테롤 160 mg/dL 이상" 
            subTitle="LDL 콜레스테롤 160 mg/dL 이상" 
            desc="일반적인 진단 기준은 LDL 160, 총 콜레스테롤 240, 중성지방 200mg/dL 이상입니다. 단, 기저질환에 따라 목표 수치는 달라질 수 있습니다." 
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Activity} 
            title="공복 상태의 혈액 검사" 
            subTitle="진단 보조 분석" 
            desc="수치의 정확성을 위해 최소 9~12시간 공복 후 채혈합니다. 일시적인 수치 변화를 확인하기 위해 필요시 재검사를 통해 판정합니다." 
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Zap} 
            title="경동맥 초음파 및 혈관 검사" 
            subTitle="임상 진단" 
            desc="경동맥 초음파나 CT 등을 통해 혈관 내벽에 찌꺼기가 쌓여 혈관이 좁아졌는지(동맥경화) 확인하고, 심혈관 질환의 발생 위험도를 종합 평가합니다." 
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 섹션 */}
        <SectionHeader icon={ShieldCheck} title="관리 가이드라인" />
        
        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#032019] text-white p-4 rounded-t-xl flex items-center gap-3">
            <HeartPulse size={18} className="text-emerald-400" />
            <h3 className="font-bold text-[13px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
             <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">지질 수치 강하</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>스타틴(Statin) 계열 약물은 주로 사용되며 간에서의 콜레스테롤 합성을 억제하고 혈중 LDL 수치를 효과적으로 낮춥니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">지속적 모니터링</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>수치가 개선되더라도 임의로 중단하지 말고, 의사의 처방에 따라 복용하며 정기적인 혈액 검사를 통해 목표 수치(예: LDL 100~130 mg/dL 미만)를 유지합니다.</li>
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
                  <FoodItem text="포화지방 및 트랜스지방 (삼겹살, 버터, 튀김)" isBad={true} />
                  <FoodItem text="과도한 음주 (중성지방 상승의 주원인)" isBad={true} />
                  <FoodItem text="단순당 및 액상과당 (믹스커피, 탄산음료)" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-3">
                  <FoodItem text="식이섬유가 풍부한 통곡물" isBad={false} />
                  <FoodItem text="불포화지방산 (등푸른 생선, 견과류)" isBad={false} />
                  <FoodItem text="신선한 채소 및 해조류" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 네이비) */}
          <div className="bg-[#1e293b] rounded-xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-4">신체 활동 및 체중 관리<br/>(Physical Activity)</h4>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                매일 30분 이상의 유산소 운동은 '좋은 콜레스테롤(HDL)'을 높이고 중성지방을 낮추는 데 필수적입니다. 적정 체중 유지는 혈관 내 지방 축적을 막는 가장 핵심적인 방법입니다.
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
          <StepInfoCard number="01" title="초기 무증상 (Silent Phase)" desc="고지혈증 자체는 통증이나 외관상의 변화가 전혀 없습니다. 혈액이 끈적해지고 혈관이 좁아지는 과정이 소리 없이 진행되므로 검진을 통해서만 발견 가능합니다." />
          <StepInfoCard number="02" title="혈관 경화 징후 (Vascular Hardening)" desc="혈중 지질이 과도하면 눈꺼풀 주위에 노란색 반점(황색종)이 생기거나, 혈액 순환 저하로 인해 손발 저림, 가벼운 어지러움 등의 증상이 간헐적으로 나타날 수 있습니다." />
          <StepInfoCard number="03" title="만성 합병증 (Chronic Complications)" desc="수년간 방치 시 혈관 벽에 플라크가 쌓이는 동맥경화가 발생하며, 이는 뇌경색이나 심근경색증, 말초혈관 질환 등으로 이어집니다. 특히 췌장염(중성지방 과다 시) 등의 위험도 높아집니다." />
          
          <CautionBox>
            고혈압, 당뇨, 비만과 같은 동반 질환 관리가 합병증 위험도를 결정하는 핵심 요소입니다.
          </CautionBox>
        </div>
      </main>
    </div>
  );
}