import React from 'react';
import { 
  ClipboardCheck, 
  ShieldPlus, 
  AlertTriangle, 
  Utensils, 
  Home, 
  Activity,
  Check
} from "lucide-react";
import { 
  SectionHeader, 
  ContentCard, 
  RiskFactorCard 
} from '../../components/report/DiseaseComponents';

export default function OsteoporosisReportPage() {
  const riskFactors = [
    "고령 및 폐경 후 에스트로겐 감소",
    "가족력 및 저체중 (BMI < 18.5)",
    "장기간의 스테로이드(글루코코르티코이드) 복용",
    "과도한 음주 및 흡연, 활동량 부족"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans text-gray-900">
      <main className="max-w-7xl mx-auto p-10">
        
        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">골다공증(Osteoporosis)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            골다공증은 골밀도의 감소와 미세구조의 파괴로 인해 뼈가 약해지고 골절 위험이 증가하는 전신 골격계 질환입니다.
            특히 고령화 사회에서 보건학적으로 매우 중요한 질환으로 간주됩니다.
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">골다공증이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                골다공증은 말 그대로 '뼈에 구멍이 많이 생긴 상태'를 뜻합니다. 우리 몸의 뼈는 일생 동안 낡은 뼈는 파괴되고 새로운 뼈가 생성되는 과정을 반복합니다.
                <br /><br />
                하지만 나이가 들거나 특정 원인으로 인해 뼈의 파괴 속도가 생성 속도보다 빨라지면, 뼈 안의 골밀도가 급격히 낮아지게 됩니다. 
                이는 결국 <span className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-200">뼈를 푸석푸석하게 만들어 작은 충격에도 쉽게 부러질 수 있는 취약한 상태</span>로 변화시킵니다.
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader 
          icon={ClipboardCheck} 
          title="진단 기준 (WHO T-score)" 
          subTitle="이중에너지 방사선 흡수계측법(DXA)을 통한 골밀도 측정이 표준 진단 방법입니다." 
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <TScoreCard label="정상" score="T-score ≥ -1.0" color="bg-emerald-500" desc="골밀도가 젊은 성인의 평균치와 비교하여 안정적인 상태입니다." />
          <TScoreCard label="골감소증" score="-1.0 > T > -2.5" color="bg-orange-400" desc="골밀도가 낮아진 상태로, 골다공증으로의 이행 예방이 필요합니다." />
          <TScoreCard label="골다공증" score="T-score ≤ -2.5" color="bg-rose-500" desc="뼈의 강도가 현저히 약해져 적극적인 약물 치료가 요구되는 단계입니다." />
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
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">골흡수 억제제</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>비스포스포네이트 (Bisphosphonates) - 가장 보편적</li>
                <li>데노수맙 (Denosumab) - 6개월 1회 주사제</li>
                <li>선택적 에스트로겐 수용체 조절제 (SERM)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">골형성 촉진제</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>테리파라타이드 (Teriparatide)</li>
                <li>로모소주맙 (Romosozumab) - 최근 도입된 강력한 약제</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 2. 생활습관 및 낙상 예방 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Utensils size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">영양 및 생활습관</h4>
            </div>
            <div className="space-y-5">
              <HabitItem icon="Ca" title="칼슘 섭취" desc="1일 800~1,000mg 권장 (우유, 멸치, 두부 등)" />
              <HabitItem icon="D3" title="비타민 D" desc="1일 800IU 이상 권장, 적절한 일조량 확보" />
              <HabitItem icon="Ex" title="체중 부하 운동" desc="걷기, 조깅, 계단 오르기 등 주 3~5회 실시" />
            </div>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Home size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">낙상 예방 (Fall Prevention)</h4>
            </div>
            <p className="text-[12px] text-gray-500 mb-5 leading-relaxed">
              골절을 막기 위해서는 뼈를 강화하는 것만큼 넘어지지 않는 환경 조성이 필수적입니다.
            </p>
            <div className="bg-[#eff3f8] p-5 rounded-lg space-y-3">
              <CheckItem text="집안 내 조명 밝게 유지 및 장애물 제거" />
              <CheckItem text="욕실 바닥 미끄럼 방지 매트 설치" />
              <CheckItem text="시력 교정 및 균형 감각 유지 운동" />
            </div>
          </ContentCard>
        </div>

        {/* 임상 증상 */}
        <SectionHeader icon={AlertTriangle} title="임상 증상 및 징후" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContentCard className="flex flex-col justify-center">
            <div className="mb-4 bg-gray-50 w-10 h-10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-gray-800" size={20} />
            </div>
            <h4 className="font-extrabold text-[15px] mb-3">골절 위험 (Fracture Risk)</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              손목, 척추, 고관절 부위의 골절이 가장 흔하며, 특히 고관절 골절은 노인에게서 높은 사망률과 연관됩니다.
              가벼운 외상이나 기침만으로도 골절이 발생할 수 있습니다.
            </p>
          </ContentCard>
          <div className="space-y-4">
            <SmallInfoCard title="체형 변화" desc="척추 압박 골절로 인해 키가 줄어들거나 등이 굽는 현상이 나타납니다." />
            <SmallInfoCard title="둔한 통증" desc="골다공증 자체는 무증상이지만, 미세 골절 발생 시 요통이나 전신 통증이 동반될 수 있습니다." />
          </div>
        </div>
      </main>
    </div>
  );
}


function TScoreCard({ label, score, color, desc }) {
  return (
    <ContentCard className="relative pt-8 overflow-hidden border-none shadow-sm">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`} />
      <span className="text-[12px] font-bold text-gray-400">{label}</span>
      <h4 className={`text-2xl font-black mt-1 mb-4 ${color.replace('bg-', 'text-')}`}>{score}</h4>
      <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
    </ContentCard>
  );
}

function HabitItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0 border border-emerald-100">
        {icon}
      </div>
      <div>
        <h5 className="font-bold text-[13px] mb-0.5">{title}</h5>
        <p className="text-[12px] text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-gray-600 font-medium">
      <Check size={14} className="text-gray-400" strokeWidth={3} /> {text}
    </div>
  );
}

function SmallInfoCard({ title, desc }) {
  return (
    <ContentCard className="py-5 flex items-center gap-5 border-none shadow-sm">
      <div className="bg-gray-50 p-3 rounded-xl">
        <Activity size={18} className="text-gray-400" />
      </div>
      <div>
        <h5 className="font-extrabold text-[13px] mb-1">{title}</h5>
        <p className="text-[11px] text-gray-400 leading-snug">{desc}</p>
      </div>
    </ContentCard>
  );
}