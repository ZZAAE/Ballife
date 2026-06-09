import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "./locales/ko/translation.json";
import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";
import zhCN from "./locales/zh-CN/translation.json";

/**
 * 지원 언어 목록. Header 언어 스위처와 백엔드/AI 전달에 동일하게 사용.
 * code 는 BCP-47 (백엔드 Accept-Language, AI lang 파라미터에 그대로 전달).
 */
export const SUPPORTED_LANGUAGES = [
  { code: "ko", label: "한국어", short: "KO" },
  { code: "en", label: "English", short: "EN" },
  { code: "ja", label: "日本語", short: "JP" },
  { code: "zh-CN", label: "简体中文", short: "中" },
];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
      "zh-CN": { translation: zhCN },
    },
    fallbackLng: "ko",
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    // nonExplicitSupportedLngs 는 쓰지 않는다: true 면 isSupportedCode 가 "zh-CN"→"zh" 로
    // 잘라 검사하는데 supportedLngs 엔 "zh-CN" 만 있어 미지원 처리→ko 폴백되는 버그가 있었다.
    // 끄면 i18next 가 en-US→en, zh/zh-Hans-CN→zh-CN 을 resolve hierarchy 로 알아서 매칭한다.
    load: "currentOnly",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      // React 가 XSS 이스케이프를 담당하므로 i18next 측 이스케이프 비활성화
      escapeValue: false,
    },
    // 미번역(빈 문자열) 키는 fallbackLng(ko)로 폴백
    returnEmptyString: false,
  });

export default i18n;
