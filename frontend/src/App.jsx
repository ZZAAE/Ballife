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
import MainPage from './pages/main/MainPage';
import HealthCalenderPage from './pages/main/HealthCalenderPage';
import Header from './components/Header';
import HealthIndicatorMenu from './components/HealthMenu';

function App() {

  const hideHealthMenu =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/boards' ||
    location.pathname === '/posts/create' ||
    location.pathname.startsWith('/posts/'); 

  return (
  <div className="min-h-screen bg-white flex flex-col">
    <main className="py-12">
    <Header isLoggedIn={false} />

    <div className="min-w-screen bg-white flex justify-end">
      <div className="flex-1">
      {/* 메인 콘텐츠*/}
      <Routes>
        {/* <Routes> -> 페이지 이동 경로 */}
        <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/disease" element={<DiseasePage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/posts/create" element={<PostCreatePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/calender" element={<HealthCalenderPage />} />
      </Routes>
      </div>
      {!hideHealthMenu && <HealthIndicatorMenu />}
    </div>
    </main>
  </div>
);
}

export default App;
