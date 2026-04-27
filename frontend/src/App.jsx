import { Routes, Route, Link } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/user/LoginPage";
// import SignUpPage from "./pages/user/SignUpPage";
// import BoardListPage from "./pages/board/BoardListPage";
// import PostCreatePage from "./pages/board/PostCreatePage";
// import PostEditPage from "./pages/board/PostEditPage";
// import PostDetailPage from "./pages/board/PostDetailPage";
import ExercisePage from "./pages/exercise/ExercisePage";

function App() {
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
            </div>
          </nav>
        </div>
      </header>
      {/* 메인 콘텐츠*/}
      <main>
        <Routes>
          {/* <Route path="/" element={<HomePage />} />{" "} */}
          {/* <Routes> -> 페이지 이동 경로 */}
          {/* <Route path="/signup" element={<SignUpPage />} /> */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/" element={<ExercisePage />} />
          {/* <Route path="/" element={<MealPage />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
