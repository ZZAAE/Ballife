import React from 'react';
import { CheckCircle2, Info } from "lucide-react";

// 섹션 헤더: 이미지의 작은 아이콘과 타이틀 스타일 반영
export const SectionHeader = ({ icon: Icon, title, subTitle }) => (
  <div className="mb-6 mt-14">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="text-gray-700" size={20} />}
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
    </div>
    {subTitle && <p className="text-[12px] text-gray-400 ml-7">{subTitle}</p>}
  </div>
);

// 기본 카드
export const ContentCard = ({ children, className = "" }) => (
  <div className={`bg-white p-7 rounded-xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

// 우측 주요 위험 요소 (다크 카드)
export const RiskFactorCard = ({ factors }) => (
  <div className="bg-[#1a1c1e] text-white p-8 rounded-2xl shadow-lg">
    <h3 className="text-[15px] font-bold mb-6 text-gray-100">주요 위험 요소</h3>
    <ul className="space-y-4">
      {factors.map((factor, idx) => (
        <li key={idx} className="flex items-start gap-3 text-[13px] text-gray-300">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          {factor}
        </li>
      ))}
    </ul>
  </div>
);

export const DiagnosisCard = ({ icon: Icon, title, subTitle, desc, color }) => (
  <ContentCard className={`border-l-4 ${color} !p-6`}>
    <Icon className="text-emerald-500 mb-3" size={20} />
    <h4 className="font-bold text-[14px] text-blue-700 mb-1">{title}</h4>
    <span className="text-[11px] font-bold text-gray-800 block mb-3">{subTitle}</span>
    <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
  </ContentCard>
);

/**
 * 음식 아이템 리스트
 */
export const FoodItem = ({ text, isBad }) => (
  <li className="flex items-center gap-2 text-[11px] text-gray-600 font-medium">
    {isBad ? (
      <span className="text-rose-500 font-bold shrink-0">ⓧ</span>
    ) : (
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
    )}
    {text}
  </li>
);

/**
 * 01, 02, 03 번호가 붙는 단계별 정보 카드
 */
export const StepInfoCard = ({ number, title, desc }) => (
  <ContentCard className="flex items-center gap-6 py-5 border-none shadow-sm">
    <div className="bg-gray-50 px-4 py-2 rounded-lg text-gray-400 font-black text-lg italic">
      {number}
    </div>
    <div>
      <h5 className="font-extrabold text-[14px] mb-1">{title}</h5>
      <p className="text-[12px] text-gray-500 leading-snug">{desc}</p>
    </div>
  </ContentCard>
);

/**
 * 하단 주의사항 안내 (Info)
 */
export const CautionBox = ({ children }) => (
  <div className="bg-white border border-gray-100 p-5 rounded-xl flex items-center gap-3 shadow-sm h-full">
    <Info className="text-rose-500 shrink-0" size={18} />
    <p className="text-[11px] text-gray-500">
      <span className="font-bold text-gray-800">주의 : </span>
      {children}
    </p>
  </div>
);