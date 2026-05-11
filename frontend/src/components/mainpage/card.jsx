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
        link: 'sugar',
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
        link: 'press',
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
        link: 'weight',
        type: '체중', 
        value: '58kg', 
        label: '정상', 
        color: 'bg-[#F0F0F0]', 
        labelColor: 'text-black', 
        undercolor: 'text-[#5E5E5E]', 
        overcolor: 'text-[#475569]', 
        icon: 'chart-line' 
    },
    
    ];

    const actionCards = [
    {
      link: 'meal',
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
      link: 'exercise',
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
      link: 'water',
      type: '수분 섭취',
      value: '총 400ml',
      label: '목표량까지 3컵',
      color: 'bg-[#D6F6FF]',
      labelColor: 'text-black',
      undercolor: 'text-[#2A3491]',
      overcolor: 'text-[#475569]',
      icon: 'water',
    },
  ];

const medicineCard = [
  { 
        link: 'medicine',
        type: '복약 알림', 
        value: '2건 확인 필요', 
        label: '오전 복용 요망', 
        color: 'bg-[#C9C7C7]', 
        labelColor: 'text-black', 
        undercolor: 'text-black', 
        overcolor: 'text-white', 
        icon: 'pill',
        groups: [
          {
            name: '처방 그룹 이름',
            items: ['혈압약', '당뇨약'],
          },
        ],
    },
]

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div className="space-y-4 md:space-y-8">
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {statusCards.map((card, idx) => (
              <Link to={`/record/${card.link}`} key={idx}>
              <div className={`${card.color} p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4 min-h-[140px]`}>
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

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card, idx) => (
              <Link to={`/record/${card.link}`} key={idx}>
              <div className={`${card.color} ${card.textColor || 'text-slate-900'} p-6 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity min-h-[140px]`}>
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

        <section className="lg:h-full">
          {medicineCard.map((card, idx) => (
            <Link to={card.link.startsWith('/') ? card.link : `/record/${card.link}`} key={idx} className="block h-full">
            <div className={`${card.color} p-6 rounded-2xl shadow-sm border border-slate-100 flex h-full min-h-[180px] lg:min-h-full flex-col gap-10`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs ${card.overcolor || 'text-slate-400'} mb-1`}>{card.type}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                  <p className={`text-xs mt-1 ${card.undercolor || 'text-slate-400'}`}>{card.label}</p>
                </div>
                <div className="flex-shrink-0">
                  {renderIcon(card.icon)}
                </div>
              </div>

              <div className="space-y-5">
                {card.groups?.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <p className="text-xs font-semibold text-[#475569]">{group.name}</p>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </Link>
          ))}
          <div>
          </div>
        </section>
        </div>
    );
}
export default Card;