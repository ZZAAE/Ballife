import { useState } from "react";
import { Link } from "react-router-dom";
import ballifeLogo from "../assets/icons/ballifeLogo.svg";
import { useAuth } from '../contexts/AuthContext';

// DB Inc 디자인 토큰
const TOKENS = {
  black: "#121212",
  white: "#ffffff",
  grey1: "#707070",
  grey2: "#8e9097",
  grey3: "#e6e6e6",
  border: "#dddddd",
  brand: "#00844a",
  brandSub: "#7fc31c",
};

const navItems = [
  { key: "record", label: "기록", path: "/allRecord" },
  {
    key: "check",
    label: "확인",
    path: "/check/all",
    navigable: false,
    dropdown: [
      { label: "전체", path: "/check/all" },
      { label: "식단", path: "/check/meal" },
      { label: "약", path: "/check/medicine" },
      { label: "운동", path: "/check/exercise" },
      { label: "체중", path: "/check/weight" },
      { label: "혈당", path: "/check/blood-sugar" },
      { label: "혈압", path: "/check/blood-pressure" },
    ],
  },
  { key: "community", label: "커뮤니티", path: "/boards" },
  {
    key: "member",
    label: "회원정보",
    path: "/member",
    dropdown: [{ label: "펫", path: "/member/pet" }],
  },
  {
    key: "intro",
    label: "소개",
    path: "/intro/web",
    navigable: false,
    dropdown: [
      { label: "웹 소개", path: "/intro/web" },
      { label: "고지혈증", path: "/intro/hyperlipidemia" },
      { label: "고혈압", path: "/intro/hypertension" },
      { label: "골다공증", path: "/intro/osteoporosis" },
      { label: "당뇨", path: "/intro/diabetes" },
      { label: "비만", path: "/intro/obesity" },
      { label: "통풍", path: "/intro/gout" },
    ],
  },
];

export default function Header({ isLoggedIn = false }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <header
      id="header"
      className="fixed left-0 top-0 z-50 w-full font-['Pretendard','Noto_Sans_KR',sans-serif] tracking-[-0.3px]"
      onMouseLeave={() => setHoveredKey(null)}
      style={{ "--brand": TOKENS.brand, "--brand-sub": TOKENS.brandSub }}
    >
      {/* 상단 바 */}
      <div
        className="h_inner flex h-[60px] items-center px-[100px] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
        style={{ backgroundColor: TOKENS.black }}
      >
        {/* h_logo */}
        <h1 className="h_logo shrink-0">
          <Link to="/" className="block">
            <img
              src={ballifeLogo}
              alt="Ballife"
              className="h-[37px] w-auto object-contain mb-1"
            />
          </Link>
        </h1>

        {/* gnb */}
        <nav className="gnb flex-1">
          <ul className="nav flex items-center justify-center gap-[120px]">
            {navItems.map((item) => {
              const isActive = hoveredKey === item.key;
              const canNavigate = item.navigable !== false;

              const titleClass = `dep1_tit relative flex h-[55px] items-center px-[20px] text-[17px] font-semibold text-white no-underline transition-colors duration-200
                after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-0 after:-translate-x-1/2 after:rounded-t-[2px] after:bg-[#3ECEA1] after:transition-all after:duration-300
                ${isActive ? "after:w-[calc(100%-32px)]" : ""}
                ${canNavigate ? "" : "cursor-default"}
              `;

              return (
                <li
                  key={item.key}
                  className="dep1 relative"
                  onMouseEnter={() => setHoveredKey(item.key)}
                >
                  {canNavigate ? (
                    <Link to={item.path} className={titleClass}>
                      <span style={{ color: TOKENS.white }}>{item.label}</span>
                    </Link>
                  ) : (
                    <span className={titleClass}>
                      <span style={{ color: TOKENS.white }}>{item.label}</span>
                    </span>
                  )}

                  {/* dep2 */}
                  {item.dropdown && isActive && (
                    <ul className="dep2 absolute left-1/2 top-full min-w-[180px] -translate-x-1/2 overflow-hidden rounded-b-[6px] bg-white py-2 shadow-[0_12px_28px_rgba(18,18,18,0.12)]">
                      {item.dropdown.map((sub) => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className="dep2_tit group/sub relative block whitespace-nowrap px-6 py-[10px] text-center text-[14.5px] font-medium no-underline transition-all duration-150"
                            style={{ color: TOKENS.grey1 }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = TOKENS.brand;
                              e.currentTarget.style.backgroundColor = "#f3f6f8";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = TOKENS.grey1;
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* h_etc */}
        <div className="h_etc flex w-[180px] shrink-0 justify-end">
          <Link
            to={isLoggedIn ? "/logout" : "/login"}
            className={
              isLoggedIn
                ? "group flex h-[34px] items-center gap-[6px] rounded-full border border-white/25 bg-transparent px-[16px] text-[13px] font-semibold text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-[#121212]"
                : "group flex h-[34px] items-center gap-[6px] rounded-full border border-white bg-white px-[16px] text-[13px] font-semibold text-[#121212] no-underline transition-all duration-200 hover:bg-[#f3f6f8]"
            }
          >
            <span>{isLoggedIn ? "로그아웃" : "로그인"}</span>
            {isLoggedIn && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[13px] w-[13px] transition-transform duration-200 group-hover:translate-x-[2px]"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
