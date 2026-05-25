import React from 'react';
import { 
  ClipboardCheck, 
  ShieldPlus, 
  AlertTriangle, 
  Utensils, 
  Activity,
  Droplets,
  Search,
  Calendar,
  Info
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

export default function DiabetesReportPage() {
  const riskFactors = [
    "복부 비만 및 인슐린 저항성 (한국인 제2형 당뇨의 핵심 위험요인)",
    "신체활동 부족과 정제 탄수화물 위주의 식습관",
    "가족력, 40세 이상 연령, 고혈압·이상지질혈증 동반"
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">당뇨병(Diabetes Mellitus)</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            당뇨병은 인슐린 분비 결핍 또는 인슐린 저항성에 의해 혈당이 만성적으로 상승하는 대사 질환입니다(WHO).
            대한당뇨병학회 2023 진료지침에 따라 공복혈당, HbA1c, 식후혈당 기준으로 진단하며, 체계적인 혈당 관리와 생활 습관 교정이 합병증 예방의 핵심입니다.
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">당뇨병이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                당뇨병은 고혈당을 공통된 특징으로 하는 만성 대사 질환군입니다(WHO). 만성적인 혈당 상승은 망막·신장·신경 등
                미세혈관 합병증과 심근경색·뇌졸중 같은 대혈관 합병증을 유발합니다. 질병관리청 국민건강영양조사(2022)에 따르면 국내 30세 이상 성인의 약 14%가 당뇨병을 가지고 있으며, 당뇨 전단계까지 포함하면 절반 가까이에 이릅니다.
                <br /><br />
                정상적으로 혈당은 췌장 베타세포에서 분비되는 인슐린에 의해 조절됩니다. 당뇨병에서는 인슐린 분비 부족 또는 인슐린 저항성으로 이 조절 기전이 무너지며,
                치료 없이 방치할 경우 심혈관 질환·신부전·실명 등 중대한 합병증으로 이어집니다.
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader 
          icon={ClipboardCheck} 
          title="진단 기준 (Diagnosis)" 
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DiagnosisCard 
            icon={Droplets} 
            title="공복혈당 126 mg/dL 이상"
            subTitle="대한당뇨병학회 2023 기준"
            desc="8시간 이상 공복 후 혈당이 126 mg/dL 이상이면 당뇨, 100~125 mg/dL이면 공복혈당장애(당뇨 전단계)에 해당합니다. 식후 2시간 혈당 200 mg/dL 이상도 진단 기준입니다."
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Search} 
            title="당화혈색소(HbA1c) 6.5% 이상"
            subTitle="장기 혈당 지표"
            desc="지난 2~3개월간의 평균 혈당을 반영합니다. HbA1c 6.5% 이상이면 당뇨, 5.7~6.4%는 당뇨 전단계로 분류됩니다(WHO·대한당뇨병학회)."
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Calendar} 
            title="75g 경구당부하검사(OGTT)"
            subTitle="확진 및 합병증 평가"
            desc="75g 포도당 섭취 2시간 후 혈당 200 mg/dL 이상이면 당뇨로 진단합니다. 진단 후 안저·미세알부민뇨·신경 검사를 통해 표적 장기 합병증을 평가합니다."
            color="border-emerald-300"
          />
        </div>

        {/* 당뇨의 종류 (검정 띠 섹션) */}
        <SectionHeader title="당뇨의 종류" />
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">당뇨의 종류</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">제1형 당뇨병</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 췌장 베타세포의 자가면역성 파괴로 인슐린 분비가 절대적으로 결핍된 형태입니다. 주로 소아·청소년기에 발병하며, 외부 인슐린 투여 없이는 생존이 어렵습니다.
               </p>
               <ul className="text-[12px] text-emerald-600 font-bold list-disc ml-4">
                 <li>외부 인슐린 주입 필수</li>
               </ul>
             </div>
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">제2형 당뇨병</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 한국인 당뇨 환자의 90% 이상을 차지하는 가장 흔한 형태로, 인슐린 저항성과 상대적 인슐린 분비 부족이 결합된 상태입니다. 비만·운동 부족·노화와 강한 연관이 있습니다.
               </p>
               <ul className="text-[12px] text-emerald-600 font-bold list-disc ml-4">
                 <li>대사 진행성 질환</li>
               </ul>
             </div>
             </ContentCard>
           </div>
          
        

        {/* 영양 및 신체 활동 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Utensils size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">영양 및 생활습관</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">피해야 할 음식</h5>
                <ul className="space-y-2">
                  <FoodItem text="단순당·정제 탄수화물 (설탕, 탄산음료, 흰쌀밥, 떡)" isBad={true} />
                  <FoodItem text="가당 음료 및 과량의 과일주스" isBad={true} />
                  <FoodItem text="포화·트랜스지방 함유 가공식품" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-2">
                  <FoodItem text="식이섬유 풍부한 통곡물 (현미, 잡곡, 귀리)" isBad={false} />
                  <FoodItem text="신선한 채소 및 양질의 단백질 (콩, 두부, 생선)" isBad={false} />
                  <FoodItem text="불포화지방산 (견과류, 등푸른 생선, 올리브유)" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 블루) */}
          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[20px] font-bold mb-4">규칙적인 신체 활동<br/>(Physical Activity)</h4>
              <p className="text-[13px] text-white/70 leading-relaxed mb-4">
                WHO 권고에 따라 주 150~300분의 중강도 유산소 운동과 주 2회 이상의 근력 운동을 권장합니다.
                특히 식후 30분~1시간 뒤 걷기는 식후 혈당 상승을 효과적으로 억제합니다.
              </p>
            </div>
            <Droplets className="absolute right-[-20px] bottom-[-20px] text-white opacity-5 w-40 h-40" />
          </div>
        </div>

        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              초기 당뇨병은 무증상인 경우가 많아, 질병관리청은 40세 이상 또는 위험요인 보유자에게 매년 공복혈당·HbA1c 정기 검사를 권고합니다.
            </CautionBox>
          </div>

          <ReferenceFooter
            lastUpdated="2026.05"
            items={[
              { source: "WHO (World Health Organization)", detail: "Diabetes Fact Sheet, 2024" },
              { source: "대한당뇨병학회", detail: "당뇨병 진료지침 2023" },
              { source: "질병관리청(KDCA)", detail: "국민건강영양조사 2022, 만성질환 통계" },
              { source: "American Diabetes Association", detail: "Standards of Care in Diabetes, 2024" },
            ]}
          />
      </main>
    </div>
  );
}