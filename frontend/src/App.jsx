import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/user/SignUpPage';
import LoginPage from './pages/user/LoginPage';
import BoardListPage from './pages/board/BoardListPage';
import PostCreatePage from './pages/board/PostCreatePage';
import PostEditPage from './pages/board/PostEditPage';
import PostDetailPage from './pages/board/PostDetailPage';
import MainPage from './pages/main/MainPage';
import WeightRecord from './pages/AllRecordRead/WeightRecord';
import BloodPressureRecord from './pages/AllRecordRead/BloodPressureRecord';
import BloodSugarRecord from './pages/AllRecordRead/BloodSugarRecord';
import RecordPage from './pages/AllRecordRead/RecordPage';
import MainReportPage from './pages/report/MainReportPage';
import OsteoporosisReportPage from './pages/report/OsteoporosisReportPage';
import DiabetesReportPage from './pages/report/DiabetesReportPage';
import GoutReportPage from './pages/report/GoutReportPage';
import HypertensionReportPage from './pages/report/HypertensionReportPage';
import DyslipidemiaReportPage from './pages/report/DyslipidemiaReportPage';
import ObesityReportPage from './pages/report/ObesityReportPage';
import Header from './components/Header';
import HealthIndicatorMenu from './components/HealthMenu';
import HealthCalenderPage from './pages/main/HealthCalenderPage';
import AllRecordPage from './pages/AllRecordPage';


function App() {
  const hideHealthMenu =
    location.pathname === '/home' ||
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
    location.pathname === '/AllRecordPage' ||

    location.pathname.startsWith('/posts/');

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-12">
      <Header isLoggedIn={false} />
      <div className="min-w-screen bg-white flex justify-end">
        <div className="flex-1">
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<MainPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/allRecord" element={<AllRecordPage />} />
          <Route path="/weight" element={<WeightRecord />} />
          <Route path="/pressure" element={<BloodPressureRecord />} />
          <Route path="/sugar" element={<BloodSugarRecord />} />
          <Route path="/records" element={<RecordPage />} />
          <Route path="/mainreport" element={<MainReportPage />} />
          <Route path="/osteoporosis" element={<OsteoporosisReportPage />} />
          <Route path="/diabetes" element={<DiabetesReportPage />} />
          <Route path="/gout" element={<GoutReportPage />} />
          <Route path="/hypertension" element={<HypertensionReportPage />} />
          <Route path="/dyslipidemia" element={<DyslipidemiaReportPage />} />
          <Route path="/obesity" element={<ObesityReportPage />} />
          <Route path="/healthcalendar" element={<HealthCalenderPage />} />
          <Route path="/allrecords" element={<AllRecordPage />} />
        </Routes>
        </div>
        {!hideHealthMenu && <HealthIndicatorMenu />}
      </div>

      </main>
    </div>
  );
}

export default App;
