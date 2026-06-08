import { Redirect } from "expo-router";

// 구 경로 /home → 실제 대시보드(/dashboard)로 통합 리다이렉트.
export default function HomeRedirect() {
  return <Redirect href="/dashboard" />;
}
