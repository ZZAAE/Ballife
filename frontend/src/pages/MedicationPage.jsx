import { useState } from "react";

import MedicationProgressCard from "../components/medication/MedicationProgressCard";
import MedicationRecordCard from "../components/medication/MedicationRecordCard";
import MemoCard from "../components/medication/MemoCard";
import PrescriptionListCard from "../components/medication/PrescriptionListCard";
import TodayScheduleCard from "../components/medication/TodayScheduleCard";
import WeeklyCalendarCard from "../components/medication/WeeklyCalendarCard";
import PrescriptionDetailModal from "../modals/PrescriptionDetailModal";
import BloodPressureRecordModal from "../modals/BloodPressureRecordModal";

export default function MedicationPage() {
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBloodPressureModalOpen, setIsBloodPressureModalOpen] =
    useState(false);

  const openPrescriptionModal = (group) => {
    setSelectedGroup(group);
    setIsPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="min-h-full w-full bg-gray-50 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-6 lg:px-10 xl:px-12 pb-10 pt-[87px]">
        {/* 제목 영역 */}
        <section className="mb-10">
          <h1 class="tmb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            약 복용 관리
          </h1>

          <p className="text-sm text-gray-400">
            지난 한 달간의 신체 변화를 분석한 결과입니다.
          </p>
        </section>

        {/* 상단 카드 영역 */}
        <section className="grid grid-cols-1 2xl:grid-cols-[390px_minmax(0,1fr)] gap-8">
          {/* 왼쪽 영역 */}
          <div className="w-full min-w-0 flex flex-col gap-8">
            <MedicationProgressCard />

            <MedicationRecordCard
              drugName={drugName}
              setDrugName={setDrugName}
              dosage={dosage}
              setDosage={setDosage}
              time={time}
              setTime={setTime}
            />

            <MemoCard />
          </div>

          {/* 오른쪽 영역 */}
          <div className="w-full min-w-0 flex flex-col gap-8">
            <TodayScheduleCard />
            <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-8">
              <MemoCard />
              <WeeklyCalendarCard />
            </div>
          </div>
        </section>

        {/* 처방 약 목록 */}
        <section className="mt-12">
          <PrescriptionListCard onSelectGroup={openPrescriptionModal} />
        </section>
      </div>

      <BloodPressureRecordModal
        isOpen={isBloodPressureModalOpen}
        onClose={() => setIsBloodPressureModalOpen(false)}
      />

      <PrescriptionDetailModal
        open={isPrescriptionModalOpen}
        group={selectedGroup}
        onClose={closePrescriptionModal}
      />
    </div>
  );
}
