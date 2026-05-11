import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
<<<<<<< HEAD
=======
import UserInformation from './pages/user/UserInformation';
import DiseasePage from './pages/user/DiseasePage';
>>>>>>> origin/LYJ0511
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
import MealPage from './pages/MealPage'


function App() {
  const { pathname } = useLocation();

  const hideHealthMenu =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/posts/create' ||
    location.pathname === '/mainreport' ||
    location.pathname === '/osteoporosis' ||
    location.pathname === '/diabetes' ||
    location.pathname === '/gout' ||
    location.pathname === '/hypertension' ||
    location.pathname === '/dyslipidemia' ||
    location.pathname === '/obesity' ||
    location.pathname.startsWith('/posts/');

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-12">
      <Header isLoggedIn={false} />
      <div className="min-w-screen bg-white flex justify-end">
        <div className="flex-1">
        <Routes>

          <Route path="/" element={<MainPage/>} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/member" element={<UserInformation />} />
          <Route path="/disease" element={<DiseasePage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/record" element={<AllRecordPage/>}/>
          <Route path="/check/meal" element={<MealPage/>}/>
        </Routes>
        </div>
        {hideHealthMenu && <HealthIndicatorMenu />}
      </div>

      </main>
    </div>
  );
}

export default App;
