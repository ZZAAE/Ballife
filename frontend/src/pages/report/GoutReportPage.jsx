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
  CautionBox,
  ReferenceFooter
} from '../../components/report/DiseaseComponents';

export default function GoutReportPage() {
  const riskFactors = [
    "남성 발병률이 여성보다 약 3~4배 높고 40~50대에서 급증",
    "급성 발작의 절반 이상이 엄지발가락 제1중족지절관절에서 시작",
    "식이 조절·체중 관리·요산저하제 복용 병행이 필수"
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">통풍(Gout)</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
혈청 요산 7.0 mg/dL 초과로 정의되는 고요산혈증으로 인해 관절에 요산 결정(MSU)이 침착되며 발생하는 만성 염증성 관절염입니다(ACR/대한류마티스학회 2020).
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">통풍이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                통풍은 퓨린 대사 이상으로 혈청 요산이 7.0 mg/dL을 초과(고요산혈증)하여 관절·연부조직에 단일나트륨요산(MSU) 결정이 침착되며 발생합니다.
                관절에 침착된 결정은 급격한 염증 반응을 유발하여 극심한 통증·부종·발적·열감을 동반하는 급성 발작을 일으킵니다. 국내 통풍 환자는 최근 10년간 약 2배 증가했습니다.
                <br /><br />
                통풍은 단순 관절 질환을 넘어 대사증후군·고혈압·만성신장병과 밀접하게 연관되며, 관리되지 않을 경우 만성 결절성 통풍, 신결석, 신부전 등으로 진행될 수 있습니다.
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
            title="혈청 요산 > 7.0 mg/dL"
            subTitle="고요산혈증 기준"
            desc="혈청 요산 7.0 mg/dL 초과를 고요산혈증으로 정의합니다(ACR/KCR 2020). 단, 급성 발작 중에는 정상 수치를 보이기도 하므로 시기에 따른 재검이 필요합니다."
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Layers} 
            title="관절액 MSU 결정 확인"
            subTitle="확진 골드 스탠다드"
            desc="관절천자로 채취한 활액에서 편광현미경상 음성 복굴절을 보이는 바늘 모양의 단일나트륨요산(MSU) 결정을 확인하면 확진됩니다."
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Search} 
            title="초음파·DECT 영상 진단"
            subTitle="비침습적 진단"
            desc="관절 초음파에서 'Double Contour' 사인을 확인하거나 이중에너지 CT(DECT)로 요산 결정 침착을 시각화하여 비침습적으로 진단할 수 있습니다."
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title="관리 가이드라인" />
        
        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">급성기 완화</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>NSAIDs, 콜히친(저용량), 스테로이드 제제를 단독 또는 병용하여 발작 24시간 이내에 염증을 억제합니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">장기적 예방(ULT)</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>요산저하제(알로푸리놀, 페북소스타트)를 꾸준히 복용해 혈청 요산을 6.0 mg/dL 미만(결절성 통풍은 5.0 mg/dL 미만)으로 유지합니다.</li>
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
                  <FoodItem text="맥주·증류주 등 알코올 (요산 생성 촉진)" isBad={true} />
                  <FoodItem text="고퓨린 육류 (붉은 고기, 베이컨)" isBad={true} />
                  <FoodItem text="동물 내장, 멸치, 정어리, 고등어 등 고퓨린 어류" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-3">
                  <FoodItem text="저지방 우유·요거트 등 유제품 (요산 배출 도움)" isBad={false} />
                  <FoodItem text="채소·체리 및 비타민 C 풍부 식품" isBad={false} />
                  <FoodItem text="통곡물 위주의 복합 탄수화물" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <GlassWater size={20} className="text-blue-300" />
              </div>
              <h4 className="text-[20px] font-bold mb-4">수분 섭취<br/>(Hydration)</h4>
              <p className="text-[13px] text-white/70 leading-relaxed">
매일 2L 이상의 물 섭취는 신장을 통한 요산 배설을 촉진하고 요산 결석 형성을 예방합니다. 가당 음료·과당 음료는 오히려 요산 생성을 증가시키므로 피해야 합니다.
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
          <StepInfoCard number="01" title="급성 통풍성 관절염" desc="주로 야간에 급격히 시작되며 관절이 붉게 붓고 극심한 통증이 발생합니다. 첫 발작의 50% 이상이 엄지발가락 제1중족지절관절에서 일어납니다." />
          <StepInfoCard number="02" title="간헐기 통풍" desc="발작 후 증상이 사라진 무증상 기간으로, 치료를 중단하기 쉬우나 요산 조절을 하지 않으면 재발 간격이 점점 짧아집니다." />
          <StepInfoCard number="03" title="만성 결절성 통풍" desc="수년간 방치 시 요산 결정이 결절(Tophus)을 형성하여 관절 파괴와 변형을 유발하고, 신결석·요산 신증으로 신기능 저하를 초래합니다." />
          <CautionBox>고혈압·당뇨·이상지질혈증·비만 등 대사증후군 동반 관리가 통풍 예후에 결정적이며, 정기적 요산·신기능 검사가 필요합니다.</CautionBox>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "대한류마티스학회(KCR)", detail: "통풍 진료지침 2020" },
            { source: "American College of Rheumatology (ACR)", detail: "Guideline for the Management of Gout, 2020" },
            { source: "질병관리청(KDCA)", detail: "만성질환 통계 (통풍 유병 추이)" },
            { source: "EULAR", detail: "Recommendations for the Management of Gout, 2016 (updated)" },
          ]}
        />
      </main>
    </div>
  );
}