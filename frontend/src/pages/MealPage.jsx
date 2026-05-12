import { useState, useRef } from "react";
import MealDetailModal from "../modals/MealDetailModal";

const meals = [
  {
    id: "breakfast",
    label: "아침",
    time: "08:30 AM",
    img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop",
    items: [
      {
        name: "그릭 요거트와 블루베리",
        kcal: 245,
        carb: 18,
        protein: 12,
        fat: 8,
        sugar: 4,
        chol: 5,
        sodium: 80,
      },
      {
        name: "아몬드 한 줌",
        kcal: 160,
        carb: 6,
        protein: 6,
        fat: 14,
        sugar: 1,
        chol: 0,
        sodium: 0,
      },
    ],
  },
  {
    id: "lunch",
    label: "점심",
    time: "12:45 PM",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    items: [
      {
        name: "연어 샐러드",
        kcal: 480,
        carb: 12,
        protein: 34,
        fat: 28,
        sugar: 3,
        chol: 45,
        sodium: 60,
      },
      {
        name: "현미밥 반 공기",
        kcal: 150,
        carb: 32,
        protein: 3,
        fat: 1,
        sugar: 0,
        chol: 0,
        sodium: 10,
      },
    ],
  },
  {
    id: "dinner",
    label: "저녁",
    time: "07:15 PM",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    items: [
      {
        name: "닭가슴살 구이",
        kcal: 310,
        carb: 0,
        protein: 42,
        fat: 12,
        sugar: 0,
        chol: 75,
        sodium: 120,
      },
      {
        name: "구운 고구마와 야채",
        kcal: 220,
        carb: 45,
        protein: 4,
        fat: 1,
        sugar: 8,
        chol: 0,
        sodium: 30,
      },
    ],
  },
  {
    id: "snack",
    label: "간식",
    time: "04:00 PM",
    img: "https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=400&h=300&fit=crop",
    items: [
      {
        name: "사과와 땅콩버터",
        kcal: 190,
        carb: 22,
        protein: 4,
        fat: 11,
        sugar: 15,
        chol: 0,
        sodium: 70,
      },
      {
        name: "단백질 쉐이크",
        kcal: 120,
        carb: 3,
        protein: 24,
        fat: 1,
        sugar: 1,
        chol: 15,
        sodium: 50,
      },
    ],
  },
];

const nutrientColors = {
  carb: { label: "탄", color: "#6e7da2", bg: "rgba(110,125,162,0.08)" },
  protein: { label: "단", color: "#0071e3", bg: "rgba(0,113,227,0.08)" },
  fat: { label: "지", color: "#9b3f00", bg: "rgba(155,63,0,0.08)" },
  sugar: { label: "당", color: "#e91e63", bg: "rgba(233,30,99,0.08)" },
  chol: { label: "콜", color: "#795548", bg: "rgba(121,85,72,0.08)" },
  sodium: { label: "나", color: "#00a86b", bg: "rgba(0,168,107,0.08)" },
};

const nutritionSummary = [
  { label: "탄수화물", current: 125, target: 260, unit: "g", over: false },
  { label: "단백질", current: 65, target: 120, unit: "g", over: false },
  { label: "지방", current: 132, target: 70, unit: "g", over: true },
  { label: "당류", current: 24, target: 50, unit: "g", over: false },
  { label: "나트륨", current: 1120, target: 2000, unit: "mg", over: false },
  { label: "콜레스테롤", current: 150, target: 300, unit: "mg", over: false },
];

function buildMealData(meal) {
  if (!meal) return null;

  const sum = (key) => meal.items.reduce((s, i) => s + (i[key] || 0), 0);

  return {
    mealType: `${meal.label} 식사`,
    foods: meal.items.map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      calories: item.kcal,
      nutrition: {
        carbs: item.carb,
        protein: item.protein,
        fat: item.fat,
        sugar: item.sugar,
        cholesterol: item.chol,
        sodium: item.sodium || 0,
      },
      image: meal.img,
    })),
    totalNutrition: {
      carbs: sum("carb"),
      protein: sum("protein"),
      fat: sum("fat"),
      sugar: sum("sugar"),
      cholesterol: sum("chol"),
      sodium: sum("sodium"),
    },
    totalCalories: sum("kcal"),
  };
}

