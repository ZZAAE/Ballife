import { Redirect } from "expo-router";

// 루트(/) 진입: 앱을 처음 열면 항상 로그인 화면부터 시작한다.
// (자동 로그인으로 대시보드로 건너뛰지 않음)
export default function Index() {
  return <Redirect href="/login" />;
}
