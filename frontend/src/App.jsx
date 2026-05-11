import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/user/SignUpPage";
import LoginPage from "./pages/user/LoginPage";
import DiseasePage from "./pages/user/DiseasePage";
import UserInformation from "./pages/user/UserInformation";
import BoardListPage from "./pages/board/BoardListPage";
import PostCreatePage from "./pages/board/PostCreatePage";
import PostEditPage from "./pages/board/PostEditPage";
import PostDetailPage from "./pages/board/PostDetailPage";
import RecordSummary from "./pages/AllRecordRead/RecordSummary";
import MainPage from "./pages/main/MainPage";
import ExercisePage from "./pages/ExercisePage";
import Header from "./components/Header";
import HealthIndicatorMenu from "./components/HealthMenu";
import SummaryCard from "./components/SummaryCard";


function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const usePageLayout =
    location.pathname === "/member" ||
    location.pathname === "/exercise" ||
    location.pathname === "/check/exercise";

  const hideHealthMenu =
    usePageLayout ||
    location.pathname === "/home" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/boards" ||
    location.pathname === "/posts/create" ||
    location.pathname.startsWith("/posts/");
  // 앞으로 추가할 페이지 중 우측바 안뜨는 페이지는 location으로 경로설정

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {!usePageLayout && <Header isLoggedIn={isAuthenticated} />}

        {usePageLayout ? (
          <Routes>
            <Route path="/" element={<RecordSummary />} />

            {/* <Routes> -> 페이지 이동 경로 */}
            <Route path="/home" element={<MainPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/disease" element={<DiseasePage />} />
            <Route path="/member" element={<UserInformation />} />
            <Route path="/exercise" element={<ExercisePage />} />
            <Route path="/check/exercise" element={<ExercisePage />} />
            <Route path="/boards" element={<BoardListPage />} />
            <Route path="/posts/create" element={<PostCreatePage />} />
            <Route path="/posts/:id/edit" element={<PostEditPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/check" element={<SummaryCard />} />
            <Route path="/check/weight" element={<SummaryCard />} />
            <Route path="/check/blood-sugar" element={<SummaryCard />} />
            <Route path="/check/blood-pressure" element={<SummaryCard />} />
          </Routes>
        ) : (
          <div className="flex min-h-screen w-full bg-white pt-[55px]">
            <div className="min-w-0 flex-1">
              <Routes>
                <Route path="/" element={<RecordSummary />} />

                {/* <Routes> -> 페이지 이동 경로 */}
                <Route path="/home" element={<MainPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/disease" element={<DiseasePage />} />
                <Route path="/member" element={<UserInformation />} />
                <Route path="/exercise" element={<ExercisePage />} />
                <Route path="/check/exercise" element={<ExercisePage />} />
                <Route path="/boards" element={<BoardListPage />} />
                <Route path="/posts/create" element={<PostCreatePage />} />
                <Route path="/posts/:id/edit" element={<PostEditPage />} />
                <Route path="/posts/:postId" element={<PostDetailPage />} />
              </Routes>
            </div>
            {!hideHealthMenu && <HealthIndicatorMenu />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
