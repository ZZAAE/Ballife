import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import toast from "../lib/toast";
import authApi from "../api/authApi";
import Dropdown from "../components/Dropdown";

const diseaseFields = [
  {
    name: "hyperlipidemia",
    label: "고지혈증 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고콜레스테롤혈증" },
      { value: "type2", label: "고LDL콜레스테롤혈증" },
      { value: "type3", label: "고중성지방혈증" },
      { value: "type4", label: "저HDL콜레스테롤혈증" },
    ],
  },
  {
    name: "hypertension",
    label: "고혈압 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고혈압 전단계" },
      { value: "type2", label: "1기" },
      { value: "type3", label: "2기" },
    ],
  },
  {
    name: "osteoporosis",
    label: "골다공증 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "osteopenia", label: "골감소증" },
      { value: "osteoporosis", label: "골다공증" },
    ],
  },
  {
    name: "diabetes",
    label: "당뇨 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "1형" },
      { value: "type2", label: "2형" },
      { value: "GESTATIONAL", label: "임신성" },
    ],
  },
  {
    name: "gout",
    label: "통풍 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "ASYMPTOMATIC", label: "고요산혈증" },
      { value: "ACUTE", label: "급성" },
      { value: "INTERMITTENT", label: "간헐기" },
      { value: "CHRONIC", label: "만성" },
    ],
  },
];

export default function DiseaseScreen() {
  const router = useRouter();
  const { signup } = useLocalSearchParams();
  // 직접 진입 등으로 signup 파라미터가 없을 때 크래시 방지
  let singUpFormData = {};
  try {
    if (signup) singUpFormData = JSON.parse(signup);
  } catch {
    singUpFormData = {};
  }
  const [loading, setLoading] = useState(false);

  // 초기값 세팅 - 질환 필드명 기준으로 'NONE'으로 초기화
  const [formData, setFormData] = useState(() =>
    diseaseFields.reduce((acc, field) => {
      acc[field.name] = "NONE";
      return acc;
    }, {}),
  );

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      //질병 정보 Key: Value 형태로 변환
      const diseaseIndex = Object.entries(formData)
        .filter(([, value]) => value !== "NONE")
        .map(([key, value]) => `${key}:${value}`)
        .join(",");

      const response = await authApi.signUp({
        loginId: singUpFormData.loginId,
        password: singUpFormData.password,
        username: singUpFormData.username,
        email: singUpFormData.email,
        birthDate: singUpFormData.birthDate,
        nickname: singUpFormData.nickname, // 이거문젠가
        gender: singUpFormData.gender,
        weight: singUpFormData.weight,
        height: singUpFormData.height,
        diseaseIndex: diseaseIndex,
      });

      toast.success("회원가입이 완료 되었습니다!");
      router.replace("/login");
    } catch (error) {
      // 서버 측 실패(이메일/닉네임 중복 등) 시 사용자에게 명확히 안내
      const msg =
        error?.response?.data?.message ||
        "회원가입에 실패했습니다. 입력 정보를 확인해주세요.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 py-6 items-center"
          keyboardShouldPersistTaps="handled"
        >
        <View className="w-full max-w-md rounded-[28px] bg-white px-6 py-6">
          <Text className="text-2xl font-bold tracking-tight text-gray-950">
            보유 질환 체크
          </Text>

          <View className="mt-6 flex flex-col">
            <View className="gap-3">
              {diseaseFields.map((field) => (
                <View key={field.name} className="gap-1.5">
                  <Text className="text-sm font-semibold text-gray-900">
                    {field.label}
                  </Text>

                  <Dropdown
                    value={formData[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    options={field.options}
                    heightClass="h-11"
                  />
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`mt-6 h-11 w-full items-center justify-center rounded-lg bg-black ${
                loading ? "opacity-60" : ""
              }`}
            >
              <Text className="text-sm font-semibold text-white">
                {loading ? "처리 중..." : "완료"}
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
