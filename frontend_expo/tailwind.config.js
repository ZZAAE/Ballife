/** @type {import('tailwindcss').Config} */
// NativeWind 프리셋으로 RN 에서 Tailwind 클래스 사용.
// 잠긴 Ballife 디자인 시스템 토큰은 arbitrary value(예: bg-[#F9FAFB])로 그대로 쓰되,
// 자주 쓰는 값은 theme 에 별칭으로 등록한다.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 디자인 시스템 고정값
        pagebg: "#F9FAFB",
        card: "#FFFFFF",
        ink: "#0F172A", // 본문
        sub: "#64748B", // 보조
        light: "#94A3B8", // 흐린
        line: "#E5E7EB", // 보더
      },
      fontFamily: {
        // Noto Sans KR (expo-font 로 로드 예정; 미로드 시 시스템 폰트 폴백)
        sans: ["NotoSansKR", "System"],
      },
    },
  },
  plugins: [],
};
