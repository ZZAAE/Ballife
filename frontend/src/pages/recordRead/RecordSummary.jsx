import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  Droplets,
  Activity,
  Scale,
  Utensils,
  Pill,
  Dumbbell,
  Heart,
  Menu,
  ChevronRight,
  Check,
  TrendingDown,
  Bot,
  Clock,
  Sun,
  Coffee,
  Moon,
  Apple,
  TrendingUp,
} from "lucide-react";

import SummaryCard from "../../components/SummaryCard";
import MealRecordCard from "../../components/MealRecordCard";
import MealRegisterModal from "../../modals/MealRegisterModal";

const bloodSugarData = [
  { time: "아침", fasting: 95, postMeal: 120 },
  { time: "점심", fasting: 88, postMeal: 135 },
  { time: "저녁", fasting: 100, postMeal: 147 },
];

const bloodPressureData = [
  { time: "아침", systolic: 185, diastolic: 130 },
  { time: "점심", systolic: 195, diastolic: 140 },
  { time: "저녁", systolic: 190, diastolic: 135 },
];

const meals = [
  {
    time: "08:30 AM",
    label: "아침",
    color: "from-slate-600 to-slate-800",
    image: "https://i.namu.wiki/i/9KlMwPdJc3xUwfQ01bKzEQVphEly7igr380JpMSBfg5yyWtYNAWvqsQaMsdzJIMPSeUjNVk_lXuZnAbX9esdeA.webp",
    items: [
      {
        name: "그릭 요거트와 블루베리",
        kcal: 245,
        carb: 18, protein: 12, fat: 8, sugar: 4, chol: 5, na: 2
      },
      {
        name: "아몬드 한 줌",
        kcal: 160,
        carb: 6, protein: 6, fat: 14, sugar: 1, chol: 0, na: 0
      },
      {
        name: "라면 큰거",
        kcal: 400,
        carb: 28, protein: 6, fat: 19, sugar: 1, chol: 5, na: 11
      },
    ],
  },
  {
    time: "12:45 PM",
    label: "점심",
    color: "from-emerald-600 to-emerald-800",
    items: [
      {
        name: "연어 샐러드",
        kcal: 480,
        carb: 12, protein: 34, fat: 28, sugar: 3, chol: 45, na: 1
      },
      {
        name: "현미밥 반 공기",
        kcal: 150,
        carb: 32, protein: 3, fat: 1, sugar: 0, chol: 0, na: 0
      },
    ],
  },
  {
    time: "07:15 PM",
    label: "저녁",
    color: "from-orange-500 to-orange-700",
    items: [
      {
        name: "닭가슴살 구이",
        kcal: 310,
        carb: 0, protein: 47, fat: 12, sugar: 0, chol: 75, na: 0
      },
      {
        name: "구운 고구마와 야채",
        kcal: 220,
        carb: 45, protein: 4, fat: 1, sugar: 0, chol: 0, na: 0
      },
    ],
  },
  {
    time: "04:00 PM",
    label: "간식",
    color: "from-violet-500 to-violet-700",
    items: [
      {
        name: "사과와 땅콩버터",
        kcal: 190,
        carb: 22, protein: 4, fat: 11, sugar: 15
      },
      {
        name: "단백질 쉐이크",
        kcal: 120,
        carb: 3, protein: 24, fat: 1, sugar: 1, chol: 15, na: 5
      },
    ],
  },
  {
    time: "04:00 PM",
    label: "간식",
    color: "from-violet-500 to-violet-700",
    items: [
      {
        name: "사과와 땅콩버터",
        kcal: 190,
        carb: 22, protein: 4, fat: 11, sugar: 15
      },
      {
        name: "단백질 쉐이크",
        kcal: 120,
        carb: 3, protein: 24, fat: 1, sugar: 1, chol: 15, na: 5
      },
    ],
  },
];

const MacroBadge = ({ label, value, unit = "g" }) => (
  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-50 rounded px-1.5 py-0.5">
    <span className="text-slate-500 font-medium">{label}</span> {value}
    {unit}
  </span>
);

