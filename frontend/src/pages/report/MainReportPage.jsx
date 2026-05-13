import React from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle2 } from "lucide-react";

export default function MainReportPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <section className="relative h-[500px] bg-slate-800 flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center text-white px-4">
          <span className="inline-block px-3 py-1 border border-white/30 rounded-full text-[10px] mb-6">
            하나의 공간에서 BalLife
          </span>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            당신의 건강한 삶을
            <br />
            기록하고 공유하세요
          </h1>
          <p className="text-gray-300 text-xs mb-8 leading-relaxed max-w-lg mx-auto">
            BalLife는 단순한 기록을 넘어,
            <br />
            저희 서비스는 활기찬 커뮤니티를 통해 당신의 지속 가능한 건강 관리를
            돕습니다.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/login">
              <button className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded">
                지금 바로 시작하기
              </button>
            </Link>
            <button className="px-6 py-2.5 bg-black/40 text-white font-bold text-xs rounded border border-white/20">
              서비스 더 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* 소개 섹션 1 */}
      <section className="py-20 text-center max-w-[900px] mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          건강 관리가 더 이상 외롭지 않도록
        </h2>
        <p className="text-sm text-gray-500 leading-loose">
          매일 반복되는 식단 기록과 운동 체크, 혼자서는 작심삼삼이 되기
          쉽습니다.
          <br />
          BallLife는 체계적인 데이터 관리와 커뮤니티의 지지를 결합하여 당신의
          라이프스타일을 변화시킵니다.
        </p>

        <div className="mt-16 flex flex-col md:flex-row gap-12 items-center text-left">
          <div className="w-full md:w-1/2 bg-[#f87171] rounded-xl aspect-[4/3] flex items-center justify-center">
            <img
              src="assets/icon/ballifeLogo.png" 
              alt="Sample"
              className="opacity-80"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3">왜 BalLife 인가요?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Balance + Life를 합친 말로 사용자의 라이프 밸런스 회복에
                집중합니다.
                <br />
                우리는 파편적으로 흩어져 있는 건강 데이터를 하나의 인사이트로
                통합합니다.
                <br />
                의료 전문가 수준의 분석 도구를 누구나 쉽게 이해할 수 있는
                리포트로 제공합니다.
              </p>
            </div>
            <ul className="space-y-3 text-xs font-medium text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gray-400" /> AI 기반의
                체계적인 건강 지표 관리 시스템
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gray-400" /> 사용자
                맞춤형 조언 및 알림
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gray-400" /> 실시간
                커뮤니티 시스템 구축
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3대 핵심 솔루션 */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-4">
          <h2 className="text-xl font-bold mb-10">
            BallLife의 3대 핵심 솔루션
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm mb-2">스마트한 건강 기록</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    식단, 혈압, 혈당, 운동, 수분섭취 그리고 현재 상태까지.
                    <br />
                    앱으로 간편하게 기록하고 시각화된 통계를 통해 변화를 한눈에
                    확인하세요.
                  </p>
                </div>
                <div className="opacity-20">
                  <TrendingUpIcon />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm mb-2">
                    직관적인 건강 지표 확인
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    복잡한 데이터 없이도 즉각 상태를 파악할 수 있도록
                    제공합니다.
                  </p>
                </div>
                <div className="opacity-20">
                  <TrendingUpIcon />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6">
                <h4 className="font-bold text-sm mb-2 text-emerald-600">
                  AI를 활용한 식단 관리
                </h4>
                <p className="text-[11px] text-gray-400">
                  식사 사진 한 장으로 영양 성분 분석부터 건강 맞춤형 피드백까지.
                </p>
              </div>
              <div className="mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
                  alt="Food"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 챗봇 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-[1000px] mx-auto bg-[#0a1120] rounded-2xl p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white">
            <h3 className="text-xl font-bold mb-4">AI 챗봇 맞춤형 조언</h3>
            <p className="text-xs text-gray-400 leading-loose">
              궁금한 건강 질문, 현재 식사 사진 등 24시간 즉시 답변해 드립니다.
              당신의 라이프스타일에 맞게 당뇨 건강 관리를 제안합니다.
            </p>
          </div>
          <div className="flex-1 w-full space-y-3">
            <div className="bg-[#1e293b] p-4 rounded-xl text-[11px] text-gray-300 ml-12">
              "오늘 혈당이 조금 높게 나타났는데 거의 1시간 후인것 같네요?"
            </div>
            <div className="bg-emerald-900/40 border border-emerald-500/30 p-4 rounded-xl text-[11px] text-emerald-400">
              "혈당 조절을 위해 식이섬유가 풍부한 잡곡 등은 체크 위주로 드시는게
              좋습니다.
              <br />
              식후 20분 가벼운 산책도 도움이 됩니다."
            </div>
          </div>
        </div>
      </section>

      {/* 커뮤니티 섹션 */}
      <section className="pb-20 px-4">
        <div className="max-w-[1000px] mx-auto bg-gray-100 rounded-2xl overflow-hidden relative min-h-[160px] flex items-center px-10">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80"
            alt="Doctor"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Together is Better
            </span>
            <h3 className="text-lg font-bold mt-1">활기찬 커뮤니티</h3>
            <p className="text-[11px] text-gray-500 mt-2">
              혼자하면 지루한 관리, 함께하면 응원이 됩니다. 챌린지를 공유하고
              서로를 응원하며 매일매일 성장하는 커뮤니티를 경험하세요.
            </p>
            <div className="flex items-center gap-1 mt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#0a0c10] py-16 text-center text-white">
        <h2 className="text-xl font-bold mb-4">
          내일의 더 나은 나를 위한 첫걸음
        </h2>
        <p className="text-[11px] text-gray-500 mb-8 font-medium">
          지금 BallLife에 합류하여 더 나은 사용자와 함께 건강한 라이프스타일을
          시작해보세요.
        </p>
        <Link to="/login">
          <button className="bg-white text-black px-10 py-3 rounded-lg font-bold text-xs">
            지금 바로 시작하기
          </button>
        </Link>
      </footer>
    </div>
  );
}

const TrendingUpIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-200"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);
