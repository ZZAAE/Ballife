import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import SignUpPage from "./pages/user/SignUpPage";
import LoginPage from "./pages/user/LoginPage";
import DiseasePage from "./pages/user/DiseasePage";

import BoardListPage from "./pages/board/BoardListPage";
import PostCreatePage from "./pages/board/PostCreatePage";
import PostEditPage from "./pages/board/PostEditPage";
import PostDetailPage from "./pages/board/PostDetailPage";

import RecordSummary from "./pages/recordRead/RecordSummary";
import MainPage from "./pages/main/MainPage";
import MedicationPage from "./pages/MedicationPage";

import Header from "./components/Header";
import HealthIndicatorMenu from "./components/HealthMenu";

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideHealthMenu =
    location.pathname === "/home" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/boards" ||
    location.pathname === "/posts/create" ||
    location.pathname.startsWith("/posts/");

  return (
    <div
      className="h-screen w-screen bg-gray-100 overflow-hidden"
      style={{ fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" }}
    >
      {/* 상단 Header 고정 */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[58px]">
        <Header isLoggedIn={isAuthenticated} />
      </div>

      {/* Header 아래 전체 영역 */}
      <div className="fixed left-0 right-0 bottom-0 top-[58px] overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full w-full">
          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<RecordSummary />} />

              <Route path="/home" element={<MainPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/disease" element={<DiseasePage />} />

              <Route path="/boards" element={<BoardListPage />} />
              <Route path="/posts/create" element={<PostCreatePage />} />
              <Route path="/posts/:id/edit" element={<PostEditPage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />

              <Route path="/medication" element={<MedicationPage />} />
            </Routes>
          </main>

          {/* 오른쪽 HealthMenu */}
          {!hideHealthMenu && (
            <aside className="hidden lg:block w-[365px] flex-shrink-0 border-l border-gray-200 bg-white">
              <HealthIndicatorMenu />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;