import i18n from "../i18n";

// 질환 선택 옵션. value 는 백엔드 저장/매칭용 안정 코드(절대 변경 금지),
// label/summary 는 표시용이라 현재 언어로 lazy 해석(getter)한다.
// → option.label 을 읽는 기존 소비 컴포넌트는 수정 없이 번역값을 받는다.
function diseaseOption(name, value, key) {
  return {
    value,
    get label() {
      return i18n.t(value === "NONE" ? "disease.none" : `disease.${name}.${key}`);
    },
  };
}

function diseaseField(name, options) {
  return {
    name,
    get label() {
      return i18n.t(`disease.${name}.field`);
    },
    get summary() {
      return i18n.t(`disease.${name}.summary`);
    },
    options,
  };
}

export const DISEASE_FIELDS = [
  diseaseField("hyperlipidemia", [
    diseaseOption("hyperlipidemia", "NONE", "none"),
    diseaseOption("hyperlipidemia", "type1", "type1"),
    diseaseOption("hyperlipidemia", "type2", "type2"),
    diseaseOption("hyperlipidemia", "type3", "type3"),
    diseaseOption("hyperlipidemia", "type4", "type4"),
  ]),
  diseaseField("hypertension", [
    diseaseOption("hypertension", "NONE", "none"),
    diseaseOption("hypertension", "type1", "type1"),
    diseaseOption("hypertension", "type2", "type2"),
    diseaseOption("hypertension", "type3", "type3"),
  ]),
  diseaseField("osteoporosis", [
    diseaseOption("osteoporosis", "NONE", "none"),
    diseaseOption("osteoporosis", "osteopenia", "osteopenia"),
    diseaseOption("osteoporosis", "osteoporosis", "osteoporosis"),
  ]),
  diseaseField("diabetes", [
    diseaseOption("diabetes", "NONE", "none"),
    diseaseOption("diabetes", "type1", "type1"),
    diseaseOption("diabetes", "type2", "type2"),
    diseaseOption("diabetes", "GESTATIONAL", "gestational"),
  ]),
  diseaseField("gout", [
    diseaseOption("gout", "NONE", "none"),
    diseaseOption("gout", "ASYMPTOMATIC", "asymptomatic"),
    diseaseOption("gout", "ACUTE", "acute"),
    diseaseOption("gout", "INTERMITTENT", "intermittent"),
    diseaseOption("gout", "CHRONIC", "chronic"),
  ]),
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
    if (!option || option.value === "NONE") {
      return [field.summary];
    }

    return [`${field.summary} (${option.label})`];
  });

  return selected.length > 0 ? selected.join(", ") : i18n.t("disease.summaryNone");
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
