// import { useState } from "react";

const meals = [
  {
    id: "breakfast",
    label: "아침",
    time: "08:30 AM",
    img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop",
    items: [
      { name: "그릭 요거트와 블루베리", kcal: 245, carb: 18, protein: 12, fat: 8, sugar: 4, chol: 5 },
      { name: "아몬드 한 줌", kcal: 160, carb: 6, protein: 6, fat: 14, sugar: 1, chol: 0 },
    ],
  },
  {
    id: "lunch",
    label: "점심",
    time: "12:45 PM",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    items: [
      { name: "연어 샐러드", kcal: 480, carb: 12, protein: 34, fat: 28, sugar: 3, chol: 45 },
      { name: "현미밥 반 공기", kcal: 150, carb: 32, protein: 3, fat: 1, sugar: 0, chol: 0 },
    ],
  },
  {
    id: "dinner",
    label: "저녁",
    time: "07:15 PM",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    items: [
      { name: "닭가슴살 구이", kcal: 310, carb: 0, protein: 42, fat: 12, sugar: 0, chol: 75 },
      { name: "구운 고구마와 야채", kcal: 220, carb: 45, protein: 4, fat: 1, sugar: 8, chol: 0 },
    ],
  },
  {
    id: "snack",
    label: "간식",
    time: "04:00 PM",
    img: "https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=400&h=300&fit=crop",
    items: [
      { name: "사과와 땅콩버터", kcal: 190, carb: 22, protein: 4, fat: 11, sugar: 15, chol: 0 },
      { name: "단백질 쉐이크", kcal: 120, carb: 3, protein: 24, fat: 1, sugar: 1, chol: 15 },
    ],
  },
];

const nutrientColors = {
  carb: { label: "탄", color: "#6e7da2", bg: "rgba(110,125,162,0.08)" },
  protein: { label: "단", color: "#0071e3", bg: "rgba(0,113,227,0.08)" },
  fat: { label: "지", color: "#9b3f00", bg: "rgba(155,63,0,0.08)" },
  sugar: { label: "당", color: "#e91e63", bg: "rgba(233,30,99,0.08)" },
  chol: { label: "콜", color: "#795548", bg: "rgba(121,85,72,0.08)" },
};

const sidebarItems = [
  { icon: "blood_pressure", label: "혈압" },
  { icon: "weight", label: "체중" },
  { icon: "blood_sugar", label: "혈당" },
  { icon: "exercise", label: "운동" },
  { icon: "medicine", label: "약 복용" },
  { icon: "diet", label: "식단", active: true },
];

const nutritionSummary = [
  { label: "탄수화물", current: 125, target: 260, unit: "g", over: false },
  { label: "단백질", current: 65, target: 120, unit: "g", over: false },
  { label: "지방", current: 132, target: 70, unit: "g", over: true },
  { label: "당류", current: 24, target: 50, unit: "g", over: false },
  { label: "나트륨", current: 1120, target: 2000, unit: "mg", over: false },
  { label: "콜레스테롤", current: 150, target: 300, unit: "mg", over: false },
];

