import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
import MedicationPage from './pages/MedicationPage';
// import DiseasePage from './pages/user/DiseasePage';
import BoardListPage from './pages/board/BoardListPage';
import PostCreatePage from './pages/board/PostCreatePage';
// import PostEditPage from './pages/board/PostEditPage';
// import PostDetailPage from './pages/board/PostDetailPage';
// import MainPage from './pages/main/MainPage';
import Header from './components/Header'
import HealthIndicatorMenu from './components/HealthMenu';


function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <Header isLoggedIn={false} />
<div className="flex pt-14">

      {/* 메인 콘텐츠*/}
      <main className="flex-1 ">
    <Routes>
      <Route path="/" element={<MedicationPage />} />

      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/boards" element={<BoardListPage />} />
      <Route path="/posts/create" element={<PostCreatePage />} />
    </Routes>
  </main>
      <div className="min-h-screen bg-white flex justify-end">
        <HealthIndicatorMenu />
      </div>
    </div>
  </div>
  );
}

export default App;
