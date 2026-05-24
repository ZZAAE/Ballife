import { useMemo, useState } from "react";
// import boardApi from "../../api/boardApi";
import { Link, useLocation } from "react-router-dom";
import { DUMMY_POSTS, PAGE_SIZE } from "./dummyPosts";

// 로그인 auth 구현 필요
// 내가쓴거 : getBoardByCategory(카테고리별로 검색)

function BoardListPage() {
  const [loading] = useState(false);
  const [page, setPage] = useState(0);

  const location = useLocation(); // 게시판 초기화 위해 필요함 링크에서 카테고리값 추출
  const givenCategory = location.state?.category ?? "ALL"; // 디테일에서 넘어온 값이 있나 확인

  const [category, setCategory] = useState(givenCategory || "ALL"); // 초기값: 전체조회
  const [sort, setSort] = useState("latest"); // 초기값: 날짜순,   latest|views|recommend
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색기능
  const [keyword, setKeyword] = useState(""); // 검색키워드 저장

  // 기본적으로 전체 게시글 조회
  // useEffect(() => {
  //     (async () => {
  //         try {
  //             setLoading(true);
  //             const res = await boardApi.getPosts(
  //                 page,
  //                 10,
  //                 category === "ALL" ? undefined : category,
  //                 sort,
  //                 searchKeyword || undefined
  //             );
  //             setPosts(res.data.content ?? []);
  //             setTotalPages(res.data.totalPages ?? 0);
  //         } catch (error) {
  //             console.error(error);
  //         } finally{
  //             setLoading(false);
  //         }
  //     })();
  // }, [page, category, sort, searchKeyword]); // 페이지, 카테고리, 정렬법 변경시 리랜더링

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

  // 작성일 포맷팅
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // [더미 데이터 로직 시작] 검색, 정렬, 카테고리 필터를 프런트에서 처리
  const filteredPosts = useMemo(() => {
    let result = [...DUMMY_POSTS];

    if (category !== "ALL") {
      result = result.filter((post) => post.category === category);
    }

    if (searchKeyword.trim()) {
      const normalizedKeyword = searchKeyword.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(normalizedKeyword) ||
          post.userNickname.toLowerCase().includes(normalizedKeyword),
      );
    }

    result.sort((leftPost, rightPost) => {
      if (sort === "views") {
        return rightPost.viewCount - leftPost.viewCount;
      }

      if (sort === "recommend") {
        return rightPost.upVote - leftPost.upVote;
      }

      return new Date(rightPost.createdAt) - new Date(leftPost.createdAt);
    });

    return result;
  }, [category, searchKeyword, sort]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);

  const posts = useMemo(() => {
    const startIndex = page * PAGE_SIZE;
    return filteredPosts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPosts, page]);
  // [더미 데이터 로직 끝]

  // 카테고리, 정렬법 변경, 검색시 1페이지로
  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setPage(0);
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);
    setPage(0);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 pt-[87px]">로딩 중...</div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[30px] font-extrabold tracking-tight leading-none text-[#0F172A]">커뮤니티</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
        </p>
      </div>

      {/* 검색창 */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요."
          className="w-72 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-100"
        />
        <button
          onClick={() => {
            setSearchKeyword(keyword);
            setPage(0);
          }}
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
        >
          검색
        </button>
      </div>

      {/* 카테고리 + 정렬 */}
      <div className="mb-4 flex items-center justify-end gap-4 text-sm">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[#0F172A] outline-none focus:border-[#94A3B8]"
        >
          <option value="ALL">전체</option>
          <option value="GENERAL">자유</option>
          <option value="HYPERLIPIDEMIA">고지혈증</option>
          <option value="HYPERTENSION">고혈압</option>
          <option value="OSTEOPOROSIS">골다공증</option>
          <option value="DIABETES">당뇨</option>
          <option value="OBESITY">비만</option>
          <option value="GOUT">통풍</option>
          <option value="QNA">질문</option>
        </select>

        <button
          onClick={() => handleSortChange("recommend")}
          className={`${sort === "recommend" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          추천순
        </button>
        <button
          onClick={() => handleSortChange("views")}
          className={`${sort === "views" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          조회순
        </button>
        <button
          onClick={() => handleSortChange("latest")}
          className={`${sort === "latest" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          날짜순
        </button>
      </div>

      {/* 게시글 테이블 */}
      <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#64748B]">
            <tr>
              <th className="px-4 py-3 text-center font-medium">번호</th>
              <th className="px-4 py-3 text-center font-medium">카테고리</th>
              <th className="px-4 py-3 text-left font-medium">게시글 제목</th>
              <th className="px-4 py-3 text-center font-medium">닉네임</th>
              <th className="px-4 py-3 text-center font-medium">조회수</th>
              <th className="px-4 py-3 text-center font-medium">추천수</th>
              <th className="px-4 py-3 text-center font-medium">작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]"
                >
                  <td className="px-4 py-3 text-center text-[#94A3B8]">
                    {post.id} {/* {page * 10 + index + 1} */}
                  </td>
                  <td className="px-4 py-3 text-center text-[#64748B]">
                    {categories.find((c) => c.value === post.category)?.label}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="text-[#0F172A] hover:text-[#1E293B]"
                      to={`/posts/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-[#64748B]">{post.userNickname}</td>
                  <td className="px-4 py-3 text-center text-[#64748B]">{post.viewCount}</td>
                  <td className="px-4 py-3 text-center text-[#64748B]">{post.upVote ?? 0}</td>
                  <td className="px-4 py-3 text-center text-[#94A3B8]">
                    {formatDate(post.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-[#94A3B8]"
                >
                  게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-9 w-9 rounded-full text-sm transition ${
              page === i
                ? "bg-[#0F172A] text-white"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="mt-6 flex justify-end">
        <Link
          to="/posts/create"
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
        >
          글쓰기
        </Link>
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BoardListPage;
