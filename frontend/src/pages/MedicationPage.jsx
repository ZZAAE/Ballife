import { useEffect, useMemo, useState } from "react";

import MedicationProgressCard from "../components/medication/MedicationProgressCard";
import MedicationRecordCard from "../components/medication/MedicationRecordCard";
import MemoCard from "../components/medication/MemoCard";
import PrescriptionListCard from "../components/medication/PrescriptionListCard";
import SavedRecordsCard from "../components/medication/SavedRecordsCard";
import TodayScheduleCard from "../components/medication/TodayScheduleCard";
import WeeklyCalendarCard from "../components/medication/WeeklyCalendarCard";
import {
  loadPrescriptionGroups,
  savePrescriptionGroups,
} from "../components/medication/prescriptionData";
import PrescriptionDetailModal from "../modals/PrescriptionDetailModal";
import BloodPressureRecordModal from "../modals/BloodPressureRecordModal";
import medicineApi from "../api/medicineApi";
import { USER_KEY } from "../api/api";
import { useAuth } from "../contexts/AuthContext";

// 로그인 사용자 ID 해석 (다른 페이지와 동일 방식)
const resolveUserId = (user) => {
  const fromContext = user?.userId ?? user?.id ?? user?.memberId;
  if (fromContext != null) return fromContext;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem("user") ||
      localStorage.getItem("loginUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? parsed?.id ?? parsed?.memberId ?? null;
  } catch {
    return null;
  }
};

const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";
const SAVED_RECORDS_KEY = "savedMedicationRecords";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 현재 시각을 "HH:MM" 형식으로 반환 (time input 기본값)
const formatTimeNow = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
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

// 기본 일정의 깊은 복제본 (모든 약 미복용)
const cloneInitialSchedules = () =>
  INITIAL_TODAY_SCHEDULES.map((s) => ({
    ...s,
    drugs: s.drugs.map((d) => ({ ...d })),
  }));

// 선택한 날짜의 복용 일정 로드.
// - 오늘/과거: 사용자가 실제 체크해 저장한 기록(localStorage)을 사용.
//   기록이 없으면 전부 미복용(기본 일정) — 주간 달력이 미복용으로 굳히는 것과 동일.
// - 미래: 아직 기록 없음 → 전부 미복용
const loadSchedulesForDate = (dateKey, todayKey) => {
  if (dateKey <= todayKey) {
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + dateKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isValid =
          Array.isArray(parsed) &&
          parsed.length === INITIAL_TODAY_SCHEDULES.length &&
          parsed.every((s) => Array.isArray(s.drugs));
        if (isValid) return parsed;
      }
    } catch {
      // 무시하고 기본 일정 사용
    }
  }
  return cloneInitialSchedules();
};

