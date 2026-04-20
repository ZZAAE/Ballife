import { Link } from "react-router-dom";
import MealIcon from "../../assets/MainPageIcon/Meal.svg";
import ExerciseIcon from "../../assets/MainPageIcon/Ex.svg";
import WaterIcon from "../../assets/MainPageIcon/Water.svg";
import SupplementIcon from "../../assets/MainPageIcon/SubMedicine.svg";
import BloodSugarIcon from "../../assets/MainPageIcon/BloodSugar.svg";
import BloodPressureIcon from "../../assets/MainPageIcon/BloodPressure.svg";
import WeightIcon from "../../assets/MainPageIcon/Weight.svg";
import MedicineIcon from "../../assets/MainPageIcon/Medicine.svg";


const Card = () => {

    const statusCards = [
    { 
        type: '혈당', 
        value: '112 mg/dL', 
        label: '안정 범위', // bloodsugar > 140 ? 위험 범위 :  bloodsugar > 120 || bloodsugar < 80 ? 주의 요망 : 안정 범위 
        color: 'bg-white', 
        labelColor: 'text-black', 
        undercolor: 'text-red-400', 
        overcolor: 'text-[#475569]', 
        icon: 'tint' 
    },
    { 
        type: '혈압', 
        value: '118 / 70', 
        label: '수축기 / 이완기', // systolic_bp < 80 || diastolic_bp > 120 ? 위험 : 정상
        color: 'bg-[#FFEEE3]', 
        labelColor: 'text-black', 
        undercolor: 'text-[#ED5934]', 
        overcolor: 'text-[#475569]', 
        icon: 'heart' 
    },
    { 
        type: '체중', 
        value: '58kg', 
        label: '정상', 
        color: 'bg-[#F0F0F0]', 
        labelColor: 'text-black', 
        undercolor: 'text-[#5E5E5E]', 
        overcolor: 'text-[#475569]', 
        icon: 'chart-line' 
    },
    { 
        type: '복약 알림', 
        value: '2건 확인 필요', 
        label: '오전 복용 요망', 
        color: 'bg-[#C9C7C7]', 
        labelColor: 'text-black', 
        undercolor: 'text-black', 
        overcolor: 'text-white', 
        icon: 'pill' 
    },
    ];

    const actionCards = [
  {
    type: '식단',
    value: '오늘 식단 등록',
    label: '총 섭취 칼로리 1300kcal',
    color: 'bg-[#DAFFE7]',
    labelColor: 'text-black',
    undercolor: 'text-[#008039]',
    overcolor: 'text-[#475569]',
    icon: 'meal',
  },
  {
    type: '운동',
    value: '오늘 운동 등록',
    label: '소모 칼로리 300kcal',
    color: 'bg-[#FFFEAF]',
    labelColor: 'text-black',
    undercolor: 'text-[#E8BA00]',
    overcolor: 'text-[#475569]',
    icon: 'exercise',
  },
  {
    type: '수분 섭취',
    value: '총 400ml',
    label: '목표량까지 3컵',
    color: 'bg-[#D6F6FF]',
    labelColor: 'text-black',
    undercolor: 'text-[#2A3491]',
    overcolor: 'text-[#475569]',
    icon: 'water',
  },
  {
    type: '영양제',
    value: '2건 확인 필요',
    label: '오전 복용 요망',
    color: 'bg-[#3C3C3C]',
    labelColor: 'text-white',
    undercolor: 'text-white',
    overcolor: 'text-white/70',
    icon: 'supplement',
  },
];

    const renderIcon = (type) => {
    switch (type) {
      case 'tint': return <img src={BloodSugarIcon} className="w-[50px] h-[50px] object-contain" alt="혈당 아이콘" />; // 물방울 (혈당)
      case 'heart': return <img src={BloodPressureIcon} className="w-[50px] h-[50px] object-contain" alt="혈압 아이콘" />;   // 하트 (혈압)
      case 'chart-line': return <img src={WeightIcon} className="w-[50px] h-[50px] object-contain" alt="체중 아이콘" />; // 선 차트 모양 (체중)
      case 'pill': return <img src={MedicineIcon} className="w-[50px] h-[50px] object-contain" alt="복약 아이콘" />; // 알약 모양 (복약)
      default: return null;
    }
  };

    const renderActionIcon = (type) => {
    switch (type) {
      case 'meal': return <img src={MealIcon} className="w-[50px] h-[50px] object-contain" alt="식단 아이콘" />; // 식단 아이콘
      case 'exercise': return <img src={ExerciseIcon} className="w-[50px] h-[50px] object-contain" alt="운동 아이콘" />;   // 운동 아이콘
      case 'water': return <img src={WaterIcon} className="w-[50px] h-[50px] object-contain" alt="수분 아이콘" />; // 수분 아이콘
      case 'supplement': return <img src={SupplementIcon} className="w-[50px] h-[50px] object-contain" alt="영양제 아이콘" />; // 영양제 아이콘
      default: return null;
    }
  };

    return (
        <div>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {statusCards.map((card, idx) => (
            <Link to={`/record/${card.type.toLowerCase()}`} key={idx}>
            <div className= {`${card.color} p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4 min-h-[140px]`}>
              <div>
                <p className={`text-xs ${card.overcolor || 'text-slate-400'} mb-1`}>{card.type}</p>
                <p className="text-xl font-bold">{card.value}</p>
                <p className={`text-xs mt-1 ${card.undercolor || 'text-slate-400'}`}>{card.label}</p>
              </div>
              <div className="flex-shrink-0">
                {renderIcon(card.icon)}
              </div>
            </div>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 md:py-8">
          {actionCards.map((card, idx) => (
            <Link to={`/record/${card.type.toLowerCase()}`} key={idx}>
            <div className={`${card.color} ${card.textColor || 'text-slate-900'} p-6 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity min-h-[140px] `}>
              <div>
                <p className={`text-xs ${card.overcolor || 'text-slate-400'} mb-1`}>{card.type}</p>
                <p className={`text-lg font-bold ${card.labelColor || 'text-black'}`}>{card.value}</p>
                <p className={`text-xs mt-1 ${card.undercolor || 'text-slate-400'}`}>{card.label}</p>
              </div>
              <div className="flex-shrink-0">
                {renderActionIcon(card.icon)}
              </div>
            </div>
            </Link>
          ))}
        </section>
        </div>
    );
}
export default Card;