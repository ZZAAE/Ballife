import { useState } from "react";

import characteristicIcon from "../assets/icons/characteristic.svg";
import aiIcon from "../assets/icons/ai.svg";

import allIcon from "../assets/icons/all.svg";
import bloodPressureIcon from "../assets/icons/bloodpressure.svg";
import bloodIcon from "../assets/icons/blood.svg";
import weightIcon from "../assets/icons/weight.svg";
import exerciseIcon from "../assets/icons/exercise.svg";
import mealIcon from "../assets/icons/meal.svg";
import pillIcon from "../assets/icons/pill.svg";

const menuItems = [
  { key: "all", label: "전체보기", icon: allIcon },
  { key: "bloodPressure", label: "혈압", icon: bloodPressureIcon },
  { key: "bloodSugar", label: "혈당", icon: bloodIcon },
  { key: "weight", label: "체중", icon: weightIcon },
  { key: "exercise", label: "운동", icon: exerciseIcon },
  { key: "meal", label: "식단", icon: mealIcon },
  { key: "pill", label: "복용", icon: pillIcon },
];

export default function HealthIndicatorMenu({ onRegisterClick }) {
  const [activeMenu, setActiveMenu] = useState("exercise");

  return (
    <aside className="min-h-full w-[365px] shrink-0 bg-white px-[28px] pt-[50px] pb-[40px] font-['Noto_Sans_KR']">
      {/* 상단 제목 */}
      <div className="flex items-center gap-[20px]">
        <img
          src={characteristicIcon}
          alt=""
          className="h-[28px] w-[28px] object-contain"
        />

        <h1 className="text-[26px] font-bold leading-none tracking-[-0.8px] text-[#111111]">
          건강 지표
        </h1>
      </div>

      {/* 메뉴 라벨 */}
      <p className="mt-[22px] ml-[23px] text-[12px] font-normal leading-none text-[#777777]">
        메뉴
      </p>

      {/* 메뉴 리스트 */}
      <nav className="mt-[22px] flex flex-col gap-[9px]">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key)}
              className={[
                "relative flex h-[55px] w-full items-center gap-[14px] rounded-[5px] text-left transition-none",
                isActive
                  ? "bg-[#E8E8E8] pl-[20px]"
                  : "bg-transparent pl-[23px]",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute left-0 top-[8px] h-[39px] w-[3px] rounded-r-full bg-[#111111]" />
              )}

              <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[9px] bg-[#050505]">
                <img
                  src={item.icon}
                  alt=""
                  className="h-[22px] w-[22px] object-contain"
                />
              </span>

              <span className="text-[14px] font-medium leading-none tracking-[-0.2px] text-[#111111]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 기록하기 버튼 */}
      <button
        type="button"
        onClick={onRegisterClick}
        className="mt-[31px] h-[55px] w-full rounded-[6px] bg-[#050505] text-[15px] font-bold tracking-[-0.2px] text-white"
      >
        기록하기
      </button>

      {/* 파란 조언 카드 */}
      <section className="mt-[86px] rounded-[10px] bg-[#0057E5] px-[24px] pt-[24px] pb-[24px] text-white shadow-[0_18px_32px_rgba(0,0,0,0.14)]">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-white/20">
          <img
            src={aiIcon}
            alt=""
            className="h-[24px] w-[24px] object-contain"
          />
        </div>

        <h2 className="mt-[20px] text-[19px] font-bold leading-none tracking-[-0.5px] text-white">
          매우 훌륭한 추세입니다!
        </h2>

        <p className="mt-[20px] text-[13px] font-normal leading-[1.65] tracking-[-0.25px] text-white/95">
          이번 주 체중이 꾸준히 안정세를 보이고 있습니다. 현재의 식단과 수면
          패턴이 신진대사에 긍정적인 영향을 주고 있는 것으로 분석됩니다.
        </p>

        <div className="mt-[20px] border-t border-white/15 pt-[12px]">
          <p className="text-[11px] font-medium leading-none tracking-[-0.2px] text-white/70">
            전문가 추천 팁:
          </p>

          <p className="mt-[9px] text-[11px] font-normal leading-[1.55] tracking-[-0.2px] text-white/95">
            목표 체중까지 약 4.4kg 남았습니다. 근력 운동 횟수를 주 1회 더 늘리면
            기초대사량이 높아져 정체기를 예방할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          className="mt-[18px] h-[44px] w-full rounded-[6px] bg-white text-[14px] font-bold tracking-[-0.2px] text-[#0057E5]"
        >
          맞춤형 식단 계획 보기
        </button>
      </section>

      {/* 회색 수분 카드 */}
      <section className="mt-[16px] flex gap-[13px] rounded-[10px] bg-[#F1F4F8] px-[14px] py-[16px]">
        <div className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-[8px] bg-[#DDE4F3]">
          <span className="text-[19px] leading-none">💧</span>
        </div>

        <div className="pt-[1px]">
          <h3 className="text-[12px] font-bold leading-none tracking-[-0.2px] text-[#111111]">
            수분 섭취 권장
          </h3>

          <p className="mt-[8px] text-[11px] font-normal leading-[1.45] tracking-[-0.2px] text-[#555555]">
            체중 감량 중에는 하루 2L 이상의 물을 마시는 것이 지방 연소에
            효과적입니다.
          </p>
        </div>
      </section>
    </aside>
  );
}
