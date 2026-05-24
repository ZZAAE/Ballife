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
  RiskFactorCard,
  ReferenceFooter
} from '../../components/report/DiseaseComponents';

export default function OsteoporosisReportPage() {
  const riskFactors = [
    "고령 및 폐경 후 에스트로겐 감소 (국내 50세 이상 여성 약 38%가 골다공증)",
    "가족력 및 저체중 (BMI < 18.5)",
    "장기간의 스테로이드(글루코코르티코이드) 복용",
    "과도한 음주·흡연 및 신체 활동 부족"
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">골다공증(Osteoporosis)</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
WHO 정의에 따라 DXA 골밀도 T-score가 -2.5 이하일 때 진단되며, 골량 감소와 미세구조 파괴로 골절 위험이 증가하는 전신 골격계 질환입니다.
            고령화로 국내 50세 이상 인구의 골다공증 유병률이 빠르게 상승하고 있어 보건학적 관리가 매우 중요합니다.
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">골다공증이란?</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                골다공증은 골량 감소와 골조직의 미세구조 변화로 골강도가 약해진 상태입니다(WHO). 뼈는 평생 흡수와 형성을 반복하는데, 폐경·노화·특정 약물 등으로 균형이 무너지면 골밀도가 감소합니다. 질병관리청 자료에 따르면 국내 50세 이상 여성의 약 38%, 남성의 약 7%가 골다공증입니다.
                <br /><br />
                골다공증은 진행 중에는 거의 증상이 없으며, 결국 <span className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-200">가벼운 외상이나 일상 동작만으로도 척추·고관절·손목 골절이 발생하는 취약한 상태</span>로 이어집니다. 고관절 골절은 고령자에서 1년 내 사망률을 높이는 중대한 합병증입니다.
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader 
          icon={ClipboardCheck} 
          title="진단 기준 (WHO T-score)" 
          subTitle="이중에너지 X선 흡수계측법(DXA)으로 요추·대퇴골 골밀도를 측정한 T-score가 표준 진단 기준입니다(WHO)."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <TScoreCard label="정상" score="T-score ≥ -1.0" color="bg-emerald-500" desc="골밀도가 젊은 성인 평균과 비교해 안정적인 상태로, 예방적 생활습관 유지가 권장됩니다." />
          <TScoreCard label="골감소증" score="-2.5 < T < -1.0" color="bg-orange-400" desc="골량이 감소된 단계로, 골다공증 진행을 막기 위한 칼슘·비타민 D 섭취와 운동 강화가 필요합니다." />
          <TScoreCard label="골다공증" score="T-score ≤ -2.5" color="bg-rose-500" desc="WHO 진단 기준에 해당하며, 비스포스포네이트 등 적극적인 약물 치료가 필요한 단계입니다." />
        </div>

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title="관리 가이드라인" />
        
        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">약물 치료 (Pharmacology)</h3>
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
              <HabitItem icon="Ca" title="칼슘 섭취" desc="50세 이상 1일 800~1,000mg 권장 (우유, 멸치, 두부, 케일)" />
              <HabitItem icon="D3" title="비타민 D" desc="1일 800~1,000 IU 권장, 주 2~3회 햇볕 노출 병행" />
              <HabitItem icon="Ex" title="체중 부하 운동" desc="걷기·조깅·계단 오르기 주 3~5회, WHO 권고 주 150분 이상" />
            </div>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Home size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">낙상 예방 (Fall Prevention)</h4>
            </div>
            <p className="text-[12px] text-gray-500 mb-5 leading-relaxed">
고령자 골절의 대부분은 낙상이 원인이므로, 뼈 강화만큼 넘어지지 않는 환경 조성이 중요합니다(대한골대사학회 KSBMR).
            </p>
            <div className="bg-[#eff3f8] p-5 rounded-lg space-y-3">
              <CheckItem text="실내 조명 충분히 확보 및 바닥 장애물 제거" />
              <CheckItem text="욕실·계단에 미끄럼 방지 매트·손잡이 설치" />
              <CheckItem text="시력·청력 정기 점검 및 균형 감각 향상 운동(태극권 등)" />
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
손목·척추·고관절 부위 골절이 가장 흔하며, 특히 고관절 골절은 1년 내 사망률이 약 15~20%에 이를 정도로 치명적입니다.
              척추는 가벼운 외상이나 기침만으로도 압박 골절이 발생할 수 있습니다.
            </p>
          </ContentCard>
          <div className="space-y-4">
            <SmallInfoCard title="체형 변화" desc="척추 압박 골절이 누적되면 키가 3cm 이상 줄거나 등이 굽는 척추후만증이 나타날 수 있습니다." />
            <SmallInfoCard title="둔한 통증" desc="골다공증 자체는 무증상이지만, 미세 골절·압박 골절이 발생하면 만성 요통과 전신 통증이 동반될 수 있습니다." />
          </div>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Assessment of Fracture Risk and Application to Screening for Postmenopausal Osteoporosis" },
            { source: "대한골대사학회(KSBMR)", detail: "골다공증 진료지침 2022" },
            { source: "질병관리청(KDCA)", detail: "국민건강영양조사 2022, 골다공증 유병률" },
            { source: "International Osteoporosis Foundation (IOF)", detail: "Osteoporosis Compendium" },
          ]}
        />
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