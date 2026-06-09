// 처방 약 그룹 = 약 페이지 전체(처방 목록 · 복용 일정 · 이행률 · 주간 달력)의 단일 데이터 소스.
// 데이터는 백엔드 처방전(getPrescriptions + getUserMedicine)에서 받아 변환한다.
// drugId 는 복용 일정 슬롯의 약 식별자와 연결된다 (presc-{prescriptionId}).
const STORAGE_KEY = "prescriptionGroups";

// 더미 데이터 제거 — 실제 데이터는 백엔드에서 받아온다.
export const DEFAULT_PRESCRIPTION_GROUPS = [];

// 복용 시간대 → 일정 슬롯 정의. keyword 는 백엔드 intakeIntervals("아침,점심,저녁") 매칭용.
export const SCHEDULE_SLOTS = [
  { id: "morning", label: "아침", time: "08:00", keyword: "아침" },
  { id: "lunch", label: "점심", time: "13:00", keyword: "점심" },
  { id: "dinner", label: "저녁", time: "19:00", keyword: "저녁" },
  { id: "bedtime", label: "취침전", time: "22:00", keyword: "취침전" },
];

// 백엔드 처방전 목록(약 목록 포함) → 약 페이지용 그룹 구조로 변환
export const mapPrescriptionsToGroups = (prescriptions) =>
  (prescriptions || []).map((p) => ({
    id: p.prescriptionId,
    prescriptionId: p.prescriptionId,
    groupName: p.prescriptionName || "이름 없음",
    drugId: `presc-${p.prescriptionId}`,
    dosage: p.dosage || "-",
    intakeTime: p.prescriptionDate || "",
    // 관리 시작일 = 처방전 등록일 (이 날짜부터 복용 일정/달력에 반영)
    startDate: p.prescriptionDate || null,
    intakeIntervals: p.intakeIntervals || "",
    memo: p.memo || "",
    medicines: (p.medicines || []).map((m) => ({
      id: m.userMedicationId,
      name: m.medicineName || "이름 없음",
      purpose: "",
      dosageText: p.dosage || "",
      imageType: "white",
    })),
  }));

// 그룹들의 복용 시간대를 기준으로 특정 날짜(dateKey)의 복용 일정 슬롯을 만든다.
// 각 슬롯에는 그 시간대를 포함하고, 등록일(startDate)이 dateKey 이전인 그룹만 들어간다.
// (dateKey 를 주지 않으면 날짜 제한 없이 모든 그룹을 포함)
export const buildSchedulesFromGroups = (groups, dateKey) => {
  const list = Array.isArray(groups) ? groups : [];
  return SCHEDULE_SLOTS.map((slot) => {
    const drugs = list
      .filter(
        (g) =>
          g.medicines.length > 0 &&
          (g.intakeIntervals || "").includes(slot.keyword) &&
          (!dateKey || !g.startDate || g.startDate <= dateKey),
      )
      .map((g) => ({ id: g.drugId, name: g.groupName, taken: false }));
    return {
      id: slot.id,
      label: slot.label,
      time: slot.time,
      name: `${slot.label} 복용약`,
      note: "",
      drugs,
    };
  }).filter((s) => s.drugs.length > 0);
};

export const loadPrescriptionGroups = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // 무시
  }
  return [];
};

export const savePrescriptionGroups = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // 저장 실패는 무시
  }
};
