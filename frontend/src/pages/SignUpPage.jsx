import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 페이지 이동
import toast from "react-hot-toast"; //토스트 알림
import authApi from "../api/authApi"; //회원가입 API
import Input from "../components/Input";
import Button from "../components/Button";

function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  //폼 입력값 전체
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
  const [errors, setErrors] = useState({}); //유효성 검사 에러 메세지

  const handleChange = (e) => {
    // username, soldesk
    const { name, value } = e.target;
    //formData 업데이트 불변성 유지
    setFormData((prev) => ({
      ...prev, //기본값 유지
      [name]: value, //해당 필드만 업데이트
    }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "", //해당 에러만 지움
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.loginId) {
      newErrors.loginId = "아이디를 입력해주세요.";
    } else if (formData.loginId.length < 5) {
      newErrors.username = "아이디를 5자 이상이어야 합니다.";
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

    if(!formData.birthDate){
        newErrors.birthDate = "생년월일을 입력해주세요."
    }

    if(!formData.gender || formData.gender == ""){
        newErrors.gender = "성별을 선택해주세요."
    }

    if(!formData.weight){
        newErrors.weight = "몸무게를 입력해주세요."
    } else if (formData.weight < 0){
        newErrors.weight = "0 이상의 숫자를 입력해주세요";
    }

    if(!formData.height){
        newErrors.height = "키를 입력해주세요."
    } else if (formData.height < 0){
        newErrors.height = "0 이상의 숫자를 입력해주세요";
    }

    setErrors(newErrors); //유효성 검사 후 결과를 state에 업데이트
    return Object.keys(newErrors).length === 0; //유효성 검사에 통과되어 true 반환
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; //유효성 실패시 중단

    try {
      setLoading(true);
      await authApi.signUp({
        loginId: formData.loginId,
        password: formData.password,
        username: formData.username,
        email: formData.email,
        birthDate: formData.birthDate,
        nickname: formData.nickname,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
      });

      toast.success("회원가입이 완료되었습니다!");
      navigate("/login"); // <Link to = "/login">로그인</Link>
    } catch (error) {
      console.error("회원가입 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="아이디"
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            placeholder="사용자명 (5자 이상)"
            error={errors.loginId}
          />

          <Input
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호 (6자 이상)"
            error={errors.password}
          />

          <Input
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            error={errors.passwordConfirm}
          />

          <Input
            label="이름"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="이름"
          />

          <Input
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            error={errors.email}
          />

          <Input
            label="생년월일"
            name="birthDate"
            type="date"
            onChange={handleChange}
            error={errors.birthDate}
          />

          <Input
            label="닉네임 (선택)"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
            <select
              className="relative"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
            >
              <option value="">-- 선택 --</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="비공개">비공개</option>
            </select>
          </div>

          <Input
            label="몸무게"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            placeholder="몸무게(kg)"
            error={errors.weight}
            step="0.1"
          />

          <Input
            label="키"
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            placeholder="키(cm)"
            error={errors.height}
            step="0.1"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
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
