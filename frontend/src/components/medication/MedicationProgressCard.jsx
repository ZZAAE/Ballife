// 복용 일정(schedules)의 약 체크 상태로 오늘의 복용 이행률(%)을 계산
import { useTranslation } from "react-i18next";

export default function MedicationProgressCard({ schedules = [] }) {
  const { t } = useTranslation();
  const allDrugs = schedules.flatMap((s) => s.drugs ?? []);
  const total = allDrugs.length;
  const taken = allDrugs.filter((d) => d.taken).length;
  const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-[16px] text-gray-400 mb-3">{t('medicationProgressCard.title')}</p>
      <p className="text-[45px] font-extrabold text-gray-900 leading-none mb-4">
        {rate} %
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[8px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
            style={{ width: `${rate}%` }}
          />
        </div>

        <span className="text-[12px] text-[#2563EB] font-semibold bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
          {t('medicationProgressCard.completed', { taken, total })}
        </span>
      </div>
    </div>
  );
}
