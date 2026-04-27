const ScoreCard = ({
    
...props
    }) => {
return(
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
);
};

export default ScoreCard;
