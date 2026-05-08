import { useState } from "react";
import { Link } from "react-router-dom";
import ballifeLogo from "../assets/icons/ballifeLogo.svg";

const navItems = [
  { key: "record", label: "기록", path: "/record" },
  {
    key: "check",
    label: "확인",
    path: "/check",
    dropdown: [
      { label: "전체", path: "/all" },
      { label: "식단", path: "/meal" },
      { label: "약", path: "/medicine" },
      { label: "운동", path: "/exercise" },
      { label: "체중", path: "/weight" },
      { label: "혈당", path: "/sugar" },
      { label: "혈압", path: "/pressure" },
    ],
  },
  { key: "community", label: "커뮤니티", path: "/community" },
  { key: "member", label: "회원정보", path: "/member" },
  {
    key: "intro",
    label: "소개",
    path: "/intro",
    dropdown: [
      { label: "웹 소개", path: "/mainreport" },
      { label: "고지혈증", path: "/dyslipidemia" },
      { label: "고혈압", path: "/hypertension" },
      { label: "골다공증", path: "/osteoporosis" },
      { label: "당뇨", path: "/diabetes" },
      { label: "비만", path: "/obesity" },
      { label: "통풍", path: "/gout" },
    ],
  },
];

export default function Header({ isLoggedIn = false }) {
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const activeDropdown = navItems.find((item) => item.key === hoveredMenu);

  return (
    <header
      className="fixed left-0 top-0 z-50 w-full font-['Noto_Sans_KR']"
      onMouseLeave={() => setHoveredMenu(null)}
    >
      {/* 상단바 */}
      <div className="flex h-[55px] w-full items-center bg-[#202020] px-[38px]">
        {/* 로고 */}
        <div className="flex w-[260px] items-center">
          <Link to="/" className="block">
            <img
              src={ballifeLogo}
              alt="Ballife"
              className="h-[45px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* 메뉴 */}
        <nav className="flex flex-1 items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              onMouseEnter={() => setHoveredMenu(item.dropdown ? item.key : null)}
              className="flex h-[70px] items-center px-[20px] text-[18px] font-semibold tracking-[-0.3px] text-white no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 로그인 / 로그아웃 */}
        <div className="flex w-[180px] justify-end">
          <Link
            to={isLoggedIn ? "/logout" : "/login"}
            className="flex h-[34px] items-center rounded-[8px] bg-white px-[17px] text-[14px] font-semibold tracking-[-0.2px] text-[#222222] no-underline hover:bg-[#F2F2F2]"
          >
            {isLoggedIn ? "로그아웃" : "로그인"}
          </Link>
        </div>
      </div>

      {/* 드롭다운 */}
      {activeDropdown?.dropdown && (
        <div
          className="flex h-[65px] w-full border-t border-white bg-white shadow-[0_1px_0_rgba(0,0,0,0.2)]"
          onMouseEnter={() => setHoveredMenu(activeDropdown.key)}
        >
          {/* 왼쪽 현재 메뉴 표시 */}
          <div className="flex h-full w-[270px] items-center justify-center bg-[#202020]">
            <span className="text-[18px] font-bold text-white">
              {activeDropdown.label}
            </span>
          </div>

          {/* 드롭다운 메뉴 */}
          <div className="flex h-full flex-1 items-center justify-start gap-[120px] pl-[45px] pr-[20px]">
            {activeDropdown.dropdown.map((item) => (
              <Link
                    key={item.label}
                    to={item.path}
                    className="flex h-[20px] items-center border-l-[2px] border-black pl-[18px] text-[18px] font-medium tracking-[-0.3px] text-black no-underline"
                    >
                    <span>{item.label}</span>
                </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}