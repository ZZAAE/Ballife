# RN(Expo) 포팅 규약 — 서브에이전트 공통 참조

웹(`c:\Gabia_2026\Ballife\frontend\src`)의 페이지를 Expo(`frontend_expo`)로 포팅할 때 반드시 따른다.

## 라우팅 (expo-router, 파일 기반)
- 라우트 파일 위치: `frontend_expo/src/app/`
- 경로→파일 매핑 예: `/check/meal` → `src/app/check/meal.jsx`, `/posts/:postId` → `src/app/posts/[postId].jsx`
- 화면 컴포넌트는 **default export**.
- 네비게이션: `import { useRouter, Link, useLocalSearchParams } from "expo-router"`.
  - `navigate("/x")` → `router.push("/x")`, `navigate("/x",{replace:true})` → `router.replace("/x")`
  - URL 파라미터: `useParams()` → `useLocalSearchParams()`
  - 화면 간 state 전달: web의 `navigate(path,{state})` → `router.push({ pathname, params })` + 받는 쪽 `useLocalSearchParams()`

## 컴포넌트 변환 (DOM → RN)
- `<div>`→`<View>`, `<span>/<p>/<h1>`→`<Text>` (모든 텍스트는 반드시 `<Text>` 안에), `<button>`→`<Pressable>`, `<input>`→`<TextInput>`, `<img>`→`<Image>`(expo-image 또는 RN Image), 스크롤 필요시 `<ScrollView>` 또는 `<FlatList>`.
- `<select>` → `@react-native-picker/picker` 의 `<Picker>`.
- onClick→onPress, onChange(e=>e.target.value)→onChangeText(value). form submit→버튼 onPress 함수.
- HTML 문자열 렌더(Quill 등) → `react-native-render-html` 의 `<RenderHtml source={{html}} contentWidth={width}/>`.
- Unity WebGL / 외부 임베드 → `react-native-webview` 의 `<WebView source={{uri}}/>`; 불가하면 안내 카드 플레이스홀더.

## 스타일 (NativeWind — className 그대로 Tailwind)
- className 사용. **잠긴 디자인 시스템 토큰 유지**:
  - 페이지 bg `bg-[#F9FAFB]`, 카드 `bg-white rounded-[18px] border border-[#E5E7EB] p-6`
  - 본문 `text-[#0F172A]`, 보조 `text-[#64748B]`, 흐림 `text-[#94A3B8]`, 보더 `#E5E7EB`
  - 페이지 타이틀 `text-[26px] font-extrabold`, 섹션 `text-[18px] font-bold`
- 최상단은 `import { SafeAreaView } from "react-native-safe-area-context"` 로 감싸고 `flex-1 bg-[#F9FAFB]`.
- RN은 일부 웹 CSS 미지원: `gap`은 지원, `grid`는 미지원(→ flex-row/flex-wrap), `position:fixed` 없음(→ absolute), shadow는 단순화 가능.
- 인라인 px 폰트(text-[14px] 등)·색은 그대로 유지.

## 데이터/로직 (절대 변경 금지)
- API: `import api from "../../api/api"` 또는 도메인별 `import boardApi from "../../api/boardApi"` 등 — **이미 포팅된 `frontend_expo/src/api/*` 사용** (경로 깊이에 맞게 ../ 조정).
- 인증: `import { useAuth } from "../../context/AuthContext"` → `{ user, isAuthenticated, login, logout }`.
- 토스트: `import toast from "../../lib/toast"` (`.success/.error/.info`).
- AI 주소 필요시: `import { AI_SERVICE_BASE_URL } from "../../lib/runtime"`.
- 토큰 직접 읽기: `import { getToken } from "../../lib/tokenStore"` (`getToken()`), localStorage 사용 금지.
- 비즈니스 로직·검증·상태·API 호출·핸들러는 **원본 그대로** 유지. 가짜 데이터 추가 금지. 빈 상태/데이터 상태 구분 유지.

## 금지
- `localStorage`/`window`/`document`/DOM API/`import.meta` 사용 금지.
- web 전용 라이브러리(recharts, quill, react-router-dom, react-hot-toast, react-unity-webgl) import 금지 → 위 RN 대체 사용.
- 차트는 무거운 라이브러리 대신 `react-native-svg` 또는 단순 View 바/요약으로 표현(데이터는 실제 값 사용).
