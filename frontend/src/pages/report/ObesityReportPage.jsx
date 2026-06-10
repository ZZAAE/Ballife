import React from "react";
import { useTranslation } from "react-i18next";
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
  ReferenceFooter,
} from "../../components/report/DiseaseComponents";

const ObesityReportPage = () => {
  const { t } = useTranslation();

  const riskFactors = [
    t("obesityReportPage.riskFactors.0"),
    t("obesityReportPage.riskFactors.1"),
    t("obesityReportPage.riskFactors.2"),
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 font-sans text-gray-900 pt-[55px]">
      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-4">{t("obesityReportPage.title")}</h1>
          <p className="text-[14px] text-[#64748B] leading-relaxed max-w-3xl">
            {t("obesityReportPage.intro.line1")}
            <br />
            {t("obesityReportPage.intro.line2")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <ContentCard className="h-full border-t-[5px] border-t-emerald-500">
              <h3 className="text-lg font-extrabold mb-5">{t("obesityReportPage.overview.heading")}</h3>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-4">
                <p>
                  {t("obesityReportPage.overview.paragraph1")}
                </p>
                <p>
                  {t("obesityReportPage.overview.paragraph2")}
                </p>
              </div>
            </ContentCard>
          </div>
          <RiskFactorCard factors={riskFactors} />
        </div>

        <SectionHeader
          title={t("obesityReportPage.diagnosis.title")}
          subTitle={t("obesityReportPage.diagnosis.subTitle")}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DiagnosisCard
            icon={CheckCircle2}
            title="18.5 - 22.9"
            subTitle={t("obesityReportPage.diagnosis.normal.subTitle")}
            desc={t("obesityReportPage.diagnosis.normal.desc")}
            color="border-l-emerald-400"
          />
          <DiagnosisCard
            icon={TrendingDown}
            title="23.0 - 24.9"
            subTitle={t("obesityReportPage.diagnosis.preObesity.subTitle")}
            desc={t("obesityReportPage.diagnosis.preObesity.desc")}
            color="border-l-sky-400"
          />
          <DiagnosisCard
            icon={TrendingUp}
            title="25.0 - 29.9"
            subTitle={t("obesityReportPage.diagnosis.stage1.subTitle")}
            desc={t("obesityReportPage.diagnosis.stage1.desc")}
            color="border-l-orange-400"
          />
          <DiagnosisCard
            icon={AlertTriangle}
            title="30.0+"
            subTitle={t("obesityReportPage.diagnosis.stage2.subTitle")}
            desc={t("obesityReportPage.diagnosis.stage2.desc")}
            color="border-l-rose-400"
          />
        </div>

        <SectionHeader icon={HeartPulse} title={t("obesityReportPage.guideline.title")} />

        <div className="mb-10">
          <div className="bg-[#0F172A] text-white p-5 rounded-t-[18px] flex items-center gap-3">
            <Stethoscope size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-[14px]">{t("obesityReportPage.pharmacology.title")}</h3>
          </div>
          <ContentCard className="rounded-t-none border-t-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 !p-6 md:!p-8">
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                {t("obesityReportPage.pharmacology.weightLoss.title")}
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t("obesityReportPage.pharmacology.weightLoss.item1")}</li>
                <li>{t("obesityReportPage.pharmacology.weightLoss.item2")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4 text-gray-900">
                {t("obesityReportPage.pharmacology.maintenance.title")}
              </h4>
              <ul className="text-[12px] text-gray-600 list-disc list-outside ml-4 space-y-2 leading-relaxed">
                <li>{t("obesityReportPage.pharmacology.maintenance.item1")}</li>
                <li>{t("obesityReportPage.pharmacology.maintenance.item2")}</li>
              </ul>
            </div>
          </ContentCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col gap-6">
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                {t("obesityReportPage.caution.fructose.title")}
              </span>
              {t("obesityReportPage.caution.fructose.desc")}
            </CautionBox>
            <CautionBox>
              <span className="block font-bold text-gray-800 mb-1">
                {t("obesityReportPage.caution.lateNight.title")}
              </span>
              {t("obesityReportPage.caution.lateNight.desc")}
            </CautionBox>
          </div>
          <div className="md:col-span-2">
            <ContentCard className="flex flex-col sm:flex-row gap-6 sm:gap-8 !p-6 md:!p-8 h-full items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="text-emerald-500" size={22} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("obesityReportPage.physicalActivity.title")}
                  </h3>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  {t("obesityReportPage.physicalActivity.desc")}
                </p>
                <div className="flex gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg flex-1">
                    <h4 className="font-bold text-[13px] mb-1.5 text-gray-900">
                      {t("obesityReportPage.physicalActivity.cardio.title")}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {t("obesityReportPage.physicalActivity.cardio.desc")}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg flex-1">
                    <h4 className="font-bold text-[13px] mb-1.5 text-gray-900">
                      {t("obesityReportPage.physicalActivity.strength.title")}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {t("obesityReportPage.physicalActivity.strength.desc")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-40 h-40 max-w-full rounded-2xl overflow-hidden shrink-0">
                <img
                  src="/path/to/your/exercise-image.jpg" // 실제 이미지 경로로 변경하세요.
                  alt={t("obesityReportPage.physicalActivity.imageAlt")}
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
              <h3 className="text-[15px] font-bold">{t("obesityReportPage.diet.title")}</h3>
            </div>
            <ul className="space-y-4 flex-1">
              {[
                t("obesityReportPage.diet.items.0"),
                t("obesityReportPage.diet.items.1"),
                t("obesityReportPage.diet.items.2"),
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
              {t("obesityReportPage.diet.note")}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 ml-1">
              <BrainCircuit size={20} className="text-blue-600" />
              <h3 className="text-[15px] font-bold text-gray-900">{t("obesityReportPage.behavior.title")}</h3>
            </div>
            <StepInfoCard
              number="01"
              title={t("obesityReportPage.behavior.step1.title")}
              desc={t("obesityReportPage.behavior.step1.desc")}
            />
            <StepInfoCard
              number="02"
              title={t("obesityReportPage.behavior.step2.title")}
              desc={t("obesityReportPage.behavior.step2.desc")}
            />
            <StepInfoCard
              number="03"
              title={t("obesityReportPage.behavior.step3.title")}
              desc={t("obesityReportPage.behavior.step3.desc")}
            />
          </div>

          {/* Surgery/Procedure */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 ml-1">
              <Stethoscope size={20} className="text-blue-600" />
              <h3 className="text-[15px] font-bold text-gray-900">
                {t("obesityReportPage.surgery.title")}
              </h3>
            </div>
            <StepInfoCard
              number="01"
              title={t("obesityReportPage.surgery.step1.title")}
            />
            <StepInfoCard
              number="02"
              title={t("obesityReportPage.surgery.step2.title")}
            />
          </div>
        </div>

        <ReferenceFooter
          lastUpdated="2026.05"
          items={[
            { source: "WHO", detail: "Obesity and Overweight Fact Sheet, 2024" },
            { source: t("obesityReportPage.references.ksso.source"), detail: t("obesityReportPage.references.ksso.detail") },
            { source: t("obesityReportPage.references.kdca.source"), detail: t("obesityReportPage.references.kdca.detail") },
            { source: "WHO Western Pacific Region", detail: "BMI Cut-offs for Asian Populations" },
          ]}
        />
      </main>
    </div>
  );
};

export default ObesityReportPage;
