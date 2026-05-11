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
} from "../../components/report/DiseaseComponents";

const ObesityReportPage = () => {
  const riskFactors = [
    "고칼로리·고지방 식단 및 활동량 부족이 주된 원인",
    "체내 지방 과다 축적으로 인한 대사 기능 및 호르몬 불균형 초래",
    "식사 조절 및 꾸준한 운동 병행이 필수적",
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-10 pb-20">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4">비만(Obesity)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            단순한 체중의 증가를 넘어, 체내에 과도한 지방 조직이 축적되어 건강에
            악영향을 미치는 상태를 의미합니다.
            <br />
            만성 질환의 주요 원인이 되는 독립적인 질병으로 관리되어야 합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">비만이란?</h3>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-4">
                <p>
                  비만은 섭취하는 에너지가 소비하는 에너지보다 많아 여분의
                  에너지가 체지방의 형태로 몸에 과도하게 축적된 상태를
                  의미합니다. 단순히 체중이 많이 나가는 것을 넘어, 축적된
                  지방세포가 염증 물질을 분비하여 전신의 대사 기능을 저하시키고
                  신체적 건강을 위협하는 상태를 말합니다.
                </p>
                <p>
                  이는 단순한 미용적 문제를 넘어 대사 증후군의 핵심 원인이 되며,
                  적절한 관리가 이루어지지 않을 경우 당뇨, 고혈압, 심혈관
                  질환뿐만 아니라 근골격계 질환과 감정적인 영향까지 유발할 수
                  있습니다.
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
            desc="건강한 상태를 유지하기 위한 권장 범위"
            color="border-l-emerald-400"
          />
          <DiagnosisCard
            icon={TrendingDown}
            title="23.0 - 24.9"
            subTitle="비만 전단계 (과체중)"
            desc="생활 습관 교정이 강력히 권고되는 단계"
            color="border-l-sky-400"
          />
          <DiagnosisCard
            icon={TrendingUp}
            title="25.0 - 29.9"
            subTitle="1단계 비만"
            desc="고혈압, 당뇨 등의 위험이 유의하게 증가"
            color="border-l-orange-400"
          />
          <DiagnosisCard
            icon={AlertTriangle}
            title="30.0+"
            subTitle="2단계 이상 비만"
            desc="전문적인 의학적 치료와 집중 관리가 필수"
            color="border-l-rose-400"
          />
        </div>

        <SectionHeader icon={HeartPulse} title="관리 가이드라인" />

        <div className="mb-10">
          <div className="bg-[#032019] text-white p-4 rounded-t-xl flex items-center gap-3">
            <Stethoscope size={18} className="text-emerald-400" />
            <h3 className="font-bold text-[13px]">약물 치료 (Pharmacology)</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-2 gap-10 !p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                체중 감량 보조
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>식욕 억제제나 지방 흡수 저해제 등 전문 의약품 활용</li>
                <li>식사 조절과 운동의 효과를 극대화합니다.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                지속적 유지 관리
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>
                  감량 후 다시 체중이 증가하는 '요요 현상'을 방지하기 위해 사용
                </li>
                <li>
                  목표 체중에 도달한 후에도 꾸준한 상담과 생활 습관 모니터링을
                  병행합니다.
                </li>
              </ul>
            </div>
          </ContentCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col gap-6">
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                핵심당분의 위험성
              </span>
              탄산음료, 가당 주스 등에 함유된 단순당(액상과당)은 흡수가 매우
              빨라 간에 직접적인 부담을 주며 지방간의 주요 원인이 됩니다.
            </CautionBox>
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                야식과 대사 장애
              </span>
              밤늦게 먹는 음식은 에너지로 소모되지 못하고 그대로 지방으로
              축적되어 수면의 질을 저하시킵니다.
            </CautionBox>
          </div>
          <div className="md:col-span-2">
            <ContentCard className="flex gap-8 !p-8 h-full items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="text-emerald-500" size={22} />
                  <h3 className="text-lg font-bold text-gray-900">
                    신체 활동 요법 (Physical Activity)
                  </h3>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  주 150분 이상의 중강도 무산소 운동(빠르게 걷기, 수영 등)과 주
                  2~3회의 근력 운동을 병행하십시오.
                </p>
                <div className="flex gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg flex-1">
                    <h4 className="font-bold text-[13px] mb-1.5 text-gray-900">
                      무산소 운동
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      심폐지내력 향상 및 체지방 감소
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
              <div className="w-40 h-40 rounded-2xl overflow-hidden shrink-0">
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
                "에너지 섭취량 제한 (평소보다 500kcal 감량)",
                "단백질, 식이섬유 위주의 균형 잡힌 식단",
                "규칙적인 식사 시간 준수 및 야식 금지",
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
              * 무조건 굶는 것이 아니라, 질 좋은 소량 영양소를 섭취하는 것이
              중요합니다.
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
              desc="식사 일기 및 운동 기록을 통해 자신의 생활 패턴을 객관적으로 파악합니다."
            />
            <StepInfoCard
              number="02"
              title="스트레스 관리"
              desc="심리적 허기를 구분하고 스트레스로 인한 폭식을 방지하기 위한 취미 활동이나 명상을 이행합니다."
            />
            <StepInfoCard
              number="03"
              title="목표 설정"
              desc="실현 가능한 단기 목표를 설정하여 성취감을 통해 지속적인 동기를 부여합니다."
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
              title="생활 습관 개선만으로 조절이 어려운 고도 비만의 경우, 체중 대사 수술 등 의학적 개입을 고려할 수 있습니다."
            />
            <StepInfoCard
              number="02"
              title="동반 질환(고혈압, 당뇨 등)이 있는 경우 질환 치료와 비만 관리를 동시에 진행하는 통합 치료 계획을 수립합니다."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObesityReportPage;