function DonutChart({
  value,
  max,
  size = 160,
  strokeWidth = 10,
  color = "#000",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E9EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function NutrientBadge({ type, value, unit = "g" }) {
  const n = nutrientColors[type];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 8,
        background: n.bg,
        fontSize: 10,
        fontWeight: 700,
        color: n.color,
        whiteSpace: "nowrap",
      }}
    >
      {n.label} {value}
      {unit}
    </span>
  );
}

function NutrientPill({ type, value, unit = "g" }) {
  const n = nutrientColors[type];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        padding: "5px 3px",
        borderRadius: 10,
        background: n.bg,
        minWidth: 36,
        flex: "1 1 auto",
      }}
    >
      <span style={{ fontSize: 8, fontWeight: 700, color: n.color }}>
        {n.label}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#191c1e" }}>
        {value}
        {unit}
      </span>
    </div>
  );
}

function MealCard({ meal, onClick }) {
  const totalKcal = meal.items.reduce((s, i) => s + i.kcal, 0);
  const totals = {
    carb: meal.items.reduce((s, i) => s + i.carb, 0),
    protein: meal.items.reduce((s, i) => s + i.protein, 0),
    fat: meal.items.reduce((s, i) => s + i.fat, 0),
    sugar: meal.items.reduce((s, i) => s + i.sugar, 0),
    chol: meal.items.reduce((s, i) => s + i.chol, 0),
    sodium: meal.items.reduce((s, i) => s + (i.sodium || 0), 0),
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #eceef0",
        minWidth: 260,
        flex: "1 1 260px",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <img
          src={meal.img}
          alt={meal.label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.style.background =
              "linear-gradient(135deg, #2d3335 0%, #1a1a2e 100%)";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          }}
        />
        <div style={{ position: "absolute", bottom: 16, left: 16 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {meal.time}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#fff",
              margin: "2px 0 0",
            }}
          >
            {meal.label}
          </p>
        </div>
      </div>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        {meal.items.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: "#191c1e" }}>
                {item.name}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0071e3",
                  whiteSpace: "nowrap",
                  marginLeft: 8,
                }}
              >
                {item.kcal} kcal
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <NutrientBadge type="carb" value={item.carb} />
              <NutrientBadge type="protein" value={item.protein} />
              <NutrientBadge type="fat" value={item.fat} />
              <NutrientBadge type="sugar" value={item.sugar} />
              <NutrientBadge type="chol" value={item.chol} unit="mg" />
              <NutrientBadge type="sodium" value={item.sodium} unit="mg" />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "0 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            borderTop: "1px solid #eceef0",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#414753",
              textTransform: "uppercase",
            }}
          >
            합계
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#191c1e" }}>
              {totalKcal}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#191c1e" }}>
              kcal
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <NutrientPill type="carb" value={totals.carb} />
          <NutrientPill type="protein" value={totals.protein} />
          <NutrientPill type="fat" value={totals.fat} />
          <NutrientPill type="sugar" value={totals.sugar} />
          <NutrientPill type="chol" value={totals.chol} unit="mg" />
          <NutrientPill type="sodium" value={totals.sodium} unit="mg" />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ current, target, over }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "#ebeef0",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 3,
          width: `${pct}%`,
          background: over ? "#bc2e16" : "#111",
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}

