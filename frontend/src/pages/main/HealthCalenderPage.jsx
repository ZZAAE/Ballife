import React from "react";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

const colors = [
  "stroke-red-400",
  "stroke-yellow-400",
  "stroke-blue-400",
  "stroke-green-400",
  "stroke-purple-400",
  "stroke-orange-400",
];

const RingChart = () => {
  return (
    <svg viewBox="0 0 36 36" className="w-10 h-10">
      {colors.map((c, i) => (
        <circle
          key={i}
          cx="18"
          cy="18"
          r="15.915"
          fill="transparent"
          strokeWidth="3"
          className={c}
          strokeDasharray={`${10 + i * 5}, 100`}
          strokeDashoffset={i * -15}
        />
      ))}
    </svg>
  );
};

const Calendar = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <button>{"<"}</button>
        <h2 className="font-semibold">2026년 3월</h2>
        <button>{">"}</button>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-400 mb-3">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map(day => (
          <div key={day} className="bg-gray-50 rounded-xl p-2 flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">{day}</span>
            <RingChart />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6 text-xs text-gray-500">
        {["식단","혈압","혈당","수면","체력","운동","체중"].map((l,i)=>(
          <div key={i} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full bg-${["red","yellow","blue","green","purple","orange","gray"][i]}-400`} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

const Table = () => {
  const rows = [
    ["혈당", "118 mg/dL", "112 mg/dL", "+6 개선"],
    ["혈압", "125 mmHg", "118 mmHg", "+7 개선"],
    ["체중", "78.5 kg", "78.0 kg", "-0.5 kg"],
    ["운동", "3회", "5회", "+2회"],
    ["식사", "72점", "85점", "+13점"],
    ["수면", "85%", "100%", "+15%"],
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">이번주의 나는 얼마나 건강해졌을까요?</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400 text-left">
          <tr>
            <th>항목</th>
            <th>지난 주</th>
            <th>이번 주</th>
            <th>변화</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t">
              {r.map((c,j)=>(
                <td key={j} className="py-3">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 bg-green-100 text-green-700 p-4 rounded-xl text-sm">
        전체적으로 개선되고 있습니다! 👍
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="font-semibold mb-2">월간 종합 성과</h4>
        {[
          ["식단 건강", 82],
          ["혈당 안정도", 50],
          ["수면 리듬", 65],
          ["체력 지수", 100],
          ["운동 수행", 75],
        ].map(([label,val],i)=>(
          <div key={i} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{label}</span>
              <span>{val}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full">
              <div
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-4">
        <h4 className="font-semibold mb-2">주간 분석</h4>
        <p className="text-sm mb-3">7일 연속 운동</p>
        <div className="flex items-end gap-2 h-20">
          {[20,40,30,60,50,80,90].map((h,i)=>(
            <div key={i} className="bg-gray-500 w-4" style={{height: `${h}%`}} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HealthCalenderPage() {
  return (
    <div className=" min-h-screen bg-gray-100">
      <div className="px-4 py-6 sm:px-6 md:py-8 lg:px-10 xl:px-12 2xl:px-16">
        <h1 className="text-xl font-bold mb-2">건강 지표 관리 캘린더</h1>
        <p className="text-gray-400 mb-6">지난 한 달간의 신체 변화를 분석한 결과입니다.</p>

        <div className="space-y-6">
          <Calendar />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
            <div className="md:col-span-7">
              <Table />
            </div>
            <div className="md:col-span-3">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}