// 처방 약 그룹 = 약 페이지 전체(처방 목록 · 복용 일정 · 이행률 · 주간 달력)의 단일 데이터 소스.
// 데이터는 백엔드 처방전(getPrescriptions + getUserMedicine)에서 받아 변환한다.
// drugId 는 복용 일정 슬롯의 약 식별자와 연결된다 (presc-{prescriptionId}).
import i18n from "../../i18n";

const STORAGE_KEY = "prescriptionGroups";

// 더미 데이터 제거 — 실제 데이터는 백엔드에서 받아온다.
export const DEFAULT_PRESCRIPTION_GROUPS = [];

// 복용 시간대 → 일정 슬롯 정의.
// keyword 는 백엔드 intakeIntervals("아침,점심,저녁") 매칭용(한글 고정, 변경 금지),
// label 은 표시용이라 현재 언어로 lazy 해석.
function scheduleSlot(id, time, keyword) {
  return {
    id,
    time,
    keyword,
    get label() {
      return i18n.t(`medication.slot.${id}`);
    },
  };
}

export const SCHEDULE_SLOTS = [
  scheduleSlot("morning", "08:00", "아침"),
  scheduleSlot("lunch", "13:00", "점심"),
  scheduleSlot("dinner", "19:00", "저녁"),
  scheduleSlot("bedtime", "22:00", "취침전"),
];

// 백엔드 처방전 목록(약 목록 포함) → 약 페이지용 그룹 구조로 변환
export const mapPrescriptionsToGroups = (prescriptions) =>
  (prescriptions || []).map((p) => ({
    id: p.prescriptionId,
    prescriptionId: p.prescriptionId,
    groupName: p.prescriptionName || i18n.t("medication.noName"),
    drugId: `presc-${p.prescriptionId}`,
    dosage: p.dosage || "-",
    intakeTime: p.prescriptionDate || "",
    // 관리 시작일 = 처방전 등록일 (이 날짜부터 복용 일정/달력에 반영)
    startDate: p.prescriptionDate || null,
    intakeIntervals: p.intakeIntervals || "",
    memo: p.memo || "",
    medicines: (p.medicines || []).map((m) => ({
      id: m.userMedicationId,
      name: m.medicineName || i18n.t("medication.noName"),
      purpose: "",
      dosageText: p.dosage || "",
      imageType: "white",
      // 주성분 다국어 병기용(백엔드 약품 캐시에서 채움, 없으면 undefined)
      ingredientKo: m.ingredientKo || "",
      ingredientEng: m.ingredientEng || "",
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
      name: i18n.t("medication.slotDoseName", { slot: slot.label }),
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
