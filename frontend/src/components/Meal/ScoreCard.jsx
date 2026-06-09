import { useTranslation } from "react-i18next";

const ScoreCard = ({

...props
    }) => {
const { t } = useTranslation();
return(
            <div className="flex flex-col items-center gap-7 sm:flex-row" style={{ background: "#fff", borderRadius: 16, padding: 28, flex: 1 }}>
              <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                <DonutChart value={85} max={100} size={160} strokeWidth={10} color="#10B981" />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#45474c" }}>{t('mealScoreCard.todayScoreLabel')}</span>
                  <span style={{ fontSize: 40, fontWeight: 600, color: "#040d1b" }}>85</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#10B981" }}>{t('mealScoreCard.balanceStatus')}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, color: "#040d1b", margin: "0 0 10px" }}>{t('mealScoreCard.heading')}</h3>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#45474c", lineHeight: 1.6, margin: "0 0 14px" }}>
                  {t('mealScoreCard.description')}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[t('mealScoreCard.tagProtein'), t('mealScoreCard.tagLowSugar')].map((tag) => (
                    <span key={tag} style={{ padding: "4px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #d1fae5", fontSize: 12, fontWeight: 500, color: "#047857" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
);
};

export default ScoreCard;
