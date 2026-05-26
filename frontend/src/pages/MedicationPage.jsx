import { useEffect, useState } from "react";

import MedicationProgressCard from "../components/medication/MedicationProgressCard";
import MedicationRecordCard from "../components/medication/MedicationRecordCard";
import MemoCard from "../components/medication/MemoCard";
import PrescriptionListCard from "../components/medication/PrescriptionListCard";
import SavedRecordsCard from "../components/medication/SavedRecordsCard";
import TodayScheduleCard from "../components/medication/TodayScheduleCard";
import WeeklyCalendarCard from "../components/medication/WeeklyCalendarCard";
import PrescriptionDetailModal from "../modals/PrescriptionDetailModal";
import BloodPressureRecordModal from "../modals/BloodPressureRecordModal";

const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";
const SAVED_RECORDS_KEY = "savedMedicationRecords";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const INITIAL_TODAY_SCHEDULES = [
  {
    id: "morning",
    label: "아침",
    time: "08:00",
    name: "아침약",
    note: "식후 30분 복용",
    drugs: [
      { id: "bp", name: "혈압약", taken: false },
      { id: "diabetes", name: "당뇨약", taken: false },
    ],
  },
  {
    id: "lunch",
    label: "점심",
    time: "13:00",
    name: "점심약",
    note: "식사 중 복용",
    drugs: [
      { id: "bp", name: "혈압약", taken: false },
      { id: "diabetes", name: "당뇨약", taken: false },
    ],
  },
  {
    id: "dinner",
    label: "저녁",
    time: "19:00",
    name: "저녁약",
    note: "식후 30분 복용",
    drugs: [
      { id: "bp", name: "혈압약", taken: false },
      { id: "diabetes", name: "당뇨약", taken: false },
    ],
  },
];

export default function MedicationPage() {
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(() => formatDateKey(new Date()));

  const [savedRecords, setSavedRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_RECORDS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SAVED_RECORDS_KEY, JSON.stringify(savedRecords));
  }, [savedRecords]);

  const handleSaveRecord = () => {
    if (!drugName.trim()) {
      alert("약 이름을 입력해주세요.");
      return;
    }
    const newRecord = {
      id: Date.now(),
      drugName: drugName.trim(),
      dosage: dosage.trim(),
      date,
      time,
    };
    setSavedRecords((prev) => [newRecord, ...prev]);
    setDrugName("");
    setDosage("");
    setTime("");
  };

  const handleDeleteRecord = (id) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBloodPressureModalOpen, setIsBloodPressureModalOpen] =
    useState(false);

  const todayKey = formatDateKey(new Date());

  const [todaySchedules, setTodaySchedules] = useState(() => {
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + todayKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 저장된 데이터가 새 구조(drugs 배열 포함)인지 검증
        const isValid =
          Array.isArray(parsed) &&
          parsed.length === INITIAL_TODAY_SCHEDULES.length &&
          parsed.every((s) => Array.isArray(s.drugs));
        if (isValid) return parsed;
      }
    } catch {
      // 무시
    }
    return INITIAL_TODAY_SCHEDULES;
  });

  useEffect(() => {
    localStorage.setItem(
      SCHEDULE_STORAGE_PREFIX + todayKey,
      JSON.stringify(todaySchedules)
    );
  }, [todaySchedules, todayKey]);

  const handleToggleDrug = (scheduleId, drugId) => {
    setTodaySchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              drugs: s.drugs.map((d) =>
                d.id === drugId ? { ...d, taken: !d.taken } : d
              ),
            }
          : s
      )
    );
  };

  const handleToggleAllDrugs = (scheduleId) => {
    setTodaySchedules((prev) =>
      prev.map((s) => {
        if (s.id !== scheduleId) return s;
        const allTaken = s.drugs.every((d) => d.taken);
        return {
          ...s,
          drugs: s.drugs.map((d) => ({ ...d, taken: !allTaken })),
        };
      })
    );
  };

  const openPrescriptionModal = (group) => {
    setSelectedGroup(group);
    setIsPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A] overflow-x-hidden">
      <div className="mx-auto box-border w-full max-w-[1280px] px-6 pt-[87px] pb-8">
        {/* 제목 영역 */}
        <section className="mb-8">
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
            약 복용 관리
          </h1>

          <p className="mb-8 text-sm text-gray-500">
            지난 복용 결과를 분석한 결과입니다.
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
              date={date}
              setDate={setDate}
              onSaveRecord={handleSaveRecord}
            />

            <SavedRecordsCard
              records={savedRecords.filter((r) => r.date === todayKey)}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>

          {/* 오른쪽 영역 */}
          <div className="w-full min-w-0 flex flex-col gap-8">
            <TodayScheduleCard
              schedules={todaySchedules}
              onToggleDrug={handleToggleDrug}
              onToggleAllDrugs={handleToggleAllDrugs}
            />
            <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-8">
              <MemoCard />
              <WeeklyCalendarCard todaySchedules={todaySchedules} />
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
