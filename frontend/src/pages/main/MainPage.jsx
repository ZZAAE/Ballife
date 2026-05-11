import React from 'react';
import Header from '../../components/Header';
import HealthMenu from '../../components/HealthMenu';
import Card from '../../components/mainpage/card.jsx';
import Calendar from '../../components/mainpage/calendar.jsx';
import ChartSection from '../../components/mainpage/chart.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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

const MainPage = () => {
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
            {p.name}: <strong>{p.value}</strong> mmHg
          </p>
        ))}
      </div>
    );
  }
  return null;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 ml-[150px] mr-[150px]">
      <Header />
      <div className="flex">
        <main className="flex-1 p-6 px-12 py-10">
          <div className="max-w-auto mx-auto space-y-10">
        
        {/* Header & User Stats */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h1 className="text-3xl font-bold">김지수님 안녕하세요.</h1>
          <div className="flex gap-6 text-sm text-slate-500">
            <div><p className="text-xs opacity-60">나이 / 성별</p><p className="font-semibold text-slate-800">{userStats.ageGender}</p></div>
            <div><p className="text-xs opacity-60">키</p><p className="font-semibold text-slate-800">{userStats.height}</p></div>
            <div><p className="text-xs opacity-60">몸무게</p><p className="font-semibold text-slate-800">{userStats.weight}</p></div>
            <div><p className="text-xs opacity-60">BMI</p><p className={`font-semibold ${userStats.bmiColor}`}>{userStats.bmi}</p></div>
          </div>
        </header>

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
            data={bloodPressureData}
            legends={[
              { label: "수축기", color: "#2563eb" },
              { label: "이완기", color: "#06b6d4" },
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
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} tickFormatter={(v) => `2026-${v}`} />
                  <YAxis domain={[60, 150]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="systolic" name="수축기" stroke="#2563eb" strokeWidth={3} fill="url(#systolicGrad)" dot={{ fill: "#2563eb", r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="diastolic" name="이완기" stroke="#06b6d4" strokeWidth={3} fill="url(#diastolicGrad)" dot={{ fill: "#06b6d4", r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
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