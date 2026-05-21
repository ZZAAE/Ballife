import React from 'react';
import { 
  ClipboardCheck, 
  ShieldPlus, 
  AlertTriangle, 
  GlassWater,
  Activity,
  Search,
  Layers,
  Thermometer
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

export default function GoutReportPage() {
  const riskFactors = [
    "남성 발병률이 여성보다 약 3~4배 높음",
    "급성 발작의 50% 이상이 엄지발가락에서 시작",
    "식습관 개선과 약물 치료의 병행이 필수적"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-7xl mx-auto p-10">
        
        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">통풍(Gout)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            고요산혈증으로 인해 관절 내 요산 결정이 침착되어 발생하는 만성 염증성 관절염의 진단 및 관리 지침.
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">통풍이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                통풍은 혈액 내 요산(Uric acid) 수치가 비정상적으로 높아지는 고요산혈증에 의해 유발됩니다. 
                생성된 요산 결정이 관절 조직에 축적되면서 갑작스럽고 극심한 통증, 부종, 열감을 동반하는 발작을 일으킵니다.
                <br /><br />
                이는 단순한 관절 질환을 넘어 대사 증후군과 밀접한 연관이 있으며, 적절한 관리가 이루어지지 않을 경우 
                만성 관절 변형과 신장 합병증을 유발할 수 있습니다.
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader icon={ClipboardCheck} title="진단 기준 (Diagnosis)" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <DiagnosisCard 
            icon={Thermometer} 
            title="> 7.0 mg/dL" 
            subTitle="혈중 요산 농도" 
            desc="남성 기준 7.0 mg/dL 이상의 수치는 고요산혈증을 시사합니다. 다만 발작 시기에는 정상 수치를 보일 수 있습니다." 
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Layers} 
            title="MSU Crystals" 
            subTitle="관절액 분석" 
            desc="확진을 위한 골드 스탠다드입니다. 편광현미경 상에서 바늘 모양의 요산 결정을 확인하여 진단합니다." 
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Search} 
            title="Dual-Energy CT" 
            subTitle="영상 진단" 
            desc="최근 도입된 'Double Contour' 사인이나 DECT를 통한 요산 결정의 부위와 가시화로 비침습적 진단이 가능합니다." 
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title="관리 가이드라인" />
        
        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#032019] text-white p-4 rounded-t-xl flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-bold text-[13px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">급성기 완화</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>NSAIDs(비스테로이드 항염제), 콜히친, 스테로이드 제제를 사용하여 염증을 빠르게 억제합니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">장기적 예방(ULT)</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>요산 저하제인 알로푸리놀, 페북소스타트를 꾸준히 복용하여 혈중 요산을 6.0 mg/dL 이하로 유지합니다.</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 영양 및 수분 섭취 */}
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
                  <FoodItem text="맥주 및 알코올 (요산 생성 촉진)" isBad={true} />
                  <FoodItem text="붉은 육류 (소고기, 돼지고기 등)" isBad={true} />
                  <FoodItem text="동물 내장류 및 등푸른 생선" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-3">
                  <FoodItem text="저지방 유제품 섭취" isBad={false} />
                  <FoodItem text="충분한 채소 및 비타민 C" isBad={false} />
                  <FoodItem text="복합 탄수화물 위주의 식단" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          <div className="bg-[#1a212f] rounded-xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
            <div className="relative z-10">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <GlassWater size={20} className="text-blue-300" />
              </div>
              <h4 className="text-xl font-bold mb-4">수분 섭취<br/>(Hydration)</h4>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                매일 2리터 이상의 충분한 물을 마시는 것은 요산 결정의 배출을 돕고 신장 결석 형성을 방지하는 데 필수적입니다.
              </p>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] opacity-5">
               <GlassWater size={180} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 */}
        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title="급성 통풍성 관절염" desc="주로 야간에 급격히 시작되며, 관절이 붉게 붓고 극심한 통증을 느낍니다. 첫 증상의 대다수는 엄지발가락에서 발생합니다." />
          <StepInfoCard number="02" title="간헐기 통풍" desc="발작 후 증상이 완전히 사라진 기간입니다. 완치되었다고 착각하기 쉬우나, 요산 조절이 안 되면 재발 간격이 짧아집니다." />
          <StepInfoCard number="03" title="만성 결절성 통풍" desc="수년간 방치 시 요산 결정이 혹(Tophus)을 형성합니다. 관절 파괴와 변형을 유발하며 신장 기능 저하의 원인이 됩니다." />
          <CautionBox>고혈압, 당뇨병, 비만과 같은 동반 질환 관리가 통풍 예후에 결정적입니다.</CautionBox>
        </div>
      </main>
    </div>
  );
}