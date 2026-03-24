//import Button from './components/Button';
//import Input from './components/Input';

function App() {


  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🛍️ 쇼핑몰
          </h1>
        </div>
      </header>
      {/* 메인 콘텐츠*/}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            환영합니다!
          </h2>
          <p className="text-gray-600 mb-6">
            Spring Boot + React 쇼핑몰 프로젝트입니다.
          </p>

      
          {/* 버튼예시 */}
          <div className="flex gap-4">
            <button className="btn-primary">
              시작하기
            </button>
            <button className="btn-secondary">
              더 알아보기
            </button>
          </div>
        </div>
      {/* Tailwind 클래스 테스트 */}
      {/* 위쪽 여백 8, 그리드 레이어로 설정, 모바일 적용, 태블릿(grid-col-3), 그리드 간격 6 */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* 마우스 올리면 그림자가 커짐, 부드러운 애니메이션 */}
        <div className="card hover:shahow-lg transition">
          {/* 폰트 진하게, 약간 큰 글자, 아래 여백 2 */}
          <h3 className="font-bold text-lg mb-2">상품 관리</h3>
          {/* 글자색 회색, 작은 글자 */}
          <p className="text-gray-600 text-sm">상품 등록, 수정, 삭제</p>
        </div>

        <div className="card hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">👤 회원 관리</h3>
            <p className="text-gray-600 text-sm">회원가입, 로그인</p>
          </div>
          <div className="card hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">🤖 AI 어시스턴트</h3>
            <p className="text-gray-600 text-sm">AI 쇼핑 도우미</p>
        </div>

      </div>

      </main>
    </div>
  )
}

export default App
