import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
import UserInformation from './pages/user/UserInformation';
import DiseasePage from './pages/user/DiseasePage';
import BoardListPage from './pages/board/BoardListPage';
import PostCreatePage from './pages/board/PostCreatePage';
import PostEditPage from './pages/board/PostEditPage';
import PostDetailPage from './pages/board/PostDetailPage';
import MainPage from './pages/main/MainPage';
import WeightRecord from './pages/AllRecordRead/WeightRecord';
import BloodPressureRecord from './pages/AllRecordRead/BloodPressureRecord';
import BloodSugarRecord from './pages/AllRecordRead/BloodSugarRecord';
import ExercisePage from './pages/ExercisePage';
import RecordPage from './pages/AllRecordRead/RecordPage';
import RecordSummary from './pages/AllRecordRead/RecordSummary';
import MealPage from './pages/MealPage';
import MainReportPage from './pages/report/MainReportPage';
import MedicationPage from './pages/MedicationPage'
import OsteoporosisReportPage from './pages/report/OsteoporosisReportPage';
import DiabetesReportPage from './pages/report/DiabetesReportPage';
import GoutReportPage from './pages/report/GoutReportPage';
import HypertensionReportPage from './pages/report/HypertensionReportPage';
import DyslipidemiaReportPage from './pages/report/DyslipidemiaReportPage';
import ObesityReportPage from './pages/report/ObesityReportPage';
import Header from './components/Header';
import HealthIndicatorMenu from './components/HealthMenu';
import SummaryCard from './components/SummaryCard';
import AllRecordPage from './pages/recordRead/AllRecordPage'


function App() {
  // AuthProvider가 내려주는 값: 로그인 사용자, 여부, 로그아웃 함수 등
  const { user, isAuthenticated, logout } = useAuth();

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
        </Routes>
        {!hideHealthMenu && <HealthIndicatorMenu />}
      </div>
      </main>
    </div>
  );
}

export default App;