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

export default function HypertensionReportPage() {
  const riskFactors = [
    "남녀 모두 연령이 증가함에 따라 고혈압의 유병률 상승",
    "초기 증상이 없게 발견 시점에 비해 장기 손상이 진행될 수 있음",
    "식습관 개선과 약물 치료의 병행이 필수적"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-7xl mx-auto p-10">
        
        {/* 타이틀 섹션 - 이미지 텍스트 그대로 적용 */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">고혈압(Hypertension)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            혈관 벽에 가해지는 혈액의 압력이 정상 범위보다 높아지는 상태로, 지속적인 관리와 약물 치료가 필수적입니다.
            초기 증상이 없어 '침묵의 살인자'라 불리며, 합병증 예방을 위한 체계적인 혈압 관리가 중요합니다.
          </p>
        </div>

        {/* 개요 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-rose-500">
              <h3 className="text-lg font-extrabold mb-5">고혈압이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                고혈압은 혈관 벽에 가해지는 혈액의 압력이 정상 범위보다 높아지는 상태에 의해 유발됩니다.
                높아진 혈압으로 인해 혈관 내벽이 손상되고 탄력을 잃으면서, 혈액 내 산소 공급량이 부족해지거나 뇌 등 주요 장기에 부담을 주어 심혈관 질환, 뇌졸중과 같은 치명적인 합병증을 갑작스럽게 일으킬 수 있습니다.
                <br /><br />
                이는 단순한 혈압 상승을 넘어 대사 증후군과 밀접한 연관이 있으며, 적절한 관리가 이루어지지 않을 경우 동맥경화와 같은 혈관 질환을 초래하고 신부전이나 소변량 등 전신에 걸친 치명적인 합병증을 유발할 수 있습니다.
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <DiagnosisCard 
            icon={Target} 
            title="수축기 140 / 이완기 90 mmHg" 
            subTitle="혈압 수치 기준" 
            desc="진료실 혈압 기준 140/90 mmHg 이상일 때 고혈압으로 진단합니다. 다만, 백의 고혈압 가능성을 배제하기 위해 반복 측정이 권고됩니다." 
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Activity} 
            title="가정 혈압 및 활동 혈압 측정" 
            subTitle="진단 보조 분석" 
            desc="진단을 위한 중요한 수단입니다. 가장 내 안의 측정이나 24시간 활동 혈압 모니터링을 통해 평소 혈압의 평균치를 확인합니다." 
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Zap} 
            title="합병증 및 표적 장기 검사" 
            subTitle="임상 진단" 
            desc="심전도, 안저 검사, 소변 검사 등을 통해 고혈압으로 인한 심장, 뇌, 신장 등의 조기 손상 여부를 가늠하여 종합적으로 진단합니다." 
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
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">초기 혈압 조절</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>TIA제, ACE 억제제, ARB(안지오텐신 수용체 차단제), 칼슘 채널 차단제 등을 사용하여 목표 혈압까지 안전하게 낮춥니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">장기적 유지</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>주기적인 수치 파악과 규칙적인 운동, 그리고 처방받은 대로의 약물을 꾸준히 복용하며 140/90 mmHg 이하로 혈압 수치를 상시 유지합니다.</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 식이 및 생활습관 강조 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">영양 및 생활습관</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">자제해야 할 음식</h5>
                <ul className="space-y-3">
                  <FoodItem text="고나트륨 식품 (면 곡물, 젓갈, 가공육)" isBad={true} />
                  <FoodItem text="과도한 음주 (혈압 상승의 직접적 원인)" isBad={true} />
                  <FoodItem text="고포화지방 및 단순당" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-3">
                  <FoodItem text="저염식 및 신선한 채소/과일" isBad={false} />
                  <FoodItem text="칼륨 섭취 (나트륨 배출 유도)" isBad={false} />
                  <FoodItem text="통곡물 및 저지방 단백질" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 체중 관리 강조 카드 */}
          <div className="bg-[#1e293b] rounded-xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-4">체중 관리 및 유산소 운동<br/>(Lifestyle Changes)</h4>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                매일 30분 이상의 유산소 운동과 적정 체중 유지는 혈압을 낮추는 데 필수적입니다. 특히 소금 섭취를 하루 6g 미만으로 제한하는 것이 중요합니다.
              </p>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] opacity-5 text-blue-400">
               <Waves size={180} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 섹션 */}
        <SectionHeader icon={AlertCircle} title="임상 증상 및 징후" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title="초기 무증상 (Silent Phase)" desc="대부분의 환자는 혈압이 높아도 아무런 증상을 느끼지 못합니다. 이 때문에 '침묵의 살인자'라고 불리며, 정기적인 측정이 없으면 발견되지 않습니다." />
          <StepInfoCard number="02" title="경고 징후 (Warning Signs)" desc="혈압이 갑자기 오를 경우 두통(특히 뒷머리), 어지러움, 피로감, 코피, 시력 저하 등이 나타날 수 있습니다. 이는 몸이 보내는 긴급 신호일 수 있습니다." />
          <StepInfoCard number="03" title="만성 합병증 (Chronic Complications)" desc="수년간 방치 시 높은 압력으로 혈관이 딱딱해지며 뇌졸중, 심근경색, 신부전, 망막 손상 등을 유발합니다. 특히 신장 여과 기능의 저하와 단백뇨가 비례할 수 있습니다." />
          
          <CautionBox>
            주요 당뇨, 고지혈증, 비만과 같은 동반 질환 관리가 병행되어야 종합적입니다.
          </CautionBox>
        </div>
      </main>
    </div>
  );
}