export default function RecordSummary() {
  const [activeNav, setActiveNav] = useState("확인");
  const [activeSidebar, setActiveSidebar] = useState("혈당");
  const [isMealModalOpen, setMealModalOpen] = useState(false);

  const navItems = ["기록", "확인", "커뮤니티", "회원정보", "소개"];
  const sidebarItems = [
    { icon: Heart, label: "혈압" },
    { icon: Scale, label: "체중" },
    { icon: Activity, label: "혈당" },
    { icon: Dumbbell, label: "운동" },
    { icon: Pill, label: "약 복용" },
    { icon: Utensils, label: "식단" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto">
      {/* Navigation */}
      <nav className="bg-gray-900 px-12 py-4 flex items-center sticky top-0 z-50">
        <span className="text-2xl font-bold tracking-tight text-white mr-auto">
          Ballife
        </span>
        <div className="flex items-center gap-40">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`text-sm font-medium transition-colors ${
                activeNav === item
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 text-white ml-auto">
          <Menu size={18} />
        </button>
      </nav>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              전체 기록 관리
            </h1>
            <p className="text-sm text-gray-400">
              하루의 신체 변화를 분석한 결과입니다.
            </p>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* 식단 Card */}
            <SummaryCard
              Icon={Utensils}
              colorText="text-purple-600"
              colorBackgorund="bg-purple-50"
              labelName="식단"
              description="오늘의 섭취 kcal"
              record="1,450"
              unit="/ 2,100 kcal"
              bottomLabel="테스트입니다"
              BottomIcon={TrendingUp}
              bottomeLabelColor="text-red-600"
            />

            {/* 운동 Card */}
            <SummaryCard
              Icon={Dumbbell}
              colorText="text-emerald-600"
              colorBackgorund="bg-emerald-50"
              labelName="운동"
              description="오늘의 활동 시간"
              record="45"
              unit="분"
              bottomLabel="총 소모칼로리 500 kcal"
              //BottomIcon = {TrendingUp}
              bottomeLabelColor="text-emerald-600"
            />

            {/* 체중 Card */}
            <SummaryCard
              Icon={Scale}
              colorText="text-blue-600"
              colorBackgorund="bg-blue-50"
              labelName="체중"
              description="현재 체중 및 추세"
              record="72.4"
              unit="kg"
              bottomLabel="지난주 대비 -0.8kg"
              BottomIcon={TrendingDown}
              bottomeLabelColor="text-emerald-600"
            />

            {/* 수분 Card */}
            <SummaryCard
              Icon={Droplets}
              colorText="text-sky-600"
              colorBackgorund="bg-sky-50"
              labelName="수분"
              description="오늘의 수분 섭취량"
              record="1.6"
              unit="/ 2.5 L"
            />
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* 혈당 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 혈당 변화
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    식전 (Fasting)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    식후 (Post-meal)
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={bloodSugarData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={[0, 180]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    ticks={[0, 30, 60, 90, 120, 150, 180]}
                  />
                  <ReferenceLine
                    y={120}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: "120",
                      position: "right",
                      fill: "#ef4444",
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#3b82f6"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: "100",
                      position: "right",
                      fill: "#3b82f6",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="fasting" fill="#6ea8fe" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="fasting"
                      position="top"
                      fill="#3b82f6"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                  <Bar dataKey="postMeal" fill="#fca5a5" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="postMeal"
                      position="top"
                      fill="#ef4444"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 혈압 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 혈압 변화
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    수축기 (Systolic)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    이완기 (Diastolic)
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={bloodPressureData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={[0, 300]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    ticks={[0, 100, 200, 300]}
                  />
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    stroke="#f87171"
                    fill="#fee2e2"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#818cf8"
                    fill="#e0e7ff"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 복용 일정 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 복용 일정
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                  2025년 5월 22일
                </span>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                알림 설정 변경 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* 아침약 */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Sun size={13} /> 아침 (08:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  아침약
                </p>
                <p className="text-xs text-gray-400 mb-3">식후 30분 복용</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={14} /> 복용 완료
                </div>
              </div>

              {/* 점심약 */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Coffee size={13} /> 점심 (13:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  점심약
                </p>
                <p className="text-xs text-gray-400 mb-3">식사 중 복용</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={14} /> 복용 완료
                </div>
              </div>

              {/* 저녁약 */}
              <div className="border-2 border-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-3">
                  <Moon size={13} /> 저녁 (19:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  저녁약
                </p>
                <p className="text-xs text-gray-400 mb-3">식후 30분 복용</p>
                <button className="w-full bg-gray-900 text-white text-xs font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  복용 확인
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4">
              {meals.map((meal, idx) => (
                <MealRecordCard
                  key={idx}
                  {...meal}
                  className="min-w-[calc(25%-10px)] flex-1 flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </main>

        <MealRegisterModal isOpen={isMealModalOpen} onClose={() => setMealModalOpen(false)} />

        {/* Right Sidebar */}
        <aside className="w-64 bg-white border-l border-gray-200 p-5 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900 mb-4">건강 지표</h3>

          <div className="space-y-1 mb-6">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveSidebar(item.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeSidebar === item.label
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <button className="w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl mb-6 hover:bg-gray-800 transition-colors"
                  onClick={() => setMealModalOpen(true)}>
            등록 하기
          </button>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Bot size={20} />
            </div>
            <h4 className="font-bold text-sm mb-2">매우 훌륭한 추세입니다!</h4>
            <p className="text-xs text-indigo-200 leading-relaxed mb-3">
              이번 주 체중이 꾸준히 안정세를 보이고 있습니다. 현재의 식단과 수면
              패턴이 신진대사에 긍정적인 영향을 주고 있는 것으로 분석됩니다.
            </p>
            <p className="text-xs font-semibold mb-1">전문가 추천 팁:</p>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              목표 체중까지 약 4.4kg 남았습니다. 근력 운동 횟수를 주 1회 더
              늘리면 기초대사량이 높아져 정체기를 해결할 수 있습니다.
            </p>
            <button className="w-full bg-white text-indigo-700 text-xs font-semibold py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
              맞춤형 식단 계획 보기
            </button>
          </div>

          {/* 수분 섭취 권장 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-8 h-8 bg-sky-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Droplets size={15} className="text-sky-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  수분 섭취 권장
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  체중 감량 중에는 하루 2L 이상의 물을 마시는 것이 지방 연소에
                  효과적입니다.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
