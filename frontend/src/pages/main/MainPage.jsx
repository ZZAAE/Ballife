import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { Sparkles, ArrowRight } from 'lucide-react';
import Header from '../../components/Header';
import HealthMenu from '../../components/HealthMenu';
import Card from '../../components/mainpage/card.jsx';
import Calendar from '../../components/mainpage/calendar.jsx';
import ChartSection from '../../components/mainpage/chart.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const bloodPressureData = [
  { date: "03-01", systolic: 128, diastolic: 82 },
  { date: "03-05", systolic: 125, diastolic: 80 },
  { date: "03-10", systolic: 130, diastolic: 84 },
  { date: "03-15", systolic: 122, diastolic: 79 },
  { date: "03-20", systolic: 118, diastolic: 76 },
  { date: "03-25", systolic: 119, diastolic: 77 },
  { date: "03-31", systolic: 116, diastolic: 74 },
  { date: "04-05", systolic: 121, diastolic: 78 },
  { date: "04-12", systolic: 118, diastolic: 75 },
  { date: "04-20", systolic: 115, diastolic: 73 },
  { date: "04-28", systolic: 117, diastolic: 76 },
  { date: "05-01", systolic: 114, diastolic: 72 },
  { date: "05-06", systolic: 112, diastolic: 70 },
];

const bloodSugarData = [
  { date: "03-01", glucose: 118 },
  { date: "03-05", glucose: 114 },
  { date: "03-10", glucose: 121 },
  { date: "03-15", glucose: 110 },
  { date: "03-20", glucose: 108 },
  { date: "03-25", glucose: 115 },
  { date: "03-31", glucose: 112 },
  { date: "04-05", glucose: 109 },
  { date: "04-12", glucose: 107 },
  { date: "04-20", glucose: 104 },
  { date: "04-28", glucose: 106 },
  { date: "05-01", glucose: 103 },
  { date: "05-06", glucose: 101 },
];

const weightData = [
  { date: "03-01", weight: 78.5 },
  { date: "03-05", weight: 78.3 },
  { date: "03-10", weight: 78.4 },
  { date: "03-15", weight: 78.1 },
  { date: "03-20", weight: 77.9 },
  { date: "03-25", weight: 78.0 },
  { date: "03-31", weight: 77.8 },
  { date: "04-05", weight: 77.6 },
  { date: "04-12", weight: 77.5 },
  { date: "04-20", weight: 77.3 },
  { date: "04-28", weight: 77.1 },
  { date: "05-01", weight: 77.0 },
  { date: "05-06", weight: 76.8 },
];