export default function MedicationPage() {
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState(() => formatTimeNow());
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
      // 시간을 비웠으면 저장 시점의 현재 시각으로 기록
      time: time || formatTimeNow(),
    };
    setSavedRecords((prev) => [newRecord, ...prev]);
    setDrugName("");
    setDosage("");
    setTime(formatTimeNow());
  };

  const handleDeleteRecord = (id) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBloodPressureModalOpen, setIsBloodPressureModalOpen] =
    useState(false);

  // 처방 그룹 = 약 페이지 전체의 단일 데이터 소스 (목록·일정·이행률·달력 모두 연결)
  const [prescriptionGroups, setPrescriptionGroups] = useState(() =>
    loadPrescriptionGroups()
  );

  useEffect(() => {
    savePrescriptionGroups(prescriptionGroups);
  }, [prescriptionGroups]);

  // 백엔드 처방전의 복용량(dosage)을 그룹명 기준으로 매핑해 표시값에 덮어쓴다
  const { user } = useAuth();
  const userId = resolveUserId(user);
  const [backendDosageByName, setBackendDosageByName] = useState({});

  useEffect(() => {
    if (userId == null) return;
    medicineApi
      .getPrescriptions(userId)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const map = {};
        list.forEach((p) => {
          if (p.prescriptionName && p.dosage != null) {
            map[p.prescriptionName] = p.dosage;
          }
        });
        setBackendDosageByName(map);
      })
      .catch(() => {
        // 백엔드 미연결/데이터 없음 → 기본(localStorage) 복용량 사용
      });
  }, [userId]);

  // 약이 1개 이상 남은 그룹만 활성 (빈 그룹은 페이지 전체에서 제외)
  const activeGroups = prescriptionGroups.filter(
    (g) => g.medicines.length > 0
  );
  const activeDrugIds = new Set(activeGroups.map((g) => g.drugId));

  // 처방 모달이 보는 그룹은 항상 최신 상태(삭제/수정 즉시 반영)
  const selectedGroupLive =
    prescriptionGroups.find((g) => g.id === selectedGroup?.id) ?? null;

  const handleDeleteMedicine = (groupId, medicineId) => {
    setPrescriptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, medicines: g.medicines.filter((m) => m.id !== medicineId) }
          : g
      )
    );
  };

  const handleUpdateMedicine = (groupId, medicineId, patch) => {
    setPrescriptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              medicines: g.medicines.map((m) =>
                m.id === medicineId ? { ...m, ...patch } : m
              ),
            }
          : g
      )
    );
  };

  const todayKey = formatDateKey(new Date());

  // 복용 일정 카드에서 조회/수정 중인 날짜 (기본 오늘, 헤더에서 변경 가능)
  const [scheduleDate, setScheduleDate] = useState(todayKey);
  const [todaySchedules, setTodaySchedules] = useState(() =>
    loadSchedulesForDate(todayKey, todayKey)
  );

  // 오늘의 실제 체크 상태만 저장 (다른 날짜는 달력과 동일한 데모 데이터라 저장하지 않음)
  // 삭제된 약은 localStorage 에서도 제외 → RecordSummary 의 복용 상태 오판 방지
  useEffect(() => {
    // 미래 날짜는 저장하지 않음 (오늘/과거의 복용 확인만 기록)
    if (scheduleDate > todayKey) return;
    const isPast = scheduleDate < todayKey;
    const filtered = todaySchedules.map((s) => ({
      ...s,
      // 과거는 그 시점에 보던 약을 그대로 보존, 오늘은 활성 약만 저장
      drugs: isPast ? s.drugs : s.drugs.filter((d) => activeDrugIds.has(d.id)),
    }));
    localStorage.setItem(
      SCHEDULE_STORAGE_PREFIX + scheduleDate,
      JSON.stringify(filtered)
    );
  }, [todaySchedules, scheduleDate, todayKey, prescriptionGroups]);

  // 주간 달력에 표시할 "과거 날짜의 실제 저장 일정" 모음.
  // 오늘 저장된 복용 체크는 날짜가 지나면 그대로 과거 기록이 되므로,
  // 복용 확인을 누르지 않은 슬롯은 달력에서 자동으로 미복용(miss)으로 굳는다.
  const savedSchedulesByDate = useMemo(() => {
    const map = {};
    const base = new Date(todayKey + "T00:00:00");
    for (let offset = -7; offset <= 0; offset++) {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      const key = formatDateKey(d);
      try {
        const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) map[key] = parsed;
      } catch {
        // 손상된 항목은 무시
      }
    }
    // 지금 보고 있는 과거 날짜는 편집 중인 라이브 상태로 덮어써,
    // TodayScheduleCard 의 복용/부분복용/미복용이 달력에 즉시 반영되게 한다.
    if (scheduleDate < todayKey) {
      map[scheduleDate] = todaySchedules;
    }
    return map;
    // todaySchedules 가 바뀌면 오늘 분 localStorage 도 갱신되므로 의존성에 포함
  }, [todayKey, todaySchedules, scheduleDate]);

  // 헤더 날짜 변경 시 날짜와 그 날의 일정을 함께 갱신
  const handleScheduleDateChange = (newDate) => {
    if (!newDate) return;
    setScheduleDate(newDate);
    setTodaySchedules(loadSchedulesForDate(newDate, todayKey));
  };

  // 주간 달력은 항상 실제 오늘 기준 데이터를 사용
  const weekTodaySchedules =
    scheduleDate === todayKey
      ? todaySchedules
      : loadSchedulesForDate(todayKey, todayKey);

  // 활성 그룹의 약만 일정에 노출 (오늘부터 적용 — 과거 기록은 그 당시 약을 그대로 보존)
  const filterToActiveDrugs = (schedules) =>
    schedules.map((s) => ({
      ...s,
      drugs: s.drugs.filter((d) => activeDrugIds.has(d.id)),
    }));

  // 과거 날짜를 보고 있을 때는 그 시점의 기록을 유지(필터 미적용)
  const isPastSchedule = scheduleDate < todayKey;
  const displaySchedules = isPastSchedule
    ? todaySchedules
    : filterToActiveDrugs(todaySchedules);

  // 주간 달력의 "오늘" 셀은 항상 실제 오늘 기준이라 활성 필터 적용
  const weekDisplaySchedules = filterToActiveDrugs(weekTodaySchedules);

  // 처방 목록에 표시할 "복용일정" = 그 그룹의 약이 포함된 일정 슬롯(아침·점심·저녁)
  // 복용량은 백엔드 값이 있으면 그것을 우선 사용(없으면 기본값)
  const prescriptionsForList = activeGroups.map((g) => {
    const slots = displaySchedules
      .filter((slot) => slot.drugs.some((d) => d.id === g.drugId))
      .map((slot) => slot.label);
    return {
      ...g,
      dosage: backendDosageByName[g.groupName] ?? g.dosage,
      scheduleLabel: slots.length > 0 ? slots.join(" · ") : "-",
    };
  });

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
    // 오늘/미래는 활성 그룹 기준, 과거는 그 당시 보이는 모든 약 기준으로 토글
    const isActiveOnly = scheduleDate >= todayKey;
    setTodaySchedules((prev) =>
      prev.map((s) => {
        if (s.id !== scheduleId) return s;
        const target = isActiveOnly
          ? s.drugs.filter((d) => activeDrugIds.has(d.id))
          : s.drugs;
        const allTaken = target.length > 0 && target.every((d) => d.taken);
        return {
          ...s,
          drugs: s.drugs.map((d) => {
            const inTarget = !isActiveOnly || activeDrugIds.has(d.id);
            return inTarget ? { ...d, taken: !allTaken } : d;
          }),
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
            <MedicationProgressCard schedules={displaySchedules} />

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
              records={savedRecords}
              todayKey={todayKey}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>

          {/* 오른쪽 영역 */}
          <div className="w-full min-w-0 flex flex-col gap-8">
            <TodayScheduleCard
              schedules={displaySchedules}
              scheduleDate={scheduleDate}
              todayKey={todayKey}
              onDateChange={handleScheduleDateChange}
              onToggleDrug={handleToggleDrug}
              onToggleAllDrugs={handleToggleAllDrugs}
            />
            <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-8">
              <MemoCard />
              <WeeklyCalendarCard
                todaySchedules={weekDisplaySchedules}
                drugNames={prescriptionGroups.map((g) => g.groupName)}
                prnRecords={savedRecords}
                todayKey={todayKey}
                savedSchedulesByDate={savedSchedulesByDate}
              />
            </div>
          </div>
        </section>

        {/* 처방 약 목록 */}
        <section className="mt-6">
          <PrescriptionListCard
            prescriptions={prescriptionsForList}
            onSelectGroup={openPrescriptionModal}
          />
        </section>
      </div>

      <BloodPressureRecordModal
        isOpen={isBloodPressureModalOpen}
        onClose={() => setIsBloodPressureModalOpen(false)}
      />

      <PrescriptionDetailModal
        key={selectedGroup?.id ?? "none"}
        open={isPrescriptionModalOpen}
        group={selectedGroupLive}
        onClose={closePrescriptionModal}
        onDeleteMedicine={handleDeleteMedicine}
        onUpdateMedicine={handleUpdateMedicine}
      />
    </div>
  );
}
