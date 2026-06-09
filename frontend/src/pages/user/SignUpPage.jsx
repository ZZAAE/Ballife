import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../api/authApi";
import petApi from "../../api/petApi";

const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
  "nate.com",
  "hotmail.com",
  "outlook.com",
];

function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    username: "",
    email: "",
    birthDate: "",
    nickname: "",
    gender: "남성",
    weight: "",
    height: "",
    diseaseIndex: ""
  });
  const [errors, setErrors] = useState({});

  const [loginIdStatus, setLoginIdStatus] = useState("idle"); // idle | checking | available | taken
  const [checkingLoginId, setCheckingLoginId] = useState(false);

  const [emailLocal, setEmailLocalState] = useState("");
  const [emailDomain, setEmailDomainState] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  const syncEmail = (local, domain) => {
    const composed = local && domain ? `${local}@${domain}` : "";
    setFormData((prev) => ({ ...prev, email: composed }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleEmailLocalChange = (e) => {
    const value = e.target.value;
    setEmailLocalState(value);
    syncEmail(value, emailDomain);
  };

  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    setEmailDomainState(value);
    syncEmail(emailLocal, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "loginId") {
      setLoginIdStatus("idle");
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckLoginId = async () => {
    if (!formData.loginId) {
      setErrors((prev) => ({ ...prev, loginId: "아이디를 입력해주세요." }));
      return;
    }
    if (formData.loginId.length < 5) {
      setErrors((prev) => ({ ...prev, loginId: "아이디는 5자 이상이어야 합니다." }));
      return;
    }
    setCheckingLoginId(true);
    setLoginIdStatus("checking");
    try {
      const res = await authApi.checkUsername(formData.loginId);
      const data = res?.data;
      let available;
      if (typeof data === "boolean") {
        available = data;
      } else if (typeof data?.available === "boolean") {
        available = data.available;
      } else if (typeof data?.exists === "boolean") {
        available = !data.exists;
      } else if (typeof data?.duplicated === "boolean") {
        available = !data.duplicated;
      } else {
        available = false;
      }
      setLoginIdStatus(available ? "available" : "taken");
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      toast.error("중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setLoginIdStatus("idle");
    } finally {
      setCheckingLoginId(false);
    }
  };

  const handleDomainSelect = (e) => {
    const value = e.target.value;
    if (value === "__custom__") {
      setIsCustomDomain(true);
      setEmailDomainState("");
      syncEmail(emailLocal, "");
    } else {
      setIsCustomDomain(false);
      setEmailDomainState(value);
      syncEmail(emailLocal, value);
    }
  };

  // 개발용 자동 입력 (배포 전 삭제)
  const handleAutoFill = () => {
    const rand = Math.floor(Math.random() * 10000);
    const testLoginId = `tester${rand}`;
    const testLocal = `tester${rand}`;
    const testDomain = "gmail.com";
    setFormData({
      loginId: testLoginId,
      password: "test1234",
      passwordConfirm: "test1234",
      username: "홍길동",
      email: `${testLocal}@${testDomain}`,
      birthDate: "2000-01-15",
      nickname: "길동이",
      gender: "남성",
      weight: "65",
      height: "175",
      diseaseIndex: "",
    });
    setEmailLocalState(testLocal);
    setEmailDomainState(testDomain);
    setIsCustomDomain(false);
    setErrors({});
    setLoginIdStatus("available"); // 중복확인 통과 처리
    toast.success("테스트 데이터 자동 입력 완료");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.loginId) {
      newErrors.loginId = "아이디를 입력해주세요.";
    } else if (formData.loginId.length < 5) {
      newErrors.loginId = "아이디는 5자 이상이어야 합니다.";
    } else if (loginIdStatus !== "available") {
      newErrors.loginId = "아이디 중복 확인을 완료해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!emailLocal || !emailDomain) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(`${emailLocal}@${emailDomain}`)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "생년월일을 입력해주세요.";
    }

    if (!formData.gender || formData.gender === "") {
      newErrors.gender = "성별을 선택해주세요.";
    }

    if (!formData.weight) {
      newErrors.weight = "몸무게를 입력해주세요.";
    } else if (formData.weight <= 0) {
      newErrors.weight = "0 이상의 숫자를 입력해주세요.";
    }

    if (!formData.height) {
      newErrors.height = "키를 입력해주세요.";
    } else if (formData.height <= 0) {
      newErrors.height = "0 이상의 숫자를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* 시현용으로 막아둠 (개발시 풀어둘것) */
    if (!validate()) return; //유효성 실패시 중단

    

    // try {
    //   setLoading(true);
    //   await authApi.signUp({
    //     loginId: formData.loginId,
    //     password: formData.password,
    //     username: formData.username,
    //     email: formData.email,
    //     birthDate: formData.birthDate,
    //     nickname: formData.nickname, // 이거문젠가
    //     gender: formData.gender,
    //     weight: formData.weight,
    //     height: formData.height,
    //   });

    //   toast.success("회원가입이 완료되었습니다!");
    //   navigate("/disease"); // <Link to = "/login">로그인</Link>
    // } catch (error) {
    //   console.error("회원가입 실패:", error);
    // } finally {
    //   setLoading(false);
    // }

    navigate("/disease", { state: formData});
  };

  // 공통 인풋 스타일
  const inputClass = (field) => `
    w-full h-12 px-4
    bg-gray-100 rounded
    text-sm text-gray-800 placeholder-gray-400
    border border-transparent
    outline-none
    transition-colors duration-150
    focus:bg-white focus:border-gray-300
    ${errors[field] ? "border-red-400 bg-red-50" : ""}
  `;

  return (
    <div
      className="bg-white flex items-start justify-center px-4 pt-16 pb-16"
      style={{ minHeight: "95vh" }}
    >
      <div className="w-full max-w-lg">

        {/* 타이틀 */}
        <h1 className="text-2xl font-medium text-center text-gray-900 mb-8 tracking-tight">
          회원가입
        </h1>

        {/* 개발용 임시 자동입력 버튼 (배포 전 삭제) */}
        <button
          type="button"
          onClick={handleAutoFill}
          className="w-full h-10 mb-4 rounded border border-dashed border-orange-400 text-orange-600 text-xs font-medium hover:bg-orange-50 transition"
        >
          [DEV] 테스트 데이터 자동 입력
        </button>

        <form onSubmit={handleSubmit} noValidate>

          {/* 아이디 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">아이디</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="아이디를 입력해주세요."
                autoComplete="username"
                className={`${inputClass("loginId")} flex-1`}
              />
              <button
                type="button"
                onClick={handleCheckLoginId}
                disabled={checkingLoginId}
                className="h-12 px-4 rounded bg-gray-800 text-white text-sm font-medium hover:bg-black transition disabled:opacity-60 whitespace-nowrap"
              >
                {checkingLoginId ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            {errors.loginId && <p className="mt-1 text-xs text-red-500 pl-1">{errors.loginId}</p>}
            {!errors.loginId && loginIdStatus === "available" && (
              <p className="mt-1 text-xs text-green-600 pl-1">사용 가능한 아이디입니다.</p>
            )}
            {!errors.loginId && loginIdStatus === "taken" && (
              <p className="mt-1 text-xs text-red-500 pl-1">이미 사용 중인 아이디입니다.</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6자 이상의 영문, 숫자 조합으로 입력해주세요."
              autoComplete="new-password"
              className={inputClass("password")}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 한 번 더 입력해주세요."
              autoComplete="new-password"
              className={inputClass("passwordConfirm")}
            />
            {errors.passwordConfirm && <p className="mt-1 text-xs text-red-500 pl-1">{errors.passwordConfirm}</p>}
          </div>

          {/* 이름 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">사용자 이름</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="이름을 입력해주세요."
              className={inputClass("username")}
            />
          </div>

          {/* 이메일 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">본인 확인 이메일</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emailLocal}
                onChange={handleEmailLocalChange}
                placeholder="example"
                autoComplete="email"
                className={`${inputClass("email")} flex-1 min-w-0`}
              />
              <span className="text-sm text-gray-500">@</span>
              <input
                type="text"
                value={emailDomain}
                onChange={handleEmailDomainChange}
                readOnly={!isCustomDomain}
                placeholder="email.com"
                className={`${inputClass("email")} flex-1 min-w-0 ${!isCustomDomain ? "cursor-default" : ""}`}
              />
            </div>
            <select
              value={isCustomDomain ? "__custom__" : emailDomain}
              onChange={handleDomainSelect}
              className="mt-2 w-full h-12 px-3 bg-gray-100 rounded text-sm text-gray-800 outline-none border border-transparent focus:bg-white focus:border-gray-300"
            >
              <option value="">이메일 선택</option>
              {EMAIL_DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="__custom__">직접 입력</option>
            </select>
            {errors.email && <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>}
          </div>

          {/* 생년월일 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">생년월일</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={inputClass("birthDate")}
            />
            {errors.birthDate && <p className="mt-1 text-xs text-red-500 pl-1">{errors.birthDate}</p>}
          </div>

          {/* 닉네임 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">닉네임 <span className="text-gray-400 font-normal">(선택)</span></label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="표시될 이름을 입력해주세요."
              className={inputClass("nickname")}
            />
          </div>

          {/* 성별 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">성별</label>
            <div className={`flex p-1 bg-gray-100 rounded-lg ${errors.gender ? "ring-1 ring-red-400" : ""}`}>
              {["남성", "여성"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, gender: g }));
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  className={`
                    flex-1 h-10 text-sm font-medium rounded-md transition-all duration-150
                    ${formData.gender === g
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }
                  `}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-xs text-red-500 pl-1">{errors.gender}</p>}
          </div>

          {/* 키 / 몸무게 — 나란히 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">키</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="cm"
                step="0.1"
                min="0"
                className={inputClass("height")}
              />
              {errors.height && <p className="mt-1 text-xs text-red-500 pl-1">{errors.height}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">몸무게</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="kg"
                step="0.1"
                min="0"
                className={inputClass("weight")}
              />
              {errors.weight && <p className="mt-1 text-xs text-red-500 pl-1">{errors.weight}</p>}
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-12
              bg-gray-900 hover:bg-black
              text-white text-sm font-medium
              rounded
              transition-colors duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center mt-5 text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;