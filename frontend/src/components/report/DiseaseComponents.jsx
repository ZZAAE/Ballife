import React from 'react';
import { CheckCircle2, Info, BookOpen } from "lucide-react";

// 섹션 헤더: 이미지의 작은 아이콘과 타이틀 스타일 반영
export const SectionHeader = ({ icon: Icon, title, subTitle }) => (
  <div className="mb-6 mt-14">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="text-[#0F172A]" size={20} />}
      <h2 className="text-[22px] font-bold text-[#0F172A]">{title}</h2>
    </div>
    {subTitle && <p className="text-[13px] text-[#64748B] ml-7">{subTitle}</p>}
  </div>
);

// 기본 카드
export const ContentCard = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-[18px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] ${className}`}>
    {children}
  </div>
);

// 우측 주요 위험 요소 (다크 카드)
export const RiskFactorCard = ({ factors }) => (
  <div className="bg-[#0F172A] text-white rounded-[18px] p-7">
    <h3 className="text-[14px] font-bold text-white mb-5">주요 위험 요소</h3>
    <ul className="space-y-4">
      {factors.map((factor, idx) => (
        <li key={idx} className="flex items-start gap-3 text-[13px] text-white/80">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          {factor}
        </li>
      ))}
    </ul>
  </div>
);

export const DiagnosisCard = ({ icon: Icon, title, subTitle, desc, color }) => (
  <ContentCard className={`border-l-4 ${color}`}>
    <Icon className="text-emerald-500 mb-3" size={20} />
    <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">{title}</h4>
    <span className="text-[12px] font-semibold text-emerald-600 block mb-3">{subTitle}</span>
    <p className="text-[12px] text-[#64748B] leading-relaxed">{desc}</p>
  </ContentCard>
);

/**
 * 음식 아이템 리스트
 */
export const FoodItem = ({ text, isBad }) => (
  <li className="flex items-center gap-2 text-[13px] text-[#475569]">
    {isBad ? (
      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
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
  <div className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 flex items-start gap-5">
    <div className="text-[36px] font-extrabold text-[#0F172A]/15 leading-none w-16 shrink-0">
      {number}
    </div>
    <div>
      <h5 className="text-[15px] font-bold text-[#0F172A] mb-1.5">{title}</h5>
      <p className="text-[13px] text-[#64748B] leading-relaxed">{desc}</p>
    </div>
  </div>
);

/**
 * 하단 주의사항 안내 (Info)
 */
export const CautionBox = ({ children }) => (
  <div className="bg-rose-50 border border-rose-100 rounded-[18px] p-5 flex items-start gap-3">
    <Info className="text-rose-500 shrink-0 mt-0.5" size={18} />
    <p className="text-[13px] text-[#475569]">
      <span className="font-semibold text-rose-600">주의 : </span>
      {children}
    </p>
  </div>
);

/**
 * 참고 자료 푸터
 */
export const ReferenceFooter = ({ items, lastUpdated }) => (
  <footer className="mt-16 bg-white rounded-[18px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-7">
    <div className="flex items-center gap-2 mb-4">
      <BookOpen size={18} className="text-[#0F172A]" />
      <h3 className="text-[15px] font-bold text-[#0F172A]">참고 자료 (References)</h3>
    </div>
    <p className="text-[12px] text-[#94A3B8] mb-4 leading-relaxed">
      본 페이지의 의학 정보는 아래 공신력 있는 출처를 바탕으로 작성되었으며, 진단·치료를 대신하지 않습니다. 개인별 상태는 반드시 의료진과 상담하시기 바랍니다.
    </p>
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#475569] leading-relaxed">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#94A3B8] shrink-0" />
          <span><span className="font-semibold text-[#0F172A]">{item.source}</span>{item.detail ? ` — ${item.detail}` : ""}</span>
        </li>
      ))}
    </ul>
    {lastUpdated && <p className="mt-4 text-[11px] text-[#94A3B8]">마지막 업데이트: {lastUpdated}</p>}
  </footer>
);
