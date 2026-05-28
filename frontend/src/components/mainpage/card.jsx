import { Link } from "react-router-dom";
import { Pill } from "lucide-react";
import MealIcon from "../../assets/MainPageIcon/Meal.svg";
import ExerciseIcon from "../../assets/MainPageIcon/Ex.svg";
import WaterIcon from "../../assets/MainPageIcon/Water.svg";
import SupplementIcon from "../../assets/MainPageIcon/SubMedicine.svg";
import BloodSugarIcon from "../../assets/MainPageIcon/BloodSugar.svg";
import BloodPressureIcon from "../../assets/MainPageIcon/BloodPressure.svg";
import WeightIcon from "../../assets/MainPageIcon/Weight.svg";
import MedicineIcon from "../../assets/MainPageIcon/Medicine.svg";

const ML_PER_CUP = 200;

// "70~99", "<120", ">60", "70-99" 등 다양한 형식 파싱
const parseRange = (raw) => {
    if (raw == null) return { min: null, max: null };
    if (typeof raw === "number") return { min: null, max: raw };
    const s = String(raw).trim();
    const tildeMatch = s.match(/^(\d+(?:\.\d+)?)\s*[~\-]\s*(\d+(?:\.\d+)?)$/);
    if (tildeMatch) return { min: Number(tildeMatch[1]), max: Number(tildeMatch[2]) };
    const ltMatch = s.match(/^<\s*(\d+(?:\.\d+)?)$/);
    if (ltMatch) return { min: null, max: Number(ltMatch[1]) };
    const gtMatch = s.match(/^>\s*(\d+(?:\.\d+)?)$/);
    if (gtMatch) return { min: Number(gtMatch[1]), max: null };
    const numMatch = s.match(/^\d+(?:\.\d+)?$/);
    if (numMatch) return { min: null, max: Number(s) };
    return { min: null, max: null };
};

const getBloodSugarStatus = (value, normalRaw) => {
    if (value == null) return { label: "기록 없음", color: "text-[#94A3B8]" };
    const { min, max } = parseRange(normalRaw);
    const lo = min ?? 70;
    const hi = max ?? 99;
    if (value > hi) return { label: "정상 범위 초과", color: "text-red-500" };
    if (value < lo) return { label: "정상 범위 미만", color: "text-blue-500" };
    return { label: "정상 범위", color: "text-emerald-600" };
};

const getBloodPressureStatus = (systolic, diastolic, sysRaw, diaRaw) => {
    if (systolic == null || diastolic == null)
        return { label: "수축기 / 이완기", color: "text-[#475569]" };
    const sysMax = parseRange(sysRaw).max ?? 120;
    const diaMax = parseRange(diaRaw).max ?? 80;
    if (systolic > sysMax || diastolic > diaMax)
        return { label: "정상 범위 초과", color: "text-[#ED5934]" };
    return { label: "정상 범위", color: "text-emerald-600" };
};

