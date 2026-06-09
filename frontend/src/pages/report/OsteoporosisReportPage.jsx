import React from 'react';
import { useTranslation } from "react-i18next";
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
  DiagnosisCard,
  ReferenceFooter
} from '../../components/report/DiseaseComponents';

export default function OsteoporosisReportPage() {
  const { t } = useTranslation();
  const riskFactors = [
    t('osteoporosisReportPage.riskFactors.0'),
    t('osteoporosisReportPage.riskFactors.1'),
    t('osteoporosisReportPage.riskFactors.2'),
    t('osteoporosisReportPage.riskFactors.3')
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* 타이틀 섹션 */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t('osteoporosisReportPage.title')}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            {t('osteoporosisReportPage.intro')}
          </p>
        </div>

        {/* 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t('osteoporosisReportPage.overview.heading')}</h3>
              <p className="text-[14px] text-gray-600 leading-loose">
                {t('osteoporosisReportPage.overview.paragraph1')}
                <br /><br />
                {t('osteoporosisReportPage.overview.paragraph2a')}<span className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-200">{t('osteoporosisReportPage.overview.paragraph2highlight')}</span>{t('osteoporosisReportPage.overview.paragraph2b')}
              </p>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        {/* 진단 기준 */}
        <SectionHeader
          icon={ClipboardCheck}
          title={t('osteoporosisReportPage.diagnosis.title')}
          subTitle={t('osteoporosisReportPage.diagnosis.subTitle')}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-14">
          <DiagnosisCard
            icon={ShieldPlus}
            title="정상"
            subTitle="T-score ≥ -1.0"
            desc="골밀도가 젊은 성인 평균과 비교해 안정적인 상태로, 예방적 생활습관 유지가 권장됩니다."
            color="border-emerald-500"
          />
          <DiagnosisCard
            icon={Activity}
            title="골감소증"
            subTitle="-2.5 < T < -1.0"
            desc="골량이 감소된 단계로, 골다공증 진행을 막기 위한 칼슘·비타민 D 섭취와 운동 강화가 필요합니다."
            color="border-orange-400"
          />
          <DiagnosisCard
            icon={AlertTriangle}
            title="골다공증"
            subTitle="T-score ≤ -2.5"
            desc="WHO 진단 기준에 해당하며, 비스포스포네이트 등 적극적인 약물 치료가 필요한 단계입니다."
            color="border-rose-500"
          />
        </div>

        {/* 관리 가이드라인 */}
        <SectionHeader icon={ShieldPlus} title={t('osteoporosisReportPage.management.title')} />

        {/* 약물 치료 */}
        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t('osteoporosisReportPage.management.pharmacology.heading')}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('osteoporosisReportPage.management.pharmacology.antiresorptive.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('osteoporosisReportPage.management.pharmacology.antiresorptive.item1')}</li>
                <li>{t('osteoporosisReportPage.management.pharmacology.antiresorptive.item2')}</li>
                <li>{t('osteoporosisReportPage.management.pharmacology.antiresorptive.item3')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">{t('osteoporosisReportPage.management.pharmacology.anabolic.heading')}</h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t('osteoporosisReportPage.management.pharmacology.anabolic.item1')}</li>
                <li>{t('osteoporosisReportPage.management.pharmacology.anabolic.item2')}</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        {/* 2. 생활습관 및 낙상 예방 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Utensils size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('osteoporosisReportPage.lifestyle.heading')}</h4>
            </div>
            <div className="space-y-5">
              <HabitItem icon="Ca" title={t('osteoporosisReportPage.lifestyle.calcium.title')} desc={t('osteoporosisReportPage.lifestyle.calcium.desc')} />
              <HabitItem icon="D3" title={t('osteoporosisReportPage.lifestyle.vitaminD.title')} desc={t('osteoporosisReportPage.lifestyle.vitaminD.desc')} />
              <HabitItem icon="Ex" title={t('osteoporosisReportPage.lifestyle.weightBearing.title')} desc={t('osteoporosisReportPage.lifestyle.weightBearing.desc')} />
            </div>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center gap-2 mb-6">
              <Home size={18} className="text-gray-700" />
              <h4 className="font-extrabold text-[14px]">{t('osteoporosisReportPage.fallPrevention.heading')}</h4>
            </div>
            <p className="text-[12px] text-gray-500 mb-5 leading-relaxed">
              {t('osteoporosisReportPage.fallPrevention.intro')}
            </p>
            <div className="bg-[#eff3f8] p-5 rounded-lg space-y-3">
              <CheckItem text={t('osteoporosisReportPage.fallPrevention.check1')} />
              <CheckItem text={t('osteoporosisReportPage.fallPrevention.check2')} />
              <CheckItem text={t('osteoporosisReportPage.fallPrevention.check3')} />
            </div>
          </ContentCard>
        </div>

        {/* 임상 증상 */}
        <SectionHeader icon={AlertTriangle} title={t('osteoporosisReportPage.symptoms.title')} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContentCard className="flex flex-col justify-center">
            <div className="mb-4 bg-gray-50 w-10 h-10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-gray-800" size={20} />
            </div>
            <h4 className="font-extrabold text-[15px] mb-3">{t('osteoporosisReportPage.symptoms.fractureRisk.heading')}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {t('osteoporosisReportPage.symptoms.fractureRisk.desc')}
            </p>
          </ContentCard>
          <div className="space-y-4">
            <SmallInfoCard title={t('osteoporosisReportPage.symptoms.bodyChange.title')} desc={t('osteoporosisReportPage.symptoms.bodyChange.desc')} />
            <SmallInfoCard title={t('osteoporosisReportPage.symptoms.dullPain.title')} desc={t('osteoporosisReportPage.symptoms.dullPain.desc')} />
          </div>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Assessment of Fracture Risk and Application to Screening for Postmenopausal Osteoporosis" },
            { source: t('osteoporosisReportPage.references.ksbmr.source'), detail: t('osteoporosisReportPage.references.ksbmr.detail') },
            { source: t('osteoporosisReportPage.references.kdca.source'), detail: t('osteoporosisReportPage.references.kdca.detail') },
            { source: "International Osteoporosis Foundation (IOF)", detail: "Osteoporosis Compendium" },
          ]}
        />
      </main>
    </div>
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