function SidebarIcon({ type }) {
  const icons = {
    blood_pressure: (
      <svg width="16" height="19" viewBox="0 0 16 19" fill="none"><path d="M8 19C5.783 19 3.896 18.233 2.338 16.7.779 15.167 0 13.3 0 11.1c0-1.083.208-2.096.625-3.038A8.463 8.463 0 012.35 5.55L8 0l5.65 5.55a8.463 8.463 0 011.725 1.513c.417.941.625 1.954.625 3.037 0 2.2-.779 4.067-2.338 5.6C12.104 18.233 10.217 19 8 19zM2.05 12h11.85c.2-1.2.088-2.225-.338-3.075-.425-.85-.862-1.492-1.312-1.925L8 2.8 3.75 7c-.45.433-.892 1.075-1.325 1.925S1.867 10.8 2.05 12z" fill="currentColor"/></svg>
    ),
    weight: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 9a3 3 0 100-6 3 3 0 000 6zM2 18a2 2 0 01-2-2V2a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H2zm0-2h14V2H2v14z" fill="currentColor"/></svg>
    ),
    blood_sugar: (
      <svg width="16" height="19" viewBox="0 0 16 19" fill="none"><path d="M8 19C5.783 19 3.896 18.233 2.338 16.7.779 15.167 0 13.3 0 11.1c0-1.083.208-2.096.625-3.038A8.463 8.463 0 012.35 5.55L8 0l5.65 5.55a8.463 8.463 0 011.725 1.513c.417.941.625 1.954.625 3.037 0 2.2-.779 4.067-2.338 5.6C12.104 18.233 10.217 19 8 19z" fill="currentColor"/></svg>
    ),
    exercise: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11.3 19.8l-1.4-1.4 3.55-3.55-8.5-8.5L1.4 9.9 0 8.5l1.4-1.45L0 5.65l2.1-2.1L.7 2.1 2.1.7l1.45 1.4L5.65 0l1.4 1.4L8.5 0l1.4 1.4-3.55 3.55 8.5 8.5 3.55-3.55 1.4 1.4-1.4 1.45 1.4 1.4-2.1 2.1 1.4 1.45-1.4 1.4-1.45-1.4-2.1 2.1-1.4-1.4L11.3 19.8z" fill="currentColor"/></svg>
    ),
    medicine: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="7" width="16" height="4" rx="2" fill="currentColor"/><rect x="7" y="1" width="4" height="16" rx="2" fill="currentColor"/></svg>
    ),
    diet: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="currentColor"/><circle cx="10" cy="10" r="3" fill="currentColor"/></svg>
    ),
  };
  return icons[type] || null;
}

function DonutChart({ value, max, size = 160, strokeWidth = 10, color = "#000" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E9EB" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function NutrientBadge({ type, value, unit = "g" }) {
  const n = nutrientColors[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 8, background: n.bg, fontSize: 10, fontWeight: 700, color: n.color, whiteSpace: "nowrap" }}>
      {n.label} {value}{unit}
    </span>
  );
}

function NutrientPill({ type, value, unit = "g" }) {
  const n = nutrientColors[type];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px", borderRadius: 12, background: n.bg, minWidth: 42 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: n.color }}>{n.label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#191c1e" }}>{value}{unit}</span>
    </div>
  );
}

function MealCard({ meal }) {
  const totalKcal = meal.items.reduce((s, i) => s + i.kcal, 0);
  const totals = {
    carb: meal.items.reduce((s, i) => s + i.carb, 0),
    protein: meal.items.reduce((s, i) => s + i.protein, 0),
    fat: meal.items.reduce((s, i) => s + i.fat, 0),
    sugar: meal.items.reduce((s, i) => s + i.sugar, 0),
    chol: meal.items.reduce((s, i) => s + i.chol, 0),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: 12, overflow: "hidden", background: "#fff", border: "1px solid #eceef0", minWidth: 260, flex: "1 1 260px" }}>
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <img src={meal.img} alt={meal.label} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg, #2d3335 0%, #1a1a2e 100%)"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 16, left: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", margin: 0 }}>{meal.time}</p>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#fff", margin: "2px 0 0" }}>{meal.label}</p>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {meal.items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#191c1e" }}>{item.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0071e3", whiteSpace: "nowrap", marginLeft: 8 }}>{item.kcal} kcal</span>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <NutrientBadge type="carb" value={item.carb} />
              <NutrientBadge type="protein" value={item.protein} />
              <NutrientBadge type="fat" value={item.fat} />
              <NutrientBadge type="sugar" value={item.sugar} />
              <NutrientBadge type="chol" value={item.chol} unit="mg" />
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ borderTop: "1px solid #eceef0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#414753", textTransform: "uppercase" }}>합계</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#191c1e" }}>{totalKcal}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#191c1e" }}>kcal</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <NutrientPill type="carb" value={totals.carb} />
          <NutrientPill type="protein" value={totals.protein} />
          <NutrientPill type="fat" value={totals.fat} />
          <NutrientPill type="sugar" value={totals.sugar} />
          <NutrientPill type="chol" value={totals.chol} unit="mg" />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ current, target, over }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div style={{ height: 6, borderRadius: 3, background: "#ebeef0", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: over ? "#bc2e16" : "#111", transition: "width 0.8s ease" }} />
    </div>
  );
}

