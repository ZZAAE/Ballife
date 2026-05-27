export const DISEASE_FIELDS = [
  {
    name: "hyperlipidemia",
    label: "고지혈증 보유 여부",
    summary: "고지혈증",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "1형" },
      { value: "type2", label: "2형" },
    ],
  },
  {
    name: "hypertension",
    label: "고혈압 보유 여부",
    summary: "고혈압",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "mild", label: "경증" },
      { value: "severe", label: "중증" },
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
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "1형" },
      { value: "type2", label: "2형" },
      { value: "GESTATIONAL", label: "임신성" },
    ],
  },
  {
    name: "gout",
    label: "통풍 보유 여부",
    summary: "통풍",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "ASYMPTOMATIC", label: "고요산혈증" },
      { value: "ACUTE", label: "급성" },
      { value: "INTERMITTENT", label: "간헐기" },
      { value: "CHRONIC", label: "만성" },
    ],
  },
];

export const MEMBER_PROFILE_STORAGE_KEY = "ballife.memberProfileDraft";
export const PROFILE_IMAGE_STORAGE_KEY = "ballife.profileImage";

// localStorage quota 안전한 setItem — 실패해도 앱이 죽지 않도록
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[userProfile] localStorage setItem failed for ${key}:`, error);
    return false;
  }
}

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
  const standaloneImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);

  const merged = {
    ...DEMO_MEMBER_PROFILE,
    ...(loginUser || {}),
    ...(draft || {}),
  };

  // 별도 키로 저장된 이미지가 있으면 우선 적용
  if (standaloneImage) {
    merged.profileImage = standaloneImage;
  }
  return merged;
}

export function persistMemberProfile(profile) {
  const current = loadCachedMemberProfile();
  const resolvedImage =
    profile.profileImage === undefined
      ? current.profileImage
      : profile.profileImage;

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
    profileImage: resolvedImage,
  };

  // 사진은 별도 키로 1회만 저장하고, 다른 키들에는 사진 빼고 저장 — quota 절약
  const withoutImage = { ...next, profileImage: null };
  const serialized = JSON.stringify(withoutImage);
  safeSetItem(MEMBER_PROFILE_STORAGE_KEY, serialized);
  safeSetItem("loginUser", serialized);
  safeSetItem("user", serialized);

  if (resolvedImage) {
    safeSetItem(PROFILE_IMAGE_STORAGE_KEY, resolvedImage);
  } else {
    localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent("member-profile-updated", { detail: next }),
  );
  return next;
}
