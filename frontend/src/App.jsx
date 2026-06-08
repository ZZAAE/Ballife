import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState, lazy, Suspense } from "react";
import Header from "./components/Header";
import ChatBot from "./modals/Chatbot";

// ── 라우트 단위 코드 스플리팅 (React.lazy) ──────────────────────────
// 초기 번들을 가볍게 해 첫 화면 로딩/화이트스크린을 줄인다. 각 페이지는
// 해당 경로 진입 시에만 로드된다. (로직/경로/props 변경 없음)
const SignUpPage = lazy(() => import("./pages/user/SignUpPage"));
const LoginPage = lazy(() => import("./pages/user/LoginPage"));
const DiseasePage = lazy(() => import("./pages/user/DiseasePage"));
const ProfileEditPage = lazy(() => import("./pages/user/ProfileEditPage"));
const DiseaseEditPage = lazy(() => import("./pages/user/DiseaseEditPage"));
const BoardListPage = lazy(() => import("./pages/board/BoardListPage"));
const PostCreatePage = lazy(() => import("./pages/board/PostCreatePage"));
const PostEditPage = lazy(() => import("./pages/board/PostEditPage"));
const PostDetailPage = lazy(() => import("./pages/board/PostDetailPage"));
const MainPage = lazy(() => import("./pages/main/MainPage"));
const WeightRecord = lazy(() => import("./pages/AllRecordRead/WeightRecord"));
const BloodPressureRecord = lazy(() =>
  import("./pages/AllRecordRead/BloodPressureRecord"),
);
const BloodSugarRecord = lazy(() =>
  import("./pages/AllRecordRead/BloodSugarRecord"),
);
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const RecordSummary = lazy(() => import("./pages/AllRecordRead/RecordSummary"));
const MealPage = lazy(() => import("./pages/MealPage"));
const MainReportPage = lazy(() => import("./pages/report/MainReportPage"));
const MedicationPage = lazy(() => import("./pages/MedicationPage"));
const OsteoporosisReportPage = lazy(() =>
  import("./pages/report/OsteoporosisReportPage"),
);
const DiabetesReportPage = lazy(() =>
  import("./pages/report/DiabetesReportPage"),
);
const GoutReportPage = lazy(() => import("./pages/report/GoutReportPage"));
const HypertensionReportPage = lazy(() =>
  import("./pages/report/HypertensionReportPage"),
);
const DyslipidemiaReportPage = lazy(() =>
  import("./pages/report/DyslipidemiaReportPage"),
);
const ObesityReportPage = lazy(() =>
  import("./pages/report/ObesityReportPage"),
);
const HealthCalenderPage = lazy(() =>
  import("./pages/main/HealthCalenderPage"),
);
const AllRecordPage = lazy(() => import("./pages/AllRecordPage"));
const UserInformation = lazy(() => import("./pages/user/UserInformation"));
const PetPage = lazy(() => import("./pages/PetPage"));
const FamilyPage = lazy(() => import("./pages/family/FamilyPage"));
const HealthReportPage = lazy(() => import("./pages/report/HealthReportPage"));

/**
 * 루트(`/`) 진입 처리
 * - 미로그인: 인트로 페이지(/intro/web)로 리다이렉트
 * - 로그인 상태: 메인 대시보드(MainPage) 렌더
 */
function RootRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // 인증 복원 중에는 빈 화면
  return isAuthenticated ? <MainPage /> : <Navigate to="/intro/web" replace />;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideChatbot =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/disease" ||
    location.pathname === "/boards" ||
    location.pathname === "/intro/web" ||
    location.pathname === "/intro/osteoporosis" ||
    location.pathname === "/intro/diabetes" ||
    location.pathname === "/intro/gout" ||
    location.pathname === "/intro/hypertension" ||
    location.pathname === "/intro/dyslipidemia" ||
    location.pathname === "/intro/obesity" ||
    location.pathname === "/intro/hyperlipidemia" ||
    location.pathname.startsWith("/posts/");

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="pt-12">
        <Header />
        <div className="min-w-screen flex justify-end bg-white">
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="py-20 text-center text-[14px] text-[#94A3B8]">
                  불러오는 중…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<RootRoute />} />
                <Route path="/calender" element={<HealthCalenderPage />} />

                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/disease" element={<DiseasePage />} />

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
                <Route
                  path="/check/blood-sugar"
                  element={<BloodSugarRecord />}
                />
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
                <Route
                  path="/member/edit/profile"
                  element={<ProfileEditPage />}
                />
                <Route
                  path="/member/edit/disease"
                  element={<DiseaseEditPage />}
                />
                <Route path="/member/pet" element={<PetPage />} />
                <Route path="/member/family" element={<FamilyPage />} />
                <Route path="/report/health" element={<HealthReportPage />} />
                <Route path="/user/information" element={<UserInformation />} />

                <Route path="/allRecord" element={<AllRecordPage />} />
                <Route path="/intro/web" element={<MainReportPage />} />
                <Route
                  path="/intro/osteoporosis"
                  element={<OsteoporosisReportPage />}
                />
                <Route
                  path="/intro/diabetes"
                  element={<DiabetesReportPage />}
                />
                <Route path="/intro/gout" element={<GoutReportPage />} />
                <Route
                  path="/intro/hypertension"
                  element={<HypertensionReportPage />}
                />
                <Route
                  path="/intro/hyperlipidemia"
                  element={<DyslipidemiaReportPage />}
                />
                <Route path="/intro/obesity" element={<ObesityReportPage />} />
                <Route
                  path="/healthcalendar"
                  element={<HealthCalenderPage />}
                />

                <Route path="/member/pet" element={<PetPage />} />
              </Routes>
            </Suspense>
          </div>
          {!hideChatbot && <ChatBot />}
        </div>
      </main>
    </div>
  );
}

export default App;
