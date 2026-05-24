import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      {/* <Header /> */}
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-10">

        {/* Header & User Stats */}
        <header className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <h1 className="text-3xl font-bold text-[#0F172A]">김지수님 안녕하세요.</h1>
          <div className="flex gap-6 text-sm">
            <div><p className="text-xs text-[#94A3B8]">나이 / 성별</p><p className="font-semibold text-[#0F172A]">{userStats.ageGender}</p></div>
            <div><p className="text-xs text-[#94A3B8]">키</p><p className="font-semibold text-[#0F172A]">{userStats.height}</p></div>
            <div><p className="text-xs text-[#94A3B8]">몸무게</p><p className="font-semibold text-[#0F172A]">{userStats.weight}</p></div>
            <div><p className="text-xs text-[#94A3B8]">BMI</p><p className={`font-semibold ${userStats.bmiColor}`}>{userStats.bmi}</p></div>
          </div>
        </header>

        {/* 펫 섹션 */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 p-6 lg:p-8 ring-1 ring-blue-100/80 shadow-sm">
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0F172A]">
                내 펫이 기다리고 있어요
              </h2>
              <p className="mt-2 text-sm lg:text-base text-[#64748B]">
                펫과 함께 건강한 하루를 시작해보세요.
              </p>
              <Link
                to="/member/pet"
                className="group mt-5 inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1E293B]"
              >
                내 펫 자세히 보기
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

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
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
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
            <h2 className="text-2xl font-bold text-[#0F172A]">건강 뉴스</h2>
            <p className="text-[#64748B] text-sm mt-1">전문가가 큐레이션한 건강 정보를 만나보세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { category: 'MEDICAL', title: 'Regular blood pressure control reduces stroke risk', color: 'bg-[#F1F5F9] text-[#0F172A]', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop' },
              { category: 'PREVENTION', title: 'Guide to regular checkups for complication prevention', color: 'bg-[#F1F5F9] text-[#0F172A]', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop' },
              { category: 'NUTRITION', title: 'Diet trends for blood sugar management', color: 'bg-[#F1F5F9] text-[#0F172A]', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop' },
            ].map((news, idx) => (
              <div key={idx} className="bg-white rounded-[18px] overflow-hidden border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] group cursor-pointer">
                <img src={news.img} alt={news.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-6">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${news.color}`}>{news.category}</span>
                  <p className="mt-3 text-sm font-semibold text-[#0F172A] leading-snug">{news.title}</p>
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