export default function MealPage() {
  const totalCal = 1420;
  const targetCal = 2100;
  const burned = 350;
  const remaining = targetCal - totalCal;
  const achievement = Math.round((totalCal / targetCal) * 100);

  return (
    <div style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f2f2f2", minHeight: "100vh", color: "#2d3335" }}>
      {/* Header */}
      <header style={{ background: "#121b2b", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Ballife</span>
        <nav style={{ display: "flex", gap: 40 }}>
          {["기록", "확인", "커뮤니티", "회원정보", "소개"].map((item) => (
            <a key={item} href="#" style={{ color: "#fff", fontSize: 15, fontWeight: 500, textDecoration: "none", opacity: 0.85 }}
              onMouseEnter={(e) => (e.target.style.opacity = 1)} onMouseLeave={(e) => (e.target.style.opacity = 0.85)}>
              {item}
            </a>
          ))}
        </nav>
        <button style={{ width: 36, height: 36, borderRadius: "50%", background: "#252f43", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 1h16M1 7h16M1 13h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Main Content */}
        <main style={{ flex: 1, padding: "32px 40px", width: "100%", overflow: "auto" }}>
          {/* Page Title */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: "#2d3335" }}>오늘의 식단 기록 확인</h1>
                <p style={{ fontSize: 15, color: "#5a6062", margin: "6px 0 0" }}>지난 신체 변화를 분석한 결과입니다.</p>
              </div>
              <button style={{ padding: "10px 24px", borderRadius: 14, background: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                전체 보기
              </button>
            </div>
          </div>

          {/* Summary Cards Row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 32 }}>
            {/* Calorie Donut */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 240 }}>
              <div style={{ position: "relative", width: 160, height: 160, marginBottom: 16 }}>
                <DonutChart value={totalCal} max={targetCal} size={160} strokeWidth={10} color="#111" />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 36, fontWeight: 600, color: "#040d1b" }}>1,420</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>/ 2,100 kcal</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, textAlign: "center" }}>
                {[{ label: "잔여", value: remaining, color: "#171c1f" }, { label: "소모", value: burned, color: "#171c1f" }, { label: "달성률", value: `${achievement}%`, color: "#004bca" }].map((s) => (
                  <div key={s.label}>
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8", margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 17, fontWeight: 600, color: s.color, margin: "2px 0 0" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Card */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, flex: 1, display: "flex", gap: 28, alignItems: "center" }}>
              <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                <DonutChart value={85} max={100} size={160} strokeWidth={10} color="#10B981" />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#45474c" }}>오늘의 식단 점수</span>
                  <span style={{ fontSize: 40, fontWeight: 600, color: "#040d1b" }}>85</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#10B981" }}>훌륭한 균형</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, color: "#040d1b", margin: "0 0 10px" }}>영양 성분이 아주 조화롭습니다.</h3>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#45474c", lineHeight: 1.6, margin: "0 0 14px" }}>
                  현재까지 섭취한 영양소 비율이 권장 가이드라인에 매우 근접해 있습니다. 특히 단백질과 지방의 비율이 안정적이며, 남은 하루 동안 식이섬유 보충에만 신경 쓰시면 완벽한 하루가 될 것 같습니다.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["#단백질_충분", "#저당_식단"].map((tag) => (
                    <span key={tag} style={{ padding: "4px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #d1fae5", fontSize: 12, fontWeight: 500, color: "#047857" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Meal Section */}
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "#040d1b", margin: "0 0 16px" }}>오늘의 식단 기록 확인</h2>
          <div style={{ display: "flex", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>

          {/* Nutrition Analysis */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: 500, color: "#040d1b", margin: "0 0 24px" }}>오늘의 영양 성분 분석</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 48px" }}>
              {nutritionSummary.map((n) => (
                <div key={n.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#040d1b" }}>{n.label}</span>
                    <span style={{ fontSize: 13 }}>
                      <strong style={{ color: "#040d1b" }}>{n.current.toLocaleString()}{n.unit}</strong>
                      <span style={{ color: "#45474c" }}> / {n.target.toLocaleString()}{n.unit}</span>
                    </span>
                  </div>
                  <ProgressBar current={n.current} target={n.target} over={n.over} />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside style={{ width: 280, background: "rgba(196,196,196,0.3)", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: "#000", margin: "0 0 12px", paddingLeft: 16 }}>건강 지표</h3>
          {sidebarItems.map((item) => (
            <div key={item.label}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                borderRadius: item.active ? "0 999px 999px 0" : "0 999px 999px 0",
                background: item.active ? "#fff" : "transparent",
                boxShadow: item.active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer", transition: "background 0.2s",
                color: "#000", fontSize: 15, fontWeight: 400,
              }}
              onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SidebarIcon type={item.icon} />
              </span>
              <span>{item.label}</span>
            </div>
          ))}

          <button style={{
            display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", marginTop: 8,
            borderRadius: "0 999px 999px 0", background: "#131c2c", border: "none",
            color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%",
          }}>
            등록 하기
          </button>

          {/* AI Suggestion */}
          <div style={{ marginTop: "auto", padding: 22, borderRadius: 20, background: "#fff", border: "1.5px solid #004ddf", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <svg width="14" height="18" viewBox="0 0 15 20" fill="none"><path d="M7.5 20a2 2 0 01-2-2h4a2 2 0 01-2 2zm-4-3v-2h8v2h-8zm.25-3C2.6 13.317 1.688 12.4 1.013 11.25.337 10.1 0 8.85 0 7.5 0 5.417.729 3.646 2.188 2.188 3.646.729 5.417 0 7.5 0s3.854.729 5.313 2.188C14.27 3.646 15 5.417 15 7.5c0 1.35-.337 2.6-1.013 3.75C13.313 12.4 12.4 13.317 11.25 14h-7.5z" fill="#004DDF"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#004ddf", textTransform: "uppercase", letterSpacing: 0.5 }}>AI 다음 식단 제안</span>
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 500, color: "#040d1b", margin: "0 0 8px" }}>식이섬유 보충이 필요해요!</h4>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#45474c", lineHeight: 1.6, margin: "0 0 14px" }}>
              오늘 식이섬유 섭취량이 부족합니다. 저녁 식사 전 간식으로 <span style={{ color: "#004ddf" }}>사과 한 개</span>나 <span style={{ color: "#004ddf" }}>당근 스틱</span>을 드시는 건 어떨까요?
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, background: "rgba(0,77,223,0.05)" }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="18" viewBox="0 0 14 19" fill="none"><path d="M7 19c-1.95 0-3.604-.679-4.963-2.037C.68 15.604 0 13.95 0 12c0-1.567.463-2.971 1.388-4.213a7.51 7.51 0 013.637-2.494A4.96 4.96 0 014.05 4.93a5.1 5.1 0 01-.85-1.612C3.03 2.56 2.992 1.79 3.075 1.006c.783-.083 1.554-.046 2.313.113.758.158 1.412.512 1.962 1.062.383.383.663.817.838 1.3.175.483.287.992.337 1.525a9.68 9.68 0 01.788-1.462 8.67 8.67 0 011.037-1.263c.183-.183.417-.275.7-.275.283 0 .517.092.7.275.183.183.275.417.275.7s-.092.517-.275.7c-.367.367-.692.771-.975 1.212a7.34 7.34 0 00-.625 1.413c1.467.467 2.65 1.312 3.55 2.537.9 1.225 1.35 2.604 1.35 4.138 0 1.95-.679 3.604-2.038 4.962C11.604 18.321 9.95 19 8 19z" fill="#004DDF"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "#45474c", margin: 0 }}>기대 효과</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#040d1b", margin: "2px 0 0" }}>소화 개선 및 혈당 조절</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}