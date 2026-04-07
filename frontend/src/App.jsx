<<<<<<< HEAD
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
=======
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
import BoardListPage from './pages/board/BoardListPage';
import PostCreatePage from './pages/board/PostCreatePage';
import PostEditPage from './pages/board/PostEditPage';
import PostDetailPage from './pages/board/PostDetailPage';


>>>>>>> 5109e6fb50a825d86fedb02913bf3e86e4ebe272

function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* 로고 Link -> <a> */}
            <Link to="/" className="text-2xl font-bold text-blue-600">
              발리페
            </Link>

            {/* 메뉴 */}
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  {/* nickname 우선, 없으면 username 표시 */}
                  <span className="text-gray-600">
                    {user?.nickname || user?.username}님
                  </span>
                  {/* 로그아웃: AuthContext의 logout (state + localStorage 정리 등) */}
                  <button
                    type="button"
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      {/* 메인 콘텐츠*/}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />{" "}
          {/* <Routes> -> 페이지 이동 경로 */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
