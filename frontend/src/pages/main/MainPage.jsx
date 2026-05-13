import React, { useMemo, useState } from "react";
import Card from "../../components/mainpage/card.jsx";
import Calendar from "../../components/mainpage/calendar.jsx";
import ChartSection from "../../components/mainpage/chart.jsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  const chartConfig = useMemo(
    () => ({
      bloodPressure: {
        data: bloodPressureData,
        legends: [
          { label: "수축기", color: "#2563eb" },
          { label: "이완기", color: "#06b6d4" },
        ],
        unit: "mmHg",
        yDomain: [60, 150],
        areas: [
          {
            key: "systolic",
            name: "수축기",
            stroke: "#2563eb",
            gradientId: "systolicGrad",
          },
          {
            key: "diastolic",
            name: "이완기",
            stroke: "#06b6d4",
            gradientId: "diastolicGrad",
          },
        ],
      },
      bloodSugar: {
        data: bloodSugarData,
        legends: [{ label: "혈당", color: "#16a34a" }],
        unit: "mg/dL",
        yDomain: [80, 140],
        areas: [
          {
            key: "glucose",
            name: "혈당",
            stroke: "#16a34a",
            gradientId: "glucoseGrad",
          },
        ],
      },
      weight: {
        data: weightData,
        legends: [{ label: "체중", color: "#f97316" }],
        unit: "kg",
        yDomain: [75, 80],
        areas: [
          {
            key: "weight",
            name: "체중",
            stroke: "#f97316",
            gradientId: "weightGrad",
          },
        ],
      },
    }),
    [],
  );

  const activeChart = chartConfig[selectedChartType];

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
          <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>
            {`2026-${label}`}
          </p>
          {payload.map((point) => (
            <p
              key={point.dataKey}
              style={{ color: point.color, margin: "2px 0" }}
            >
              {point.name}: <strong>{point.value}</strong> {activeChart.unit}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 ml-[150px] mr-[150px]">
      <div className="flex">
        <main className="flex-1 pb-12 pt-[87px] px-12">
          <div className="max-w-auto mx-auto space-y-10">
            <header className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h1 className="text-3xl font-bold">천지수님 안녕하세요.</h1>
              <div className="flex gap-6 text-sm text-slate-500">
                <div>
                  <p className="text-xs opacity-60">나이 / 성별</p>
                  <p className="font-semibold text-slate-800">
                    {userStats.ageGender}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">키</p>
                  <p className="font-semibold text-slate-800">
                    {userStats.height}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">몸무게</p>
                  <p className="font-semibold text-slate-800">
                    {userStats.weight}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">BMI</p>
                  <p className={`font-semibold ${userStats.bmiColor}`}>
                    {userStats.bmi}
                  </p>
                </div>
              </div>
            </header>

            <Card />

            <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Calendar />

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
                    <AreaChart
                      data={filteredData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="systolicGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="diastolicGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#06b6d4"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="glucoseGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#16a34a"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="95%"
                            stopColor="#16a34a"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="weightGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f97316"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f97316"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        tickFormatter={(value) => `2026-${value}`}
                      />
                      <YAxis
                        domain={activeChart.yDomain}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
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
                          dot={{
                            fill: area.stroke,
                            r: 4,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartSection>
            </section>

            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">건강 뉴스</h2>
                <p className="mt-1 text-sm text-slate-500">
                  전문가가 큐레이션한 건강 정보를 만나보세요.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    category: "MEDICAL",
                    title: "Regular blood pressure control reduces stroke risk",
                    color: "bg-blue-50 text-blue-700",
                    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop",
                  },
                  {
                    category: "PREVENTION",
                    title:
                      "Guide to regular checkups for complication prevention",
                    color: "bg-red-50 text-red-700",
                    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop",
                  },
                  {
                    category: "NUTRITION",
                    title: "Diet trends for blood sugar management",
                    color: "bg-green-50 text-green-700",
                    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop",
                  },
                ].map((news, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                  >
                    <img
                      src={news.img}
                      alt={news.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="p-6">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${news.color}`}
                      >
                        {news.category}
                      </span>
                      <p className="mt-3 text-sm font-semibold leading-snug text-slate-800">
                        {news.title}
                      </p>
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
