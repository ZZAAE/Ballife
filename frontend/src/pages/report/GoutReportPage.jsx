import React from 'react';
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const riskFactors = [
    t('goutReportPage.riskFactors.0'),
    t('goutReportPage.riskFactors.1'),
    t('goutReportPage.riskFactors.2')
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t('goutReportPage.title')}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            {t('goutReportPage.intro')}
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t('goutReportPage.overview.heading')}</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                {t('goutReportPage.overview.paragraph1')}
                <br /><br />
                {t('goutReportPage.overview.paragraph2')}
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader icon={ClipboardCheck} title={t('goutReportPage.diagnosis.sectionTitle')} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <DiagnosisCard
            icon={Thermometer}
            title={t('goutReportPage.diagnosis.card1.title')}
            subTitle={t('goutReportPage.diagnosis.card1.subTitle')}
            desc={t('goutReportPage.diagnosis.card1.desc')}
            color="border-emerald-500"
          />
          <DiagnosisCard
            icon={Layers}
            title={t('goutReportPage.diagnosis.card2.title')}
            subTitle={t('goutReportPage.diagnosis.card2.subTitle')}
            desc={t('goutReportPage.diagnosis.card2.desc')}
            color="border-blue-500"
          />
          <DiagnosisCard
            icon={Search}
            title={t('goutReportPage.diagnosis.card3.title')}
            subTitle={t('goutReportPage.diagnosis.card3.subTitle')}
            desc={t('goutReportPage.diagnosis.card3.desc')}
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title={t('goutReportPage.management.sectionTitle')} />

        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t('goutReportPage.pharmacology.heading')}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('goutReportPage.pharmacology.acute.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('goutReportPage.pharmacology.acute.item1')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('goutReportPage.pharmacology.longTerm.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('goutReportPage.pharmacology.longTerm.item1')}</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 영양 및 수분 섭취 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('goutReportPage.nutrition.heading')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">{t('goutReportPage.nutrition.avoid.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('goutReportPage.nutrition.avoid.item1')} isBad={true} />
                  <FoodItem text={t('goutReportPage.nutrition.avoid.item2')} isBad={true} />
                  <FoodItem text={t('goutReportPage.nutrition.avoid.item3')} isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">{t('goutReportPage.nutrition.recommend.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('goutReportPage.nutrition.recommend.item1')} isBad={false} />
                  <FoodItem text={t('goutReportPage.nutrition.recommend.item2')} isBad={false} />
                  <FoodItem text={t('goutReportPage.nutrition.recommend.item3')} isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <GlassWater size={20} className="text-blue-300" />
              </div>
              <h4 className="text-[20px] font-bold mb-4">{t('goutReportPage.hydration.heading.line1')}<br/>{t('goutReportPage.hydration.heading.line2')}</h4>
              <p className="text-[13px] text-white/70 leading-relaxed">
                {t('goutReportPage.hydration.description')}
              </p>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] opacity-5">
               <GlassWater size={180} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 */}
        <SectionHeader icon={AlertTriangle} title={t('goutReportPage.symptoms.sectionTitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title={t('goutReportPage.symptoms.step1.title')} desc={t('goutReportPage.symptoms.step1.desc')} />
          <StepInfoCard number="02" title={t('goutReportPage.symptoms.step2.title')} desc={t('goutReportPage.symptoms.step2.desc')} />
          <StepInfoCard number="03" title={t('goutReportPage.symptoms.step3.title')} desc={t('goutReportPage.symptoms.step3.desc')} />
          <CautionBox>{t('goutReportPage.symptoms.caution')}</CautionBox>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: t('goutReportPage.references.0.source'), detail: t('goutReportPage.references.0.detail') },
            { source: t('goutReportPage.references.1.source'), detail: t('goutReportPage.references.1.detail') },
            { source: t('goutReportPage.references.2.source'), detail: t('goutReportPage.references.2.detail') },
            { source: t('goutReportPage.references.3.source'), detail: t('goutReportPage.references.3.detail') },
          ]}
        />
      </main>
    </div>
  );
}
