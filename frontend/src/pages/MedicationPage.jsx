import { useState } from "react";

import Header from "../components/Header";
import FloatingChatButton from "../components/medication/FloatingChatButton";
import MedicationProgressCard from "../components/medication/MedicationProgressCard";
import MedicationRecordCard from "../components/medication/MedicationRecordCard";
import MemoCard from "../components/medication/MemoCard";
import PrescriptionListCard from "../components/medication/PrescriptionListCard";
import TodayScheduleCard from "../components/medication/TodayScheduleCard";
import WeeklyCalendarCard from "../components/medication/WeeklyCalendarCard";
import PrescriptionDetailModal from "../modals/PrescriptionDetailModal";
//혈압모달
import BloodPressureRecordModal from "../modals/BloodPressureRecordModal";

export default function MedicationPage() {
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBloodPressureModalOpen, setIsBloodPressureModalOpen] = useState(false);

  const openPrescriptionModal = (group) => {
    setSelectedGroup(group);
    setIsPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" }}
    >
      <Header />
      
      <div className="flex justify-center ">
        <main className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-gray-900 mb-1">
            약 복용 관리
          </h1>
          <p className="text-[15px] sm:text-[18px] lg:text-[20px] text-gray-400 mb-8">
            지난 한 달간의 신체 변화를 분석한 결과입니다.
          </p>

          <div className="flex flex-col 2xl:flex-row gap-6">
            <div className="w-full 2xl:w-[340px] flex flex-col gap-6">
              <MedicationProgressCard />

              <MedicationRecordCard
                drugName={drugName}
                setDrugName={setDrugName}
                dosage={dosage}
                setDosage={setDosage}
                time={time}
                setTime={setTime}
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <TodayScheduleCard />

              <div className="flex flex-col xl:flex-row gap-6">
                <MemoCard />
                <WeeklyCalendarCard />
              </div>
            </div>
          </div>

          <div className="mt-10">
            <PrescriptionListCard onSelectGroup={openPrescriptionModal} />
          </div>
        </main>
      </div>

      <FloatingChatButton />
       <BloodPressureRecordModal isOpen={isBloodPressureModalOpen} onClose={() => setIsBloodPressureModalOpen(false)} />
      <PrescriptionDetailModal
        open={isPrescriptionModalOpen}
        group={selectedGroup}
        onClose={closePrescriptionModal}
      />
    </div>
  );
}
