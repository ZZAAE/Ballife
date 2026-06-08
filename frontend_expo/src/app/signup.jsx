import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import toast from "../lib/toast";
import authApi from "../api/authApi";
import Dropdown from "../components/Dropdown";
import DateField from "../components/DateField";

// 이메일 도메인 셀렉트 옵션 (이메일 선택 / 도메인들 / 직접 입력)
const EMAIL_DOMAIN_OPTIONS = (domains) => [
  { label: "이메일 선택", value: "" },
  ...domains.map((d) => ({ label: d, value: d })),
  { label: "직접 입력", value: "__custom__" },
];

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

export default function SignUpScreen() {
  const router = useRouter();
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
    diseaseIndex: "",
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

  const handleEmailLocalChange = (value) => {
    setEmailLocalState(value);
    syncEmail(value, emailDomain);
  };

  const handleEmailDomainChange = (value) => {
    setEmailDomainState(value);
    syncEmail(emailLocal, value);
  };

  const handleChange = (name, value) => {
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
      setErrors((prev) => ({
        ...prev,
        loginId: "아이디는 5자 이상이어야 합니다.",
      }));
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

  const handleDomainSelect = (value) => {
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
    } else if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(`${emailLocal}@${emailDomain}`)
    ) {
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

  const handleSubmit = () => {
    /* 시현용으로 막아둠 (개발시 풀어둘것) */
    if (!validate()) return; //유효성 실패시 중단

    router.push({
      pathname: "/disease",
      params: { signup: JSON.stringify(formData) },
    });
  };

  // 공통 인풋 스타일
  const inputBase =
    "w-full h-12 px-4 bg-gray-100 rounded text-sm text-gray-800 border border-transparent";
  const inputClass = (field) =>
    `${inputBase} ${errors[field] ? "border-red-400 bg-red-50" : ""}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 pt-16 pb-16 items-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-lg">
            {/* 타이틀 */}
            <Text className="mb-8 text-center text-2xl font-medium tracking-tight text-gray-900">
              회원가입
            </Text>

            {/* 개발용 임시 자동입력 버튼 (배포 전 삭제) */}
            <Pressable
              onPress={handleAutoFill}
              className="mb-4 h-10 w-full items-center justify-center rounded border border-dashed border-orange-400"
            >
              <Text className="text-xs font-medium text-orange-600">
                [DEV] 테스트 데이터 자동 입력
              </Text>
            </Pressable>

            {/* 아이디 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                아이디
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={formData.loginId}
                  onChangeText={(v) => handleChange("loginId", v)}
                  placeholder="아이디를 입력해주세요."
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  className={`${inputClass("loginId")} flex-1`}
                />
                <Pressable
                  onPress={handleCheckLoginId}
                  disabled={checkingLoginId}
                  className={`h-12 items-center justify-center rounded bg-gray-800 px-4 ${
                    checkingLoginId ? "opacity-60" : ""
                  }`}
                >
                  <Text className="text-sm font-medium text-white">
                    {checkingLoginId ? "확인 중..." : "중복 확인"}
                  </Text>
                </Pressable>
              </View>
              {!!errors.loginId && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.loginId}
                </Text>
              )}
              {!errors.loginId && loginIdStatus === "available" && (
                <Text className="mt-1 pl-1 text-xs text-green-600">
                  사용 가능한 아이디입니다.
                </Text>
              )}
              {!errors.loginId && loginIdStatus === "taken" && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  이미 사용 중인 아이디입니다.
                </Text>
              )}
            </View>

            {/* 비밀번호 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                비밀번호
              </Text>
              <TextInput
                value={formData.password}
                onChangeText={(v) => handleChange("password", v)}
                placeholder="6자 이상의 영문, 숫자 조합으로 입력해주세요."
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                className={inputClass("password")}
              />
              {!!errors.password && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* 비밀번호 확인 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                비밀번호 확인
              </Text>
              <TextInput
                value={formData.passwordConfirm}
                onChangeText={(v) => handleChange("passwordConfirm", v)}
                placeholder="비밀번호를 한 번 더 입력해주세요."
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                className={inputClass("passwordConfirm")}
              />
              {!!errors.passwordConfirm && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.passwordConfirm}
                </Text>
              )}
            </View>

            {/* 이름 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                사용자 이름
              </Text>
              <TextInput
                value={formData.username}
                onChangeText={(v) => handleChange("username", v)}
                placeholder="이름을 입력해주세요."
                placeholderTextColor="#9CA3AF"
                className={inputClass("username")}
              />
            </View>

            {/* 이메일 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                본인 확인 이메일
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={emailLocal}
                  onChangeText={handleEmailLocalChange}
                  placeholder="example"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  className={`${inputClass("email")} flex-1`}
                />
                <Text className="text-sm text-gray-500">@</Text>
                <TextInput
                  value={emailDomain}
                  onChangeText={handleEmailDomainChange}
                  editable={isCustomDomain}
                  placeholder="email.com"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`${inputClass("email")} flex-1`}
                />
              </View>
              <View className="mt-2">
                <Dropdown
                  value={isCustomDomain ? "__custom__" : emailDomain}
                  onChange={handleDomainSelect}
                  options={EMAIL_DOMAIN_OPTIONS(EMAIL_DOMAINS)}
                  placeholder="이메일 선택"
                />
              </View>
              {!!errors.email && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* 생년월일 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                생년월일
              </Text>
              <DateField
                value={formData.birthDate}
                onChange={(v) => handleChange("birthDate", v)}
                maximumDate={new Date()}
                error={!!errors.birthDate}
              />
              {!!errors.birthDate && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.birthDate}
                </Text>
              )}
            </View>

            {/* 닉네임 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                닉네임 <Text className="font-normal text-gray-400">(선택)</Text>
              </Text>
              <TextInput
                value={formData.nickname}
                onChangeText={(v) => handleChange("nickname", v)}
                placeholder="표시될 이름을 입력해주세요."
                placeholderTextColor="#9CA3AF"
                className={inputClass("nickname")}
              />
            </View>

            {/* 성별 */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-gray-800">
                성별
              </Text>
              <View
                className={`flex-row rounded-lg bg-gray-100 p-1 ${
                  errors.gender ? "border border-red-400" : ""
                }`}
              >
                {["남성", "여성"].map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, gender: g }));
                      setErrors((prev) => ({ ...prev, gender: "" }));
                    }}
                    className={`h-10 flex-1 items-center justify-center rounded-md ${
                      formData.gender === g ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        formData.gender === g
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {!!errors.gender && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.gender}
                </Text>
              )}
            </View>

            {/* 키 / 몸무게 — 나란히 */}
            <View className="mb-6 flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-800">
                  키
                </Text>
                <TextInput
                  value={formData.height}
                  onChangeText={(v) => handleChange("height", v)}
                  placeholder="cm"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={inputClass("height")}
                />
                {!!errors.height && (
                  <Text className="mt-1 pl-1 text-xs text-red-500">
                    {errors.height}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-800">
                  몸무게
                </Text>
                <TextInput
                  value={formData.weight}
                  onChangeText={(v) => handleChange("weight", v)}
                  placeholder="kg"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={inputClass("weight")}
                />
                {!!errors.weight && (
                  <Text className="mt-1 pl-1 text-xs text-red-500">
                    {errors.weight}
                  </Text>
                )}
              </View>
            </View>

            {/* 회원가입 버튼 */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`h-12 w-full items-center justify-center rounded bg-gray-900 ${
                loading ? "opacity-60" : ""
              }`}
            >
              <Text className="text-sm font-medium text-white">
                {loading ? "가입 중..." : "회원가입"}
              </Text>
            </Pressable>

            {/* 로그인 링크 */}
            <View className="mt-5 flex-row items-center justify-center">
              <Text className="text-sm text-gray-500">
                이미 계정이 있으신가요?{" "}
              </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text className="text-sm text-blue-600">로그인</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
