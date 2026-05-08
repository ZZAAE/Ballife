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
  CautionBox 
} from '../../components/report/DiseaseComponents';

export default function DiabetesReportPage() {
  const riskFactors = [
    "복부 비만 및 인슐린 저항성",
    "서구화된 식습관 및 활동량 부족",
    "연령 증가 및 동반 질환"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans text-gray-900">
      <main className="max-w-7xl mx-auto p-10">
        
        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">당뇨병(Diabetes Mellitus)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            당뇨병은 인슐린 분비량이 부족하거나 정상적인 기능이 이루어지지 않아 혈중 포도당 농도가 높아지는 질환입니다.
            이는 신체 각 기관의 손상과 합병증을 유발할 수 있는 만성 대사 질환으로, 체계적인 혈당 관리와 생활 습관 교정이 필수적입니다.
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">당뇨병이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                당뇨병은 단일 질환이 아니라 고혈당이라는 공통된 특징을 공유하는 대사 장애 그룹입니다. 혈당의 만성적인 상승은 
                다양한 장기, 특히 눈, 신장, 신경, 심장 및 혈관의 장기적인 손상, 기능 장애 및 부전과 관련이 있습니다.
                <br /><br />
                정상적인 상태에서 혈당 수치는 췌장 소도 세포에서 생성되는 호르몬인 인슐린에 의해 엄격하게 조절됩니다. 
                당뇨병에서는 이러한 조절 메커니즘이 실패하여 대사 이상을 초래하며, 치료하지 않고 방치할 경우 심각한 건강 합병증으로 이어집니다.
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
            title="공복 혈당 126 mg/dL 이상" 
            subTitle="핵심 혈당 지표" 
            desc="8시간 이상 공복 후 측정한 혈당 수치입니다. 126 이상 시 당뇨로 진단하며, 100~125는 당뇨 전단계를 의미합니다." 
            color="border-emerald-500"
          />
          <DiagnosisCard 
            icon={Search} 
            title="당화혈색소(HbA1c) 6.5% 이상" 
            subTitle="장기 혈당 분석" 
            desc="지난 2~3개월간의 평균 혈당 상태를 나타내는 가장 중요한 지표입니다. 6.5% 이상일 때 당뇨로 진단합니다." 
            color="border-blue-500"
          />
          <DiagnosisCard 
            icon={Calendar} 
            title="경구 당부하 검사 및 합병증 검사" 
            subTitle="임상 진단 및 합병증 확인" 
            desc="안과 검사, 소변 검사(미세 단백뇨) 등을 통해 당뇨로 인한 눈, 신장, 신경 손상 여부를 확인하여 종합 진단합니다." 
            color="border-emerald-300"
          />
        </div>

        {/* 당뇨의 종류 (검정 띠 섹션) */}
        <SectionHeader title="당뇨의 종류" />
        <div className="mb-10">
          <div className="bg-[#051b15] text-white p-4 rounded-t-xl flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-bold text-[13px]">당뇨의 종류</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">제1형 당뇨병</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 인슐린 분비가 절대적으로 부족한 경우입니다. 일반적으로 췌장 베타 세포의 자기면역 파괴로 인해 발생하며, 주로 소아기나 청소년기에 나타납니다.
               </p>
               <ul className="text-[12px] text-emerald-600 font-bold list-disc ml-4">
                 <li>외부 인슐린 주입 필수</li>
               </ul>
             </div>
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">제2형 당뇨병</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 인슐린 저항성과 상대적인 인슐린 분비 결함이 결합된 가장 흔한 형태입니다. 비만 및 잘못된 생활 방식과 강한 상관관계가 있습니다.
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
                  <FoodItem text="단순당류 (설탕, 탄산음료, 흰 빵, 떡)" isBad={true} />
                  <FoodItem text="과도한 과일 섭취 (당분 과다 유발)" isBad={true} />
                  <FoodItem text="가공식품 및 트랜스지방" isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">권장 사항</h5>
                <ul className="space-y-2">
                  <FoodItem text="식이섬유가 풍부한 통곡물 (현미, 잡곡)" isBad={false} />
                  <FoodItem text="신선한 채소 및 단백질 위주 식단" isBad={false} />
                  <FoodItem text="불포화지방산 (견과류, 생선)" isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 블루) */}
          <div className="bg-[#212b36] rounded-xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-4">규칙적인 신체 활동<br/>(Physical Activity)</h4>
              <p className="text-[12px] text-gray-300 leading-relaxed mb-4">
                매일 식후 30분~1시간 뒤 유산소 운동을 하는 것이 혈당 피크를 막는 데 효과적입니다. 
                무리한 운동보다는 꾸준한 걷기가 권장됩니다.
              </p>
            </div>
            <Droplets className="absolute right-[-20px] bottom-[-20px] text-white opacity-5 w-40 h-40" />
          </div>
        </div>

        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StepInfoCard 
              number="01" 
              title="삼다(三多) 증상" 
              desc="다음(多飮), 다뇨(多尿), 다식(多食)이 대표적입니다. 혈당이 높아지면서 소변으로 당이 빠져나갈 때 수분을 함께 끌고 나가기 때문입니다." 
            />
            <StepInfoCard 
              number="02" 
              title="원인 모를 체중 감소" 
              desc="인슐린 기능 저하로 포도당을 에너지원으로 쓰지 못하게 되면, 우리 몸은 저장된 지방과 단백질을 태워 에너지를 만들면서 체중이 줄어듭니다." 
            />
            <StepInfoCard 
              number="03" 
              title="만성 피로 및 상처 회복 저하" 
              desc="에너지 대사가 효율적이지 못해 늘 피곤함을 느끼며, 고혈당 상태에서는 혈액 순환과 면역 기능이 떨어져 상처가 잘 낫지 않습니다." 
            />
            
            <CautionBox>
              초기 당뇨병은 증상이 없는 경우가 많으므로 정기적인 혈당 검사가 무엇보다 중요합니다.
            </CautionBox>
          </div>
      </main>
    </div>
  );
}