import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { useAuth } from "../context/AuthContext";
import toast from "../lib/toast";
import authApi from "../api/authApi";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ loginId: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.loginId) newErrors.loginId = "아이디를 입력해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const response = await authApi.login(formData);
      await login(response.data);
      toast.success(
        `${response.data.nickname || response.data.username}님, 환영합니다!`,
      );
      router.replace("/dashboard");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "아이디 또는 비밀번호가 올바르지 않습니다.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full h-12 px-4 bg-gray-100 rounded text-sm text-gray-800 border border-transparent";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-full max-w-sm">
            {/* 타이틀 */}
            <Text className="mb-8 text-center text-2xl font-medium tracking-tight text-gray-900">
              로그인
            </Text>

            {/* 아이디 */}
            <View className="mb-3">
              <TextInput
                value={formData.loginId}
                onChangeText={(v) => handleChange("loginId", v)}
                placeholder="아이디를 입력해주세요."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                className={`${inputBase} ${
                  errors.loginId ? "border-red-400 bg-red-50" : ""
                }`}
              />
              {!!errors.loginId && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.loginId}
                </Text>
              )}
            </View>

            {/* 비밀번호 */}
            <View className="mb-4">
              <TextInput
                value={formData.password}
                onChangeText={(v) => handleChange("password", v)}
                placeholder="비밀번호를 입력해주세요."
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                onSubmitEditing={handleSubmit}
                className={`${inputBase} ${
                  errors.password ? "border-red-400 bg-red-50" : ""
                }`}
              />
              {!!errors.password && (
                <Text className="mt-1 pl-1 text-xs text-red-500">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* 로그인 버튼 */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`h-12 w-full items-center justify-center rounded bg-gray-900 ${
                loading ? "opacity-60" : ""
              }`}
            >
              <Text className="text-sm font-medium text-white">
                {loading ? "로그인 중..." : "로그인"}
              </Text>
            </Pressable>

            {/* 회원가입 링크 */}
            <View className="mt-5 flex-row items-center justify-center">
              <Text className="text-sm text-gray-500">계정이 없으신가요? </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text className="text-sm text-blue-600">회원가입</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
