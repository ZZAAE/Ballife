// 처방 약 그룹 = 약 페이지 전체(처방 목록 · 복용 일정 · 이행률 · 주간 달력)의 단일 데이터 소스.
// drugId 는 복용 일정 슬롯의 약 식별자와 연결된다 (bp = 혈압약, diabetes = 당뇨약).
// 그룹의 medicines 가 모두 삭제되면(빈 그룹) 활성 그룹에서 제외되어 페이지 전체에서 사라진다.
const STORAGE_KEY = "prescriptionGroups";

export const DEFAULT_PRESCRIPTION_GROUPS = [
  {
    id: 1,
    groupName: "혈압약",
    drugId: "bp",
    dosage: "5정",
    intakeTime: "2026-05-15 18:30",
    medicines: [
      {
        id: 101,
        name: "암로디핀정 5mg",
        purpose: "혈압 조절",
        dosageText: "1일 1회, 식후 복용",
        imageType: "white",
      },
      {
        id: 102,
        name: "로사르탄정 50mg",
        purpose: "혈압 안정화",
        dosageText: "1일 1회, 아침 식후 복용",
        imageType: "pink",
      },
    ],
  },
  {
    id: 2,
    groupName: "당뇨약",
    drugId: "diabetes",
    dosage: "3정",
    intakeTime: "2026-05-15 18:30",
    medicines: [
      {
        id: 201,
        name: "다이아벡스정 500mg",
        purpose: "혈당 강하제",
        dosageText: "1일 2회, 식사 직후 복용",
        imageType: "whiteBlue",
      },
      {
        id: 202,
        name: "자누비아정 100mg",
        purpose: "인슐린 분비 조절",
        dosageText: "1일 1회, 식사와 관계없이 복용",
        imageType: "yellow",
      },
      {
        id: 203,
        name: "아마릴정 2mg",
        purpose: "인슐린 분비 촉진",
        dosageText: "1일 1회, 아침 식전 또는 직후",
        imageType: "green",
      },
    ],
  },
];

const cloneGroups = (groups) =>
  groups.map((g) => ({ ...g, medicines: g.medicines.map((m) => ({ ...m })) }));

export const loadPrescriptionGroups = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // 무시하고 기본 데이터 사용
  }
  return cloneGroups(DEFAULT_PRESCRIPTION_GROUPS);
};

export const savePrescriptionGroups = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // 저장 실패는 무시
  }
};
