import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/user/SignUpPage";
import LoginPage from "./pages/user/LoginPage";
import DiseasePage from "./pages/user/DiseasePage";
import BoardListPage from "./pages/board/BoardListPage";
import PostCreatePage from "./pages/board/PostCreatePage";
import PostEditPage from "./pages/board/PostEditPage";
import PostDetailPage from "./pages/board/PostDetailPage";
import MainPage from "./pages/main/MainPage";
import RecordPage from "./pages/RecordPage";
import HealthIndicatorMenu from "./components/HealthMenu";
import Header from "./components/Header";

function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="py-12">
        <Header isLoggedIn={false} />

        <div className="min-w-screen bg-white flex justify-end">
          <div className="flex-1"></div>
          {/* 메인 콘텐츠*/}
          <Routes>
            <Route path="/" element={<HomePage />} />{" "}
            {/* <Routes> -> 페이지 이동 경로 */}
            <Route path="/home" element={<MainPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/disease" element={<DiseasePage />} />
            <Route path="/boards" element={<BoardListPage />} />
            <Route path="/posts/create" element={<PostCreatePage />} />
            <Route path="/posts/:id/edit" element={<PostEditPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/record" element={<RecordPage />} />
          </Routes>
          <HealthIndicatorMenu />
        </div>
      </main>
    </div>
  );
}

export default App;
