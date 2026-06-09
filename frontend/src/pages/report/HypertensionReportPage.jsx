import React from 'react';
import { useTranslation } from "react-i18next";
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
  CautionBox,
  ReferenceFooter
} from '../../components/report/DiseaseComponents';

export default function HypertensionReportPage() {
  const { t } = useTranslation();

  const riskFactors = [
    t('hypertensionReportPage.riskFactors.0'),
    t('hypertensionReportPage.riskFactors.1'),
    t('hypertensionReportPage.riskFactors.2')
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 - 이미지 텍스트 그대로 적용 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t('hypertensionReportPage.title')}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            {t('hypertensionReportPage.intro')}
          </p>
        </div>

        {/* 개요 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t('hypertensionReportPage.overview.heading')}</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                {t('hypertensionReportPage.overview.paragraph1')}
                <br /><br />
                {t('hypertensionReportPage.overview.paragraph2')}
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 섹션 */}
        <SectionHeader
          icon={Stethoscope}
          title={t('hypertensionReportPage.diagnosis.sectionTitle')}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <DiagnosisCard
            icon={Target}
            title={t('hypertensionReportPage.diagnosis.card1.title')}
            subTitle={t('hypertensionReportPage.diagnosis.card1.subTitle')}
            desc={t('hypertensionReportPage.diagnosis.card1.desc')}
            color="border-emerald-500"
          />
          <DiagnosisCard
            icon={Activity}
            title={t('hypertensionReportPage.diagnosis.card2.title')}
            subTitle={t('hypertensionReportPage.diagnosis.card2.subTitle')}
            desc={t('hypertensionReportPage.diagnosis.card2.desc')}
            color="border-blue-500"
          />
          <DiagnosisCard
            icon={Zap}
            title={t('hypertensionReportPage.diagnosis.card3.title')}
            subTitle={t('hypertensionReportPage.diagnosis.card3.subTitle')}
            desc={t('hypertensionReportPage.diagnosis.card3.desc')}
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 섹션 */}
        <SectionHeader icon={ShieldCheck} title={t('hypertensionReportPage.management.sectionTitle')} />

        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <HeartPulse size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t('hypertensionReportPage.pharmacology.heading')}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('hypertensionReportPage.pharmacology.initial.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('hypertensionReportPage.pharmacology.initial.item1')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('hypertensionReportPage.pharmacology.longTerm.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('hypertensionReportPage.pharmacology.longTerm.item1')}</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 식이 및 생활습관 강조 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('hypertensionReportPage.nutrition.heading')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">{t('hypertensionReportPage.nutrition.avoid.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('hypertensionReportPage.nutrition.avoid.item1')} isBad={true} />
                  <FoodItem text={t('hypertensionReportPage.nutrition.avoid.item2')} isBad={true} />
                  <FoodItem text={t('hypertensionReportPage.nutrition.avoid.item3')} isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">{t('hypertensionReportPage.nutrition.recommend.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('hypertensionReportPage.nutrition.recommend.item1')} isBad={false} />
                  <FoodItem text={t('hypertensionReportPage.nutrition.recommend.item2')} isBad={false} />
                  <FoodItem text={t('hypertensionReportPage.nutrition.recommend.item3')} isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 체중 관리 강조 카드 */}
          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[20px] font-bold mb-4">{t('hypertensionReportPage.lifestyle.heading.line1')}<br/>{t('hypertensionReportPage.lifestyle.heading.line2')}</h4>
              <p className="text-[13px] text-white/70 leading-relaxed">
                {t('hypertensionReportPage.lifestyle.description')}
              </p>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] opacity-5 text-blue-400">
               <Waves size={180} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 섹션 */}
        <SectionHeader icon={AlertCircle} title={t('hypertensionReportPage.symptoms.sectionTitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title={t('hypertensionReportPage.symptoms.step1.title')} desc={t('hypertensionReportPage.symptoms.step1.desc')} />
          <StepInfoCard number="02" title={t('hypertensionReportPage.symptoms.step2.title')} desc={t('hypertensionReportPage.symptoms.step2.desc')} />
          <StepInfoCard number="03" title={t('hypertensionReportPage.symptoms.step3.title')} desc={t('hypertensionReportPage.symptoms.step3.desc')} />

          <CautionBox>
            {t('hypertensionReportPage.symptoms.caution')}
          </CautionBox>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: t('hypertensionReportPage.references.0.source'), detail: t('hypertensionReportPage.references.0.detail') },
            { source: t('hypertensionReportPage.references.1.source'), detail: t('hypertensionReportPage.references.1.detail') },
            { source: t('hypertensionReportPage.references.2.source'), detail: t('hypertensionReportPage.references.2.detail') },
            { source: t('hypertensionReportPage.references.3.source'), detail: t('hypertensionReportPage.references.3.detail') },
          ]}
        />
      </main>
    </div>
  );
}