export default function MealPage() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null);

  const totalCal = 1420;
  const targetCal = 2100;
  const burned = 350;
  const remaining = targetCal - totalCal;
  const achievement = Math.round((totalCal / targetCal) * 100);

  return (
    <div
      style={{
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f2f2f2",
        minHeight: "100vh",
        color: "#2d3335",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: "32px 40px",
            width: "100%",
            minWidth: 0,
            overflow: "auto",
          }}
        >
          {/* Page Title */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    margin: 0,
                    color: "#2d3335",
                  }}
                >
                  오늘의 식단 기록 확인
                </h1>
                <p
                  style={{ fontSize: 15, color: "#5a6062", margin: "6px 0 0" }}
                >
                  지난 신체 변화를 분석한 결과입니다.
                </p>
              </div>

              {/* 날짜 선택 버튼 */}
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    position: "absolute",
                    pointerEvents: "none",
                    opacity: 0,
                  }}
                />
                <button
                  type="button"
                  onClick={() => dateInputRef.current?.showPicker()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 14,
                    background: "#fff",
                    border: "1px solid #e2e5e8",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#414753",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {selectedDate}
                  <span style={{ fontSize: 10, color: "#b0b8c1" }}>▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards Row */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 32,
              flexWrap: "wrap",
            }}
          >
            {/* Calorie Donut */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 240,
                flex: "0 0 auto",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 160,
                  height: 160,
                  marginBottom: 16,
                }}
              >
                <DonutChart
                  value={totalCal}
                  max={targetCal}
                  size={160}
                  strokeWidth={10}
                  color="#111"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 36, fontWeight: 600, color: "#040d1b" }}
                  >
                    1,420
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    / 2,100 kcal
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, textAlign: "center" }}>
                {[
                  { label: "잔여", value: remaining, color: "#171c1f" },
                  { label: "소모", value: burned, color: "#171c1f" },
                  {
                    label: "달성률",
                    value: `${achievement}%`,
                    color: "#004bca",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#94a3b8",
                        margin: 0,
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: s.color,
                        margin: "2px 0 0",
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 28,
                flex: "1 1 320px",
                display: "flex",
                gap: 28,
                alignItems: "center",
                minWidth: 0,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 160,
                  height: 160,
                  flexShrink: 0,
                }}
              >
                <DonutChart
                  value={85}
                  max={100}
                  size={160}
                  strokeWidth={10}
                  color="#10B981"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 11, fontWeight: 500, color: "#45474c" }}
                  >
                    오늘의 식단 점수
                  </span>
                  <span
                    style={{ fontSize: 40, fontWeight: 600, color: "#040d1b" }}
                  >
                    85
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#10B981" }}
                  >
                    훌륭한 균형
                  </span>
                </div>
              </div>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#040d1b",
                    margin: "0 0 10px",
                  }}
                >
                  영양 성분이 아주 조화롭습니다.
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#45474c",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                  }}
                >
                  현재까지 섭취한 영양소 비율이 권장 가이드라인에 매우 근접해
                  있습니다. 특히 단백질과 지방의 비율이 안정적이며, 남은 하루
                  동안 식이섬유 보충에만 신경 쓰시면 완벽한 하루가 될 것
                  같습니다.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["#단백질_충분", "#저당_식단"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: "#ecfdf5",
                        border: "1px solid #d1fae5",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#047857",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Meal Section */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#040d1b",
              margin: "0 0 16px",
            }}
          >
            오늘의 식단 기록 확인
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 36,
              flexWrap: "wrap",
            }}
          >
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={() => setSelectedMeal(meal)}
              />
            ))}
          </div>

          {/* Nutrition Analysis */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28 }}>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "#040d1b",
                margin: "0 0 24px",
              }}
            >
              오늘의 영양 성분 분석
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px 48px",
              }}
            >
              {nutritionSummary.map((n) => (
                <div
                  key={n.label}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#040d1b",
                      }}
                    >
                      {n.label}
                    </span>
                    <span style={{ fontSize: 13 }}>
                      <strong style={{ color: "#040d1b" }}>
                        {n.current.toLocaleString()}
                        {n.unit}
                      </strong>
                      <span style={{ color: "#45474c" }}>
                        {" "}
                        / {n.target.toLocaleString()}
                        {n.unit}
                      </span>
                    </span>
                  </div>
                  <ProgressBar
                    current={n.current}
                    target={n.target}
                    over={n.over}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MealDetailModal
        isOpen={!!selectedMeal}
        mealData={buildMealData(selectedMeal)}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}