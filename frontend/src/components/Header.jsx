import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ballifeLogo from "../assets/icons/ballifeLogo.svg";
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LANGUAGES } from "../i18n";

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

// 라벨은 렌더 시 t() 로 해석 (labelKey → i18n nav.* 키)
const navItems = [
  { key: "record", labelKey: "nav.record", path: "/allRecord" },
  {
    key: "check",
    labelKey: "nav.check",
    path: "/check/all",
    navigable: false,
    dropdown: [
      { labelKey: "nav.checkAll", path: "/check/all" },
      { labelKey: "nav.meal", path: "/check/meal" },
      { labelKey: "nav.medicine", path: "/check/medicine" },
      { labelKey: "nav.exercise", path: "/check/exercise" },
      { labelKey: "nav.weight", path: "/check/weight" },
      { labelKey: "nav.bloodSugar", path: "/check/blood-sugar" },
      { labelKey: "nav.bloodPressure", path: "/check/blood-pressure" },
    ],
  },
  { key: "community", labelKey: "nav.community", path: "/boards" },
  {
    key: "member",
    labelKey: "nav.member",
    path: "/member",
    dropdown: [{ labelKey: "nav.pet", path: "/member/pet" }],
  },
  {
    key: "intro",
    labelKey: "nav.intro",
    path: "/intro/web",
    navigable: false,
    dropdown: [
      { labelKey: "nav.introWeb", path: "/intro/web" },
      { labelKey: "nav.hyperlipidemia", path: "/intro/hyperlipidemia" },
      { labelKey: "nav.hypertension", path: "/intro/hypertension" },
      { labelKey: "nav.osteoporosis", path: "/intro/osteoporosis" },
      { labelKey: "nav.diabetes", path: "/intro/diabetes" },
      { labelKey: "nav.obesity", path: "/intro/obesity" },
      { labelKey: "nav.gout", path: "/intro/gout" },
    ],
  },
];

export default function Header() {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    toast.success(t("common.logoutSuccess"));
    navigate("/", { replace: true });
  };

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ||
    SUPPORTED_LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ||
    SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <header
      id="header"
      className="fixed left-0 top-0 z-50 w-full font-['Pretendard','Noto_Sans_KR',sans-serif] tracking-[-0.3px]"
      onMouseLeave={() => setHoveredKey(null)}
      style={{ "--brand": TOKENS.brand, "--brand-sub": TOKENS.brandSub }}
    >
      {/* 상단 바 */}
      <div
        className="h_inner flex h-[60px] items-center px-4 md:px-8 xl:px-[100px] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
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
          <ul className="nav flex items-center justify-center gap-6 lg:gap-12 xl:gap-[120px]">
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
                      <span style={{ color: TOKENS.white }}>{t(item.labelKey)}</span>
                    </Link>
                  ) : (
                    <span className={titleClass}>
                      <span style={{ color: TOKENS.white }}>{t(item.labelKey)}</span>
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
                            {t(sub.labelKey)}
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
        <div className="h_etc flex w-auto xl:w-[180px] shrink-0 items-center justify-end gap-2">
          {/* 언어 스위처 */}
          <div
            className="relative"
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-label={t("language.select")}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-white/25 bg-transparent px-[12px] text-[13px] font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white hover:text-[#121212]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[15px] w-[15px]"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{currentLang.short}</span>
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1 min-w-[130px] overflow-hidden rounded-[8px] bg-white py-1 shadow-[0_12px_28px_rgba(18,18,18,0.18)]"
              >
                {SUPPORTED_LANGUAGES.map((lng) => (
                  <li key={lng.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={lng.code === currentLang.code}
                      onClick={() => handleLanguageChange(lng.code)}
                      className={`block w-full px-4 py-[8px] text-left text-[13.5px] font-medium transition-colors hover:bg-[#f3f6f8] ${
                        lng.code === currentLang.code
                          ? "text-[#00844a]"
                          : "text-[#707070]"
                      }`}
                    >
                      {lng.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="group flex h-[34px] items-center gap-[6px] rounded-full border border-white/25 bg-transparent px-[16px] text-[13px] font-semibold text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-[#121212]"
            >
              <span>{t("common.logout")}</span>
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
            </button>
          ) : (
            <Link
              to="/login"
              className="group flex h-[34px] items-center gap-[6px] rounded-full border border-white bg-white px-[16px] text-[13px] font-semibold text-[#121212] no-underline transition-all duration-200 hover:bg-[#f3f6f8]"
            >
              <span>{t("common.login")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