const Card = ({ data = {} }) => {
    const {
        bloodSugar,            // { value, recordedAt }
        bloodPressure,         // { systolic, diastolic, recordedAt }
        weight,                // { value, recordedAt }
        todayMealKcal,         // number
        todayBurnedKcal,       // number
        water,                 // { cups, targetCups }
        medicine,              // { todayRemaining, groups: [{ name, items }] }
        normal = {},           // { bloodSugar, systolicBP, diastolicBP }
    } = data;

    const sugarStatus = getBloodSugarStatus(bloodSugar?.value, normal.bloodSugar);
    const pressureStatus = getBloodPressureStatus(
        bloodPressure?.systolic,
        bloodPressure?.diastolic,
        normal.systolicBP,
        normal.diastolicBP,
    );

    const waterCups = water?.cups ?? 0;
    const waterMl = waterCups * ML_PER_CUP;
    const waterRemainCups =
        water?.targetCups != null
            ? Math.max(0, water.targetCups - waterCups)
            : null;

    const medicineGroups = medicine?.groups ?? [];

    const statusCards = [
        {
            link: "blood-sugar",
            type: "혈당",
            value:
                bloodSugar?.value != null
                    ? `${bloodSugar.value} mg/dL`
                    : "기록 없음",
            label: sugarStatus.label,
            color: "bg-white",
            labelColor: "text-black",
            undercolor: sugarStatus.color,
            overcolor: "text-[#475569]",
            icon: "tint",
        },
        {
            link: "blood-pressure",
            type: "혈압",
            value:
                bloodPressure?.systolic != null && bloodPressure?.diastolic != null
                    ? `${bloodPressure.systolic} / ${bloodPressure.diastolic}`
                    : "기록 없음",
            label: pressureStatus.label,
            color: "bg-[#FFEEE3]",
            labelColor: "text-black",
            undercolor: pressureStatus.color,
            overcolor: "text-[#475569]",
            icon: "heart",
        },
        {
            link: "weight",
            type: "체중",
            value: weight?.value != null ? `${weight.value}kg` : "기록 없음",
            label: weight?.value != null ? "최근 측정" : "측정 기록이 없습니다",
            color: "bg-[#F0F0F0]",
            labelColor: "text-black",
            undercolor: "text-[#5E5E5E]",
            overcolor: "text-[#475569]",
            icon: "chart-line",
        },
    ];

    const actionCards = [
        {
            link: "meal",
            type: "식단",
            value: "오늘 식단 확인",
            label:
                todayMealKcal != null
                    ? `총 섭취 칼로리 ${Math.round(todayMealKcal)}kcal`
                    : "총 섭취 칼로리 0kcal",
            color: "bg-[#DAFFE7]",
            labelColor: "text-black",
            undercolor: "text-[#008039]",
            overcolor: "text-[#475569]",
            icon: "meal",
        },
        {
            link: "exercise",
            type: "운동",
            value: "오늘 운동 확인",
            label:
                todayBurnedKcal != null
                    ? `소모 칼로리 ${Math.round(todayBurnedKcal)}kcal`
                    : "소모 칼로리 0kcal",
            color: "bg-[#FFFEAF]",
            labelColor: "text-black",
            undercolor: "text-[#E8BA00]",
            overcolor: "text-[#475569]",
            icon: "exercise",
        },
        {
            link: "all",
            type: "수분 섭취",
            value: `총 ${waterMl}ml`,
            label:
                waterRemainCups != null
                    ? waterRemainCups === 0
                        ? "목표량 달성"
                        : `목표량까지 ${waterRemainCups}컵`
                    : "목표 미설정",
            color: "bg-[#D6F6FF]",
            labelColor: "text-black",
            undercolor: "text-[#2A3491]",
            overcolor: "text-[#475569]",
            icon: "water",
        },
    ];

    const medicineCard = {
        link: "/medicine",
        type: "복약 알림",
        value:
            medicine?.todayRemaining != null && medicine.todayRemaining > 0
                ? `${medicine.todayRemaining}건 확인 필요`
                : "복용 완료",
        label:
            medicine?.todayRemaining != null && medicine.todayRemaining > 0
                ? "오늘 먹어야 하는 약"
                : "오늘 일정이 모두 완료되었습니다",
        color: "bg-[#C9C7C7]",
        labelColor: "text-black",
        undercolor: "text-black",
        overcolor: "text-white",
        icon: "pill",
        groups: medicineGroups,
    };

    const renderIcon = (type) => {
        switch (type) {
            case "tint":
                return <img src={BloodSugarIcon} className="w-[50px] h-[50px] object-contain" alt="혈당 아이콘" />;
            case "heart":
                return <img src={BloodPressureIcon} className="w-[50px] h-[50px] object-contain" alt="혈압 아이콘" />;
            case "chart-line":
                return <img src={WeightIcon} className="w-[50px] h-[50px] object-contain" alt="체중 아이콘" />;
            case "pill":
                return <img src={MedicineIcon} className="w-[50px] h-[50px] object-contain" alt="복약 아이콘" />;
            default:
                return null;
        }
    };

    const renderActionIcon = (type) => {
        switch (type) {
            case "meal":
                return <img src={MealIcon} className="w-[50px] h-[50px] object-contain" alt="식단 아이콘" />;
            case "exercise":
                return <img src={ExerciseIcon} className="w-[50px] h-[50px] object-contain" alt="운동 아이콘" />;
            case "water":
                return <img src={WaterIcon} className="w-[50px] h-[50px] object-contain" alt="수분 아이콘" />;
            case "supplement":
                return <img src={SupplementIcon} className="w-[50px] h-[50px] object-contain" alt="영양제 아이콘" />;
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-stretch">
            <div className="space-y-4 md:space-y-8 lg:col-span-3">
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {statusCards.map((card, idx) => (
                        <Link to={`/check/${card.link}`} key={idx}>
                            <div className={`${card.color} p-6 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-slate-100 flex items-center justify-between gap-4 min-h-[140px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]`}>
                                <div>
                                    <p className={`text-sm font-bold ${card.overcolor || "text-slate-400"} mb-1`}>{card.type}</p>
                                    <p className="text-xl font-bold">{card.value}</p>
                                    <p className={`text-xs mt-1 ${card.undercolor || "text-slate-400"}`}>{card.label}</p>
                                </div>
                                <div className="flex-shrink-0">{renderIcon(card.icon)}</div>
                            </div>
                        </Link>
                    ))}
                </section>

                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {actionCards.map((card, idx) => (
                        <Link to={`/check/${card.link}`} key={idx}>
                            <div className={`${card.color} ${card.textColor || "text-slate-900"} p-6 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-slate-100 flex items-center justify-between gap-4 min-h-[140px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]`}>
                                <div>
                                    <p className={`text-sm font-bold ${card.overcolor || "text-slate-400"} mb-1`}>{card.type}</p>
                                    <p className={`text-lg font-bold ${card.labelColor || "text-black"}`}>{card.value}</p>
                                    <p className={`text-xs mt-1 ${card.undercolor || "text-slate-400"}`}>{card.label}</p>
                                </div>
                                <div className="flex-shrink-0">{renderActionIcon(card.icon)}</div>
                            </div>
                        </Link>
                    ))}
                </section>
            </div>

            <section className="lg:h-full">
                <Link to={`/check${medicineCard.link}`} className="block h-full">
                    <div className={`${medicineCard.color} p-6 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-slate-100 flex h-full min-h-[180px] lg:min-h-full flex-col gap-10 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={`text-sm font-bold ${medicineCard.overcolor || "text-slate-400"} mb-1`}>{medicineCard.type}</p>
                                <p className="text-xl font-bold">{medicineCard.value}</p>
                                <p className={`text-xs mt-1 ${medicineCard.undercolor || "text-slate-400"}`}>{medicineCard.label}</p>
                            </div>
                            <div className="flex-shrink-0">{renderIcon(medicineCard.icon)}</div>
                        </div>

                        <div className="space-y-5">
                            {medicineGroups.length === 0 ? (
                                <p className="text-xs text-[#475569]">등록된 처방 약이 없습니다.</p>
                            ) : (
                                medicineGroups.map((group) => (
                                    <div key={group.name} className="space-y-3">
                                        <p className="text-xs font-semibold text-[#475569]">{group.name}</p>
                                        <div className="space-y-2">
                                            {group.items.map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center gap-2.5 rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-sm"
                                                >
                                                    <Pill className="h-4 w-4 shrink-0 text-slate-500" />
                                                    <span className="truncate">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Link>
            </section>
        </div>
    );
};
export default Card;