const MainPage = () => {
  const [selectedChartType, setSelectedChartType] = useState("bloodPressure");

  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/Unity/Build.loader.js",
    dataUrl: "/Unity/Build.data",
    frameworkUrl: "/Unity/Build.framework.js",
    codeUrl: "/Unity/Build.wasm",
  });
  const loadingPercent = Math.round(loadingProgression * 100);

  const chartConfig = useMemo(() => {
    return {
      bloodPressure: {
        data: bloodPressureData,
        legends: [
          { label: "수축기", color: "#2563eb" },
          { label: "이완기", color: "#06b6d4" },
        ],
        unit: "mmHg",
        yDomain: [60, 150],
        areas: [
          { key: "systolic", name: "수축기", stroke: "#2563eb", gradientId: "systolicGrad" },
          { key: "diastolic", name: "이완기", stroke: "#06b6d4", gradientId: "diastolicGrad" },
        ],
      },
      bloodSugar: {
        data: bloodSugarData,
        legends: [{ label: "혈당", color: "#16a34a" }],
        unit: "mg/dL",
        yDomain: [80, 140],
        areas: [
          { key: "glucose", name: "혈당", stroke: "#16a34a", gradientId: "glucoseGrad" },
        ],
      },
      weight: {
        data: weightData,
        legends: [{ label: "체중", color: "#f97316" }],
        unit: "kg",
        yDomain: [75, 80],
        areas: [
          { key: "weight", name: "체중", stroke: "#f97316", gradientId: "weightGrad" },
        ],
      },
    };
  }, []);

  const activeChart = chartConfig[selectedChartType];

  // 샘플 데이터
  const userStats = {
    ageGender: "45세 / 남성",
    height: "175cm",
    weight: "78kg",
    bmi: "25.5 (과체중)",
    bmiColor: "text-red-500",
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>{`2026-${label}`}</p>
          {payload.map((p) => (
            <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
              {p.name}: <strong>{p.value}</strong> {activeChart.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 ml-[150px] mr-[150px]">
      {/* <Header /> */}
      <div className="flex pt-[55px]">
        <main className="flex-1 p-6 px-12 py-10">
          <div className="max-w-auto mx-auto space-y-10">
        
        {/* 펫 히어로 — 진입 시 가장 먼저 보이는 영역 */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 p-6 lg:p-10 ring-1 ring-blue-100/80 shadow-sm">
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            {/* 좌측: 인사 + 스탯 + CTA */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-600 ring-1 ring-blue-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> 오늘도 함께해요
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                <span className="text-blue-600">김지수</span>님,<br className="hidden sm:block" />
                {' '}오늘도 건강한 하루를 시작해요
              </h1>

              <p className="mt-2 text-sm text-slate-500 lg:text-base">
                내 건강 친구가 옆에서 함께 챙겨드리고 있어요.
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400">나이 / 성별</p>
                  <p className="font-bold text-slate-800">{userStats.ageGender}</p>
                </div>
                <div className="h-8 w-px bg-slate-200/80" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">키</p>
                  <p className="font-bold text-slate-800">{userStats.height}</p>
                </div>
                <div className="h-8 w-px bg-slate-200/80" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">몸무게</p>
                  <p className="font-bold text-slate-800">{userStats.weight}</p>
                </div>
                <div className="h-8 w-px bg-slate-200/80" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">BMI</p>
                  <p className={`font-bold ${userStats.bmiColor}`}>{userStats.bmi}</p>
                </div>
              </div>

              <Link
                to="/member/pet"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-blue-300"
              >
                내 펫 자세히 보기
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* 우측: Unity 펫 뷰어 */}
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-white/80">
                <Unity
                  unityProvider={unityProvider}
                  style={{
                    width: '100%',
                    height: 360,
                    display: 'block',
                    background: '#F0F7FF',
                  }}
                />
                {/* 로딩 오버레이 */}
                {!isLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="mb-3 text-3xl">🐾</div>
                    <p className="text-sm font-semibold text-blue-700">
                      펫을 데려오는 중이에요…
                    </p>
                    <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/70">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${loadingPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-blue-500">
                      {loadingPercent}%
                    </p>
                  </div>
                )}
              </div>

              {/* 우측 하단 살짝 떠 있는 배지 */}
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-lg ring-1 ring-slate-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                내 펫이 활동 중
              </div>
            </div>
          </div>
        </section>

        {/* Status Cards (Top Row) */}
        <Card />

        {/* Action Cards (Second Row) */}
        

        {/* Calendar & Chart Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Card */}
          <Calendar />

          {/* Chart Placeholder Card */}
          <ChartSection
            title="주간 건강 추이"
            data={activeChart.data}
            legends={activeChart.legends}
            selectedType={selectedChartType}
            onTypeChange={setSelectedChartType}
            chartTypes={[
              { value: "bloodSugar", label: "혈당" },
              { value: "bloodPressure", label: "혈압" },
              { value: "weight", label: "체중" },
            ]}
          >
            {(filteredData) => (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} tickFormatter={(v) => `2026-${v}`} />
                  <YAxis domain={activeChart.yDomain} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {activeChart.areas.map((area) => (
                    <Area
                      key={area.key}
                      type="monotone"
                      dataKey={area.key}
                      name={area.name}
                      stroke={area.stroke}
                      strokeWidth={3}
                      fill={`url(#${area.gradientId})`}
                      dot={{ fill: area.stroke, r: 4, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartSection>
        </section>

        {/* 건강 뉴스 섹션 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">건강 뉴스</h2>
            <p className="text-slate-500 text-sm mt-1">전문가가 큐레이션한 건강 정보를 만나보세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { category: 'MEDICAL', title: 'Regular blood pressure control reduces stroke risk', color: 'bg-blue-50 text-blue-700', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop' },
              { category: 'PREVENTION', title: 'Guide to regular checkups for complication prevention', color: 'bg-red-50 text-red-700', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop' },
              { category: 'NUTRITION', title: 'Diet trends for blood sugar management', color: 'bg-green-50 text-green-700', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop' },
            ].map((news, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer">
                <img src={news.img} alt={news.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-6">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${news.color}`}>{news.category}</span>
                  <p className="mt-3 text-sm font-semibold text-slate-800 leading-snug">{news.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;