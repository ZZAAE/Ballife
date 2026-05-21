import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../api/authApi";

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
    gender: "",
    weight: "",
    height: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.loginId) {
      newErrors.loginId = "아이디를 입력해주세요.";
    } else if (formData.loginId.length < 5) {
      newErrors.loginId = "아이디는 5자 이상이어야 합니다.";
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

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
    // if (!validate()) return; //유효성 실패시 중단

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
    //   navigate("/login"); // <Link to = "/login">로그인</Link>
    // } catch (error) {
    //   console.error("회원가입 실패:", error);
    // } finally {
    //   setLoading(false);
    // }
    navigate("/disease");
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

        <form onSubmit={handleSubmit} noValidate>

          {/* 아이디 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-800 mb-1">아이디</label>
            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              placeholder="아이디를 입력해주세요."
              autoComplete="username"
              className={inputClass("loginId")}
            />
            {errors.loginId && <p className="mt-1 text-xs text-red-500 pl-1">{errors.loginId}</p>}
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
            <label className="block text-sm font-medium text-gray-800 mb-1">본인 확인인 이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              autoComplete="email"
              className={inputClass("email")}
            />
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

          {/* 몸무게 / 키 — 나란히 */}
          <div className="flex gap-4 mb-6">
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