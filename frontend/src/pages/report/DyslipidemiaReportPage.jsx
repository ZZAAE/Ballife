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

export default function DyslipidemiaReportPage() {
  const { t } = useTranslation();

  const riskFactors = [
    t('dyslipidemiaReportPage.riskFactors.0'),
    t('dyslipidemiaReportPage.riskFactors.1'),
    t('dyslipidemiaReportPage.riskFactors.2')
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t('dyslipidemiaReportPage.title')}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
{t('dyslipidemiaReportPage.subtitle')}
          </p>
        </div>

        {/* 개요 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t('dyslipidemiaReportPage.overview.heading')}</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                {t('dyslipidemiaReportPage.overview.paragraph1')}
                <br /><br />
                {t('dyslipidemiaReportPage.overview.paragraph2')}
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 섹션 */}
        <SectionHeader
          icon={Stethoscope}
          title={t('dyslipidemiaReportPage.diagnosis.sectionTitle')}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DiagnosisCard
            icon={Target}
            title={t('dyslipidemiaReportPage.diagnosis.card1.title')}
            subTitle={t('dyslipidemiaReportPage.diagnosis.card1.subTitle')}
            desc={t('dyslipidemiaReportPage.diagnosis.card1.desc')}
            color="border-emerald-500"
          />
          <DiagnosisCard
            icon={Activity}
            title={t('dyslipidemiaReportPage.diagnosis.card2.title')}
            subTitle={t('dyslipidemiaReportPage.diagnosis.card2.subTitle')}
            desc={t('dyslipidemiaReportPage.diagnosis.card2.desc')}
            color="border-blue-500"
          />
          <DiagnosisCard
            icon={Zap}
            title={t('dyslipidemiaReportPage.diagnosis.card3.title')}
            subTitle={t('dyslipidemiaReportPage.diagnosis.card3.subTitle')}
            desc={t('dyslipidemiaReportPage.diagnosis.card3.desc')}
            color="border-emerald-300"
          />
        </div>

        {/* 관리 가이드라인 섹션 */}
        <SectionHeader icon={ShieldCheck} title={t('dyslipidemiaReportPage.management.sectionTitle')} />

        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <HeartPulse size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t('dyslipidemiaReportPage.management.pharmacology.heading')}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
             <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('dyslipidemiaReportPage.management.pharmacology.lipidLowering.title')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('dyslipidemiaReportPage.management.pharmacology.lipidLowering.item')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('dyslipidemiaReportPage.management.pharmacology.monitoring.title')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('dyslipidemiaReportPage.management.pharmacology.monitoring.item')}</li>
              </ul>
             </div>
          </ContentCard>
        </div>

        {/* 식이 및 신체 활동 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('dyslipidemiaReportPage.nutrition.heading')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[12px] font-bold text-rose-500 mb-3">{t('dyslipidemiaReportPage.nutrition.avoid.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.avoid.item1')} isBad={true} />
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.avoid.item2')} isBad={true} />
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.avoid.item3')} isBad={true} />
                </ul>
              </div>
              <div>
                <h5 className="text-[12px] font-bold text-emerald-600 mb-3">{t('dyslipidemiaReportPage.nutrition.recommend.heading')}</h5>
                <ul className="space-y-3">
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.recommend.item1')} isBad={false} />
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.recommend.item2')} isBad={false} />
                  <FoodItem text={t('dyslipidemiaReportPage.nutrition.recommend.item3')} isBad={false} />
                </ul>
              </div>
            </div>
          </ContentCard>

          {/* 신체 활동 강조 카드 (다크 네이비) */}
          <div className="bg-[#0F172A] rounded-[18px] p-8 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[20px] font-bold mb-4">{t('dyslipidemiaReportPage.physicalActivity.heading.line1')}<br/>{t('dyslipidemiaReportPage.physicalActivity.heading.line2')}</h4>
              <p className="text-[13px] text-white/70 leading-relaxed">
{t('dyslipidemiaReportPage.physicalActivity.paragraph')}
              </p>
            </div>
            <div className="absolute right-[-5%] bottom-[-5%] opacity-10 text-blue-400">
               <Waves size={160} />
            </div>
          </div>
        </div>

        {/* 임상 증상 및 징후 섹션 */}
        <SectionHeader icon={AlertCircle} title={t('dyslipidemiaReportPage.symptoms.sectionTitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StepInfoCard number="01" title={t('dyslipidemiaReportPage.symptoms.step1.title')} desc={t('dyslipidemiaReportPage.symptoms.step1.desc')} />
          <StepInfoCard number="02" title={t('dyslipidemiaReportPage.symptoms.step2.title')} desc={t('dyslipidemiaReportPage.symptoms.step2.desc')} />
          <StepInfoCard number="03" title={t('dyslipidemiaReportPage.symptoms.step3.title')} desc={t('dyslipidemiaReportPage.symptoms.step3.desc')} />

          <CautionBox>
            {t('dyslipidemiaReportPage.symptoms.caution')}
          </CautionBox>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Cardiovascular Diseases (CVDs) Fact Sheet, 2023" },
            { source: t('dyslipidemiaReportPage.references.ksola.source'), detail: t('dyslipidemiaReportPage.references.ksola.detail') },
            { source: t('dyslipidemiaReportPage.references.kdca.source'), detail: t('dyslipidemiaReportPage.references.kdca.detail') },
            { source: "ESC/EAS", detail: "Guidelines for the Management of Dyslipidaemias, 2019/2023 update" },
          ]}
        />
      </main>
    </div>
  );
}
