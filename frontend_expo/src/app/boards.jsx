import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../components/Dropdown";
import { useRouter, useLocalSearchParams } from "expo-router";
import boardApi from "../api/boardApi";
import { useAuth } from "../context/AuthContext";
import toast from "../lib/toast";

const PAGE_SIZE = 10;

// 카테고리 한글화
const categories = [
  { value: "GENERAL", label: "자유" },
  { value: "HYPERLIPIDEMIA", label: "고지혈증" },
  { value: "HYPERTENSION", label: "고혈압" },
  { value: "OSTEOPOROSIS", label: "골다공증" },
  { value: "DIABETES", label: "당뇨" },
  { value: "OBESITY", label: "비만" },
  { value: "GOUT", label: "통풍" },
  { value: "QNA", label: "질문" },
];

export default function BoardListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // web의 location.state?.category 대체: 라우트 파라미터로 전달받은 category
  const givenCategory = params?.category ?? "ALL";

  const [category, setCategory] = useState(givenCategory || "ALL");
  const [sort, setSort] = useState("latest"); // latest | views | recommend
  const [searchKeyword, setSearchKeyword] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await boardApi.getPosts(
          page,
          PAGE_SIZE,
          category === "ALL" ? undefined : category,
          sort,
          searchKeyword || undefined,
        );
        if (cancelled) return;
        setPosts(res.data?.content ?? []);
        setTotalPages(res.data?.totalPages ?? 0);
        setTotalElements(res.data?.totalElements ?? 0);
      } catch (error) {
        if (cancelled) return;
        console.error("[BoardListPage] getPosts failed:", error);
        setPosts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, category, sort, searchKeyword]);

  // 작성일 포맷팅
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 카테고리, 정렬법 변경, 검색시 1페이지로
  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setPage(0);
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);
    setPage(0);
  };

  const renderItem = ({ item: post, index }) => (
    <Pressable
      onPress={() => router.push(`/posts/${post.id}`)}
      className="flex-row items-center border-b border-[#E5E7EB] px-4 py-3"
    >
      {/* 번호: 정렬 방식과 무관하게 항상 내림차순 행번호 표시 */}
      <Text className="w-[36px] text-center text-[12px] text-[#94A3B8]">
        {totalElements - (page * PAGE_SIZE + index)}
      </Text>
      <View className="flex-1 px-2">
        <Text
          className="text-[14px] text-[#0F172A]"
          numberOfLines={1}
        >
          {post.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text className="text-[11px] text-[#64748B]">
            {categories.find((c) => c.value === post.category)?.label}
          </Text>
          <Text className="text-[11px] text-[#94A3B8]">·</Text>
          <View className="flex-row items-center gap-1">
            {post.userMedalIcon && (
              <Image
                source={{ uri: post.userMedalIcon }}
                className="h-3 w-3"
                resizeMode="contain"
              />
            )}
            <Text className="text-[11px] text-[#64748B]">
              {post.userNickname}
            </Text>
          </View>
          <Text className="text-[11px] text-[#94A3B8]">·</Text>
          <Text className="text-[11px] text-[#64748B]">
            조회 {post.viewCount}
          </Text>
          <Text className="text-[11px] text-[#94A3B8]">·</Text>
          <Text className="text-[11px] text-[#64748B]">
            추천 {post.upVote ?? 0}
          </Text>
          <Text className="text-[11px] text-[#94A3B8]">·</Text>
          <Text className="text-[11px] text-[#94A3B8]">
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]">
        <Text className="p-8 text-center text-[#64748B]">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View className="px-4 py-6">
      <Text className="text-[26px] font-extrabold tracking-tight text-[#0F172A]">
        커뮤니티
      </Text>
      <Text className="mb-6 mt-1 text-[14px] text-[#64748B]">
        건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
      </Text>

      {/* 검색창 */}
      <View className="mb-4 flex-row items-center gap-3">
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="검색어를 입력하세요."
          placeholderTextColor="#94A3B8"
          className="flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-[14px] text-[#0F172A]"
        />
        <Pressable
          onPress={() => {
            setSearchKeyword(keyword);
            setPage(0);
          }}
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5"
        >
          <Text className="text-[14px] font-semibold text-white">검색</Text>
        </Pressable>
      </View>

      {/* 카테고리 선택 */}
      <View className="mb-3">
        <Dropdown
          value={category}
          onChange={(value) => handleCategoryChange(value)}
          options={[
            { label: "전체", value: "ALL" },
            { label: "자유", value: "GENERAL" },
            { label: "고지혈증", value: "HYPERLIPIDEMIA" },
            { label: "고혈압", value: "HYPERTENSION" },
            { label: "골다공증", value: "OSTEOPOROSIS" },
            { label: "당뇨", value: "DIABETES" },
            { label: "비만", value: "OBESITY" },
            { label: "통풍", value: "GOUT" },
            { label: "질문", value: "QNA" },
          ]}
        />
      </View>

      {/* 정렬 */}
      <View className="mb-4 flex-row items-center justify-end gap-4">
        <Pressable onPress={() => handleSortChange("recommend")}>
          <Text
            className={`text-[13px] ${sort === "recommend" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
          >
            추천순
          </Text>
        </Pressable>
        <Pressable onPress={() => handleSortChange("views")}>
          <Text
            className={`text-[13px] ${sort === "views" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
          >
            조회순
          </Text>
        </Pressable>
        <Pressable onPress={() => handleSortChange("latest")}>
          <Text
            className={`text-[13px] ${sort === "latest" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
          >
            날짜순
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const ListFooter = (
    <View className="px-4 pb-8">
      {/* 페이지네이션 */}
      <View className="mt-2 flex-row flex-wrap items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Pressable
            key={i}
            onPress={() => setPage(i)}
            className={`h-9 w-9 items-center justify-center rounded-full ${
              page === i ? "bg-[#0F172A]" : ""
            }`}
          >
            <Text
              className={`text-[13px] ${page === i ? "text-white" : "text-[#64748B]"}`}
            >
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 글쓰기 버튼 — 로그인한 경우에만 작성 가능 */}
      <View className="mt-6 flex-row justify-end">
        <Pressable
          onPress={() => {
            if (!user?.userId) {
              toast.error("로그인이 필요합니다.");
              router.push("/login");
              return;
            }
            router.push("/posts/create");
          }}
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5"
        >
          <Text className="text-[14px] font-semibold text-white">글쓰기</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <View className="px-4 py-10">
            <Text className="text-center text-[#94A3B8]">
              게시글이 없습니다.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
