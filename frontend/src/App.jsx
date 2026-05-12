import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState } from 'react';

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
import HealthCalenderPage from './pages/main/HealthCalenderPage';
import AllRecordPage from './pages/AllRecordPage';
import UserInformation from './pages/user/UserInformation'

function App() {
  const location = useLocation();
  const hideHealthMenu =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/posts/create' ||
    location.pathname === '/intro/web' ||
    location.pathname === '/intro/osteoporosis' ||
    location.pathname === '/intro/diabetes' ||
    location.pathname === '/intro/gout' ||
    location.pathname === '/intro/hypertension' ||
    location.pathname === '/intro/dyslipidemia' ||
    location.pathname === '/intro/obesity' ||
    location.pathname === '/AllRecordPage'||
    location.pathname === '/' ||
    location.pathname.startsWith('/posts/');

  const hideChatbot =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/intro/web' ||
    location.pathname === '/intro/osteoporosis' ||
    location.pathname === '/intro/diabetes' ||
    location.pathname === '/intro/gout' ||
    location.pathname === '/intro/hypertension' ||
    location.pathname === '/intro/dyslipidemia' ||
    location.pathname === '/intro/obesity' ||
    location.pathname.startsWith('/posts/');

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-12">
        <Header isLoggedIn={false} />
        <div className="min-w-screen bg-white flex justify-end">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />

         
              <Route path="/boards" element={<BoardListPage />} />
              <Route path="/posts/create" element={<PostCreatePage />} />
              <Route path="/posts/:id/edit" element={<PostEditPage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />

              <Route path="/check/all" element={<RecordSummary />} />
              <Route path="/check/meal" element={<MealPage />} />
              <Route path="/check/weight" element={<WeightRecord />} />
              <Route
                path="/check/blood-pressure"
                element={<BloodPressureRecord />}
              />
              <Route path="/check/blood-sugar" element={<BloodSugarRecord />} />
              <Route
                path="/check/exercise"
                element={
                  <ExercisePage
                    isModalOpen={isExerciseModalOpen}
                    onCloseModal={() => setIsExerciseModalOpen(false)}
                  />
                }
              />
              <Route path="/check/medicine" element={<MedicationPage />} />

              <Route path="/member" element={<UserInformation />} />

              <Route path="/allRecord" element={<AllRecordPage />} />
              <Route path="/intro/web" element={<MainReportPage />} />
              <Route path="/intro/osteoporosis" element={<OsteoporosisReportPage />} />
              <Route path="/intro/diabetes" element={<DiabetesReportPage />} />
              <Route path="/intro/gout" element={<GoutReportPage />} />
              <Route path="/intro/hypertension" element={<HypertensionReportPage />} />
              <Route path="/intro/hyperlipidemia" element={<DyslipidemiaReportPage />} />
              <Route path="/intro/obesity" element={<ObesityReportPage />} />
              <Route path="/healthcalendar" element={<HealthCalenderPage />} />

            </Routes>
          </div>
        {!hideHealthMenu && <HealthIndicatorMenu />}
        
      </div>

      </main>
    </div>
  );
}

export default App;
