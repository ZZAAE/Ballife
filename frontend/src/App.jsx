import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./pages/exercise/components/Header";
import HealthIndicatorMenu from "./pages/exercise/components/HealthMenu";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/user/LoginPage";
import SignUpPage from "./pages/user/SignUpPage";
import BoardListPage from "./pages/board/BoardListPage";
import PostCreatePage from "./pages/board/PostCreatePage";
import PostDetailPage from "./pages/board/PostDetailPage";
import PostEditPage from "./pages/board/PostEditPage";
// import MainPage from "./pages/MainPage";
// import WeightRecord from "./pages/WeightRecord";
// import BloodPressureRecord from "./pages/BloodPressureRecord";
// import BloodSugarRecord from "./pages/BloodSugarRecord";
// import RecordPage from "./pages/RecordPage";
// import MainReportPage from "./pages/MainReportPage";
// import OsteoporosisReportPage from "./pages/OsteoporosisReportPage";
// import DiabetesReportPage from "./pages/DiabetesReportPage";
// import GoutReportPage from "./pages/GoutReportPage";
// import HypertensionReportPage from "./pages/HypertensionReportPage";
// import DyslipidemiaReportPage from "./pages/DyslipidemiaReportPage";
// import ObesityReportPage from "./pages/ObesityReportPage";
import ExercisePage from "./pages/exercise/ExercisePage";
import UserInformation from "./pages/user/UserInformation";

function App() {
  const location = useLocation();
  const isExercisePage = location.pathname === "/exercise";
  const isMemberPage = location.pathname === "/member";

  const hideHealthMenu =
    location.pathname === "/home" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/boards" ||
    location.pathname === "/posts/create" ||
    location.pathname.startsWith("/posts/");

  const hideHeader = false;

  const contentClass = [hideHeader ? "flex-1" : "flex-1 pt-[70px]"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-12">
        {!hideHeader && <Header isLoggedIn={false} />}
        <div className="flex min-h-screen justify-end bg-white">
          <div className={contentClass}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* <Route path="/home" element={<MainPage />} /> */}
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/boards" element={<BoardListPage />} />
              <Route path="/community" element={<BoardListPage />} />
              <Route path="/posts/create" element={<PostCreatePage />} />
              <Route path="/posts/:id/edit" element={<PostEditPage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              {/* <Route path="/weight" element={<WeightRecord />} /> */}
              {/* <Route path="/pressure" element={<BloodPressureRecord />} /> */}
              {/* <Route path="/sugar" element={<BloodSugarRecord />} /> */}
              {/* <Route path="/records" element={<RecordPage />} /> */}
              {/* <Route path="/mainreport" element={<MainReportPage />} /> */}
              {/* <Route path="/osteoporosis" element={<OsteoporosisReportPage />} /> */}
              {/* <Route path="/diabetes" element={<DiabetesReportPage />} /> */}
              {/* <Route path="/gout" element={<GoutReportPage />} /> */}
              {/* <Route path="/hypertension" element={<HypertensionReportPage />} /> */}
              {/* <Route path="/dyslipidemia" element={<DyslipidemiaReportPage />} /> */}
              {/* <Route path="/obesity" element={<ObesityReportPage />} /> */}
              <Route path="/exercise" element={<ExercisePage />} />
              <Route path="/member" element={<UserInformation />} />
            </Routes>
          </div>

          {!hideHealthMenu && (
            <HealthIndicatorMenu
              onRegisterClick={
                isExercisePage
                  ? () => window.dispatchEvent(new Event("open-exercise-modal"))
                  : undefined
              }
              activeMenu={
                isExercisePage ? "exercise" : isMemberPage ? "all" : undefined
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
