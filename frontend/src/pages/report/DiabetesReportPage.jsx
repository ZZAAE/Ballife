import React from 'react';
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const riskFactors = [
    t('diabetesReportPage.riskFactors.0'),
    t('diabetesReportPage.riskFactors.1'),
    t('diabetesReportPage.riskFactors.2')
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t('diabetesReportPage.title')}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            {t('diabetesReportPage.intro')}
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t('diabetesReportPage.overview.heading')}</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                {t('diabetesReportPage.overview.paragraph1')}
                <br /><br />
                {t('diabetesReportPage.overview.paragraph2')}
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader
          icon={ClipboardCheck}
          title={t('diabetesReportPage.diagnosis.sectionTitle')}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DiagnosisCard
            icon={Droplets}
            title={t('diabetesReportPage.diagnosis.fasting.title')}
            subTitle={t('diabetesReportPage.diagnosis.fasting.subTitle')}
            desc={t('diabetesReportPage.diagnosis.fasting.desc')}
            color="border-emerald-500"
          />
          <DiagnosisCard
            icon={Search}
            title={t('diabetesReportPage.diagnosis.hba1c.title')}
            subTitle={t('diabetesReportPage.diagnosis.hba1c.subTitle')}
            desc={t('diabetesReportPage.diagnosis.hba1c.desc')}
            color="border-blue-500"
          />
          <DiagnosisCard
            icon={Calendar}
            title={t('diabetesReportPage.diagnosis.ogtt.title')}
            subTitle={t('diabetesReportPage.diagnosis.ogtt.subTitle')}
            desc={t('diabetesReportPage.diagnosis.ogtt.desc')}
            color="border-emerald-300"
          />
        </div>

        {/* 당뇨의 종류 (검정 띠 섹션) */}
        <SectionHeader title={t('diabetesReportPage.types.sectionTitle')} />
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t('diabetesReportPage.types.heading')}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">{t('diabetesReportPage.types.type1.title')}</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 {t('diabetesReportPage.types.type1.desc')}
               </p>
               <ul className="text-[12px] text-emerald-600 font-bold list-disc ml-4">
                 <li>{t('diabetesReportPage.types.type1.point')}</li>
               </ul>
             </div>
             <div>
               <h4 className="font-extrabold text-[14px] mb-4 text-gray-800 border-b pb-2">{t('diabetesReportPage.types.type2.title')}</h4>
               <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                 {t('diabetesReportPage.types.type2.desc')}
               </p>
               <ul className="text-[12px] text-emerald-600 font-bold list-disc ml-4">
                 <li>{t('diabetesReportPage.types.type2.point')}</li>
               </ul>
             </div>
             </ContentCard>
           </div>
          
        

        {/* 영양 및 신체 활동 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Utensils size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('diabetesReportPage.nutrition.heading')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">{t('diabetesReportPage.nutrition.avoidTitle')}</h5>
                <ul className="space-y-2">
                  <FoodItem text={t('diabetesReportPage.nutrition.avoid.0')} isBad={true} />
                  <FoodItem text={t('diabetesReportPage.nutrition.avoid.1')} isBad={true} />
                  <FoodItem text={t('diabetesReportPage.nutrition.avoid.2')} isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">{t('diabetesReportPage.nutrition.recommendTitle')}</h5>
                <ul className="space-y-2">
                  <FoodItem text={t('diabetesReportPage.nutrition.recommend.0')} isBad={false} />
                  <FoodItem text={t('diabetesReportPage.nutrition.recommend.1')} isBad={false} />
                  <FoodItem text={t('diabetesReportPage.nutrition.recommend.2')} isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 블루) */}
          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[20px] font-bold mb-4">{t('diabetesReportPage.activity.headingLine1')}<br/>{t('diabetesReportPage.activity.headingLine2')}</h4>
              <p className="text-[13px] text-white/70 leading-relaxed mb-4">
                {t('diabetesReportPage.activity.desc')}
              </p>
            </div>
            <Droplets className="absolute right-[-20px] bottom-[-20px] text-white opacity-5 w-40 h-40" />
          </div>
        </div>

        <SectionHeader icon={AlertTriangle} title={t('diabetesReportPage.symptoms.sectionTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StepInfoCard
              number="01"
              title={t('diabetesReportPage.symptoms.step1.title')}
              desc={t('diabetesReportPage.symptoms.step1.desc')}
            />
            <StepInfoCard
              number="02"
              title={t('diabetesReportPage.symptoms.step2.title')}
              desc={t('diabetesReportPage.symptoms.step2.desc')}
            />
            <StepInfoCard
              number="03"
              title={t('diabetesReportPage.symptoms.step3.title')}
              desc={t('diabetesReportPage.symptoms.step3.desc')}
            />

            <CautionBox>
              {t('diabetesReportPage.symptoms.caution')}
            </CautionBox>
          </div>

          <ReferenceFooter
            lastUpdated="2026.05"
            items={[
              { source: "WHO (World Health Organization)", detail: "Diabetes Fact Sheet, 2024" },
              { source: t('diabetesReportPage.references.kda.source'), detail: t('diabetesReportPage.references.kda.detail') },
              { source: t('diabetesReportPage.references.kdca.source'), detail: t('diabetesReportPage.references.kdca.detail') },
              { source: "American Diabetes Association", detail: "Standards of Care in Diabetes, 2024" },
            ]}
          />
      </main>
    </div>
  );
}