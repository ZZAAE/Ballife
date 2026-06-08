import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../../../components/Dropdown";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import postApi from "../../../api/boardApi";
import toast from "../../../lib/toast";

function formatEditorContent(content) {
  if (!content) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  return hasHtmlTag ? content : content.replace(/\n/g, "<br />");
}

// 웹의 isRichTextEmpty 대체: RN에서는 Quill 에디터 대신 평문/HTML TextInput을 쓰므로
// 단순히 공백 여부만 확인한다.
function isRichTextEmpty(content) {
  if (!content) return true;
  return content.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function PostEditPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [formData, setFormData] = useState({
    category: "GENERAL",
    title: "",
    content: "",
  });
  const categories = [
    { value: "GENERAL", label: "자유게시판" },
    { value: "DIABETES", label: "당뇨" },
    { value: "OBESITY", label: "비만" },
    { value: "OSTEOPOROSIS", label: "골다공증" },
    { value: "HYPERLIPIDEMIA", label: "고지혈증" },
    { value: "HYPERTENSION", label: "고혈압" },
    { value: "GOUT", label: "통풍" },
    { value: "QNA", label: "질문" },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    (async () => {
      try {
        setBootLoading(true);
        const res = await postApi.getPost(id);
        const p = res.data;
        if (user.userId !== p.userId) {
          toast.error("본인 글만 수정할 수 있습니다.");
          router.replace(`/posts/${id}`);
          return;
        }
        setFormData({
          category: p.category ?? "",
          title: p.title ?? "",
          content: formatEditorContent(p.content ?? ""),
        });
      } catch {
        router.replace("/boards");
      } finally {
        setBootLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated, user?.userId, id, router]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || isRichTextEmpty(formData.content)) {
      toast.error("제목과 내용을 입력하세요.");
      return;
    }
    if (!user?.userId) {
      toast.error("로그인 정보에 id가 없습니다. 로그아웃 후 다시 로그인하세요.");
      return;
    }
    try {
      setSaving(true);
      await postApi.updatePost(user.userId, id, formData);
      toast.success("수정되었습니다.");
      router.push(`/posts/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || bootLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F9FAFB]">
        <Text className="text-gray-500">확인 중...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerClassName="px-4 py-6">
        <Text className="text-[26px] font-extrabold tracking-tight text-[#0F172A]">
          글 수정
        </Text>
        <Text className="mb-8 mt-1 text-[14px] text-gray-500">
          건강한 삶을 위한 커뮤니티에 여러분의 이야기를 들려주세요.
        </Text>

        <View className="gap-6">
          {/* 카테고리 */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              카테고리
            </Text>
            <Dropdown
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              options={categories.map((category) => ({
                label: category.label,
                value: category.value,
              }))}
            />
          </View>

          {/* 제목 */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              제목
            </Text>
            <TextInput
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="포스트의 제목을 입력하세요"
              placeholderTextColor="#d1d5db"
              maxLength={120}
              className="h-12 rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700"
            />
          </View>

          {/* 내용 — Quill 리치에디터 대체: multiline TextInput (평문/HTML 직접 편집) */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              내용
            </Text>
            <TextInput
              value={formData.content}
              onChangeText={handleContentChange}
              placeholder="내용을 입력하세요..."
              placeholderTextColor="#d1d5db"
              multiline
              textAlignVertical="top"
              className="min-h-[220px] rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-[15px] leading-7 text-gray-700"
            />
            <View className="mt-7 gap-3">
              <Text className="text-[14px] text-gray-400">
                리치 에디터(이미지 삽입)는 모바일에서 지원되지 않아 본문은 일반
                텍스트/HTML로 입력합니다.
              </Text>
              <View className="flex-row items-center justify-end gap-3">
                <Pressable
                  onPress={() => router.back()}
                  className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5"
                >
                  <Text className="text-[14px] font-semibold text-gray-700">
                    나가기
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={saving}
                  className="rounded-[10px] bg-[#0F172A] px-6 py-2.5"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    {saving ? "수정 중..." : "수정"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
