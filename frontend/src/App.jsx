import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
import DiseasePage from './pages/user/DiseasePage';
import BoardListPage from './pages/board/BoardListPage';
import PostCreatePage from './pages/board/PostCreatePage';
import PostEditPage from './pages/board/PostEditPage';
import PostDetailPage from './pages/board/PostDetailPage';
import RecordSummary from './pages/recordRead/RecordSummary';
import MainPage from './pages/main/MainPage';
import MedicationPage from './pages/MedicationPage';
import Header from './components/Header'
import HealthIndicatorMenu from './components/HealthMenu';
import SummaryCard from './components/SummaryCard';



function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();

  const hideHealthMenu =
    location.pathname === '/home' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/posts/create' ||
    location.pathname === '/medication' ||
    location.pathname.startsWith('/posts/');
   // 앞으로 추가할 페이지 중 우측바 안뜨는 페이지는 location으로 경로설정

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="py-12">
      <Header isLoggedIn={false} />

      <div className="min-w-screen bg-white flex justify-end">
        <div className="flex-1"></div>
        {/* 메인 콘텐츠*/}
        <Routes>
          <Route path="/" element={<RecordSummary />} />
          
          {/* <Routes> -> 페이지 이동 경로 */}
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
        {!hideHealthMenu && <HealthIndicatorMenu />}
      </div>
      </main>
    </div>
  );
}

export default App;
