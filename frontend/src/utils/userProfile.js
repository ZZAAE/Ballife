export const DISEASE_FIELDS = [
  {
    name: "hyperlipidemia",
    label: "고지혈증 보유 여부",
    summary: "고지혈증",
    options: [
      { value: 'NONE', label: '해당 없음' },
      { value: 'type1', label: '고콜레스테롤혈증' },
      { value: 'type2', label: '고LDL콜레스테롤혈증' },
			{ value: 'type3', label: '고중성지방혈증' },
      { value: 'type4', label: '저HDL콜레스테롤혈증' }
    ],
  },
  {
    name: "hypertension",
    label: "고혈압 보유 여부",
    summary: "고혈압",
    options: [
      { value: 'NONE', label: '해당 없음' },
      { value: 'type1', label: '고혈압 전단계' },
      { value: 'type2', label: '1기' },
			{ value: 'type3', label: '2기' },
    ],
  },
  {
    name: "osteoporosis",
    label: "골다공증 보유 여부",
    summary: "골다공증",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "osteopenia", label: "골감소증" },
      { value: "osteoporosis", label: "골다공증" },
    ],
  },
  {
    name: "diabetes",
    label: "당뇨 보유 여부",
    summary: "당뇨",
    options: [
      { value: 'NONE', label: '해당 없음' },
      { value: 'type1', label: '1형' },
      { value: 'type2', label: '2형' },
      { value: 'GESTATIONAL', label: '임신성' }
    ],
  },
  {
    name: "gout",
    label: "통풍 보유 여부",
    summary: "통풍",
    options: [
      { value: 'NONE', label: '해당 없음' },
      { value: 'ASYMPTOMATIC', label: '고요산혈증' },
      { value: 'ACUTE', label: '급성' },
      { value: 'INTERMITTENT', label: '간헐기' },
      { value: 'CHRONIC', label: '만성' },
    ],
  },
];

export const MEMBER_PROFILE_STORAGE_KEY = "ballife.memberProfileDraft";

export const DEMO_MEMBER_PROFILE = {
  userId: 0,
  username: "김지수",
  nickname: "ballife-wkjgpho2enj",
  birthDate: "1982-08-02",
  email: "jisoo.kim@vitalis.core",
  gender: "남성",
  weight: 78.2,
  height: 170,
  diseaseIndex: "hypertension:mild",
  profileImage: null,
};

export function createEmptyDiseaseForm() {
  return DISEASE_FIELDS.reduce((accumulator, field) => {
    accumulator[field.name] = "NONE";
    return accumulator;
  }, {});
}

export function parseDiseaseIndex(diseaseIndex) {
  const next = createEmptyDiseaseForm();
  if (!diseaseIndex) {
    return next;
  }

  for (const entry of String(diseaseIndex).split(",")) {
    const [rawKey, rawValue] = entry.split(":");
    const key = rawKey?.trim();
    const value = rawValue?.trim();
    if (!key || !value || !(key in next)) {
      continue;
    }
    next[key] = value;
  }

  return next;
}

export function serializeDiseaseForm(formData) {
  return Object.entries(formData)
    .filter(([, value]) => value && value !== "NONE")
    .map(([key, value]) => `${key}:${value}`)
    .join(",");
}

export function formatDiseaseSummary(diseaseIndex) {
  const parsed = parseDiseaseIndex(diseaseIndex);
  const selected = DISEASE_FIELDS.flatMap((field) => {
    const selectedValue = parsed[field.name];
    if (!selectedValue || selectedValue === "NONE") {
      return [];
    }

    const option = field.options.find((item) => item.value === selectedValue);
    if (!option || option.label === "해당 없음") {
      return [field.summary];
    }

    return [`${field.summary} (${option.label})`];
  });

  return selected.length > 0 ? selected.join(", ") : "없음";
}

export function loadCachedMemberProfile() {
  const draft = JSON.parse(
    localStorage.getItem(MEMBER_PROFILE_STORAGE_KEY) || "null",
  );
  const loginUser = JSON.parse(localStorage.getItem("loginUser") || "null");

  return {
    ...DEMO_MEMBER_PROFILE,
    ...(loginUser || {}),
    ...(draft || {}),
  };
}

export function persistMemberProfile(profile) {
  const current = loadCachedMemberProfile();
  const next = {
    ...current,
    id: profile.userId ?? current.userId,
    userId: profile.userId ?? current.userId,
    username: profile.username ?? current.username,
    nickname: profile.nickname ?? current.nickname,
    birthDate: profile.birthDate ?? current.birthDate,
    gender: profile.gender ?? current.gender,
    weight: profile.weight ?? current.weight,
    height: profile.height ?? current.height,
    diseaseIndex: profile.diseaseIndex ?? current.diseaseIndex,
    email: profile.email ?? current.email,
    profileImage:
      profile.profileImage === undefined
        ? current.profileImage
        : profile.profileImage,
  };

  localStorage.setItem(MEMBER_PROFILE_STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem("loginUser", JSON.stringify(next));
  localStorage.setItem("user", JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("member-profile-updated", { detail: next }),
  );
  return next;
}
