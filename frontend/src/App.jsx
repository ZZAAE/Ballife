import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
<<<<<<< HEAD
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
import Header from './components/Header'
import HealthIndicatorMenu from './components/HealthMenu';
import SummaryCard from './components/SummaryCard';

=======
// import HomePage from './pages/HomePage';
// import SignUpPage from './pages/user/SignUpPage';
// import LoginPage from './pages/user/LoginPage';
// import BoardListPage from './pages/board/BoardListPage';
// import PostCreatePage from './pages/board/PostCreatePage';
// import PostEditPage from './pages/board/PostEditPage';
// import PostDetailPage from './pages/board/PostDetailPage';
import MedicationPage from './pages/MedicationPage';
import BloodPressureRecordModal from './modals/BloodPressureRecordModal';
import TestPage from './pages/TestPage';
import Header from './components/Header'
import HealthIndicatorMenu from './components/HealthMenu';
>>>>>>> origin/jisoo0508

function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();
<<<<<<< HEAD

  const hideHealthMenu =
    location.pathname === '/home' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/posts/create' ||
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
=======

  return (
    
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}

      {/* 헤더 */}
      <Header isLoggedIn={false} />

      <div className="min-h-screen bg-white flex justify-end">
        <HealthIndicatorMenu />
      </div>
     
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* 로고 Link -> <a> */}
            <Link to="/" className="text-2xl font-bold text-blue-600">
              발리페
            </Link>

            {/* 메뉴 */}
            <div className="flex items-center gap-6">
              <Link 
               to="/boards" 
               className="text-gray-600 hover:text-blue-600 transition"
              >
                커뮤니티
              </Link>
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
      {/* 메인 콘텐츠*/}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />{" "}
          {/* <Routes> -> 페이지 이동 경로 */}
          {/* <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} /> */}
          <Route path="/medication" element={<MedicationPage />} />
          <Route path="/blood-pressure" element={<BloodPressureRecordModal />} />
          <Route path="/test" element={<TestPage />} />
>>>>>>> origin/jisoo0508
        </Routes>
        {!hideHealthMenu && <HealthIndicatorMenu />}
      </div>
      </main>
    </div>
  );
}

export default App;
