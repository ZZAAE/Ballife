import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import boardApi from "../../api/boardApi";
import { useAuth } from "../../contexts/AuthContext";

const PAGE_SIZE = 10;

function BoardListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const location = useLocation();
  const givenCategory = location.state?.category ?? "ALL";

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

  // 카테고리 한글화
  const categories = [
    { value: "GENERAL", label: t("boardListPage.category.general") },
    { value: "HYPERLIPIDEMIA", label: t("boardListPage.category.hyperlipidemia") },
    { value: "HYPERTENSION", label: t("boardListPage.category.hypertension") },
    { value: "OSTEOPOROSIS", label: t("boardListPage.category.osteoporosis") },
    { value: "DIABETES", label: t("boardListPage.category.diabetes") },
    { value: "OBESITY", label: t("boardListPage.category.obesity") },
    { value: "GOUT", label: t("boardListPage.category.gout") },
    { value: "QNA", label: t("boardListPage.category.qna") },
  ];

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

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 pt-[87px]">{t("boardListPage.loading")}</div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
              {t("boardListPage.title")}
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              {t("boardListPage.subtitle")}
            </p>

      {/* 검색창 */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("boardListPage.searchPlaceholder")}
          className="w-72 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-100"
        />
        <button
          onClick={() => {
            setSearchKeyword(keyword);
            setPage(0);
          }}
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
        >
          {t("boardListPage.searchButton")}
        </button>
      </div>

      {/* 카테고리 + 정렬 */}
      <div className="mb-4 flex items-center justify-end gap-4 text-sm">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="appearance-none rounded-[10px] border border-[#E5E7EB] bg-white bg-no-repeat pl-3 pr-8 py-2 text-[#0F172A] outline-none focus:border-[#94A3B8]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
            backgroundPosition: "right 7px center",
            backgroundSize: "16px 16px",
          }}
        >
          <option value="ALL">{t("boardListPage.category.all")}</option>
          <option value="GENERAL">{t("boardListPage.category.general")}</option>
          <option value="HYPERLIPIDEMIA">{t("boardListPage.category.hyperlipidemia")}</option>
          <option value="HYPERTENSION">{t("boardListPage.category.hypertension")}</option>
          <option value="OSTEOPOROSIS">{t("boardListPage.category.osteoporosis")}</option>
          <option value="DIABETES">{t("boardListPage.category.diabetes")}</option>
          <option value="OBESITY">{t("boardListPage.category.obesity")}</option>
          <option value="GOUT">{t("boardListPage.category.gout")}</option>
          <option value="QNA">{t("boardListPage.category.qna")}</option>
        </select>

        <button
          onClick={() => handleSortChange("recommend")}
          className={`${sort === "recommend" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          {t("boardListPage.sort.recommend")}
        </button>
        <button
          onClick={() => handleSortChange("views")}
          className={`${sort === "views" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          {t("boardListPage.sort.views")}
        </button>
        <button
          onClick={() => handleSortChange("latest")}
          className={`${sort === "latest" ? "font-semibold text-[#0F172A]" : "text-[#64748B]"}`}
        >
          {t("boardListPage.sort.latest")}
        </button>
      </div>

      {/* 게시글 테이블 */}
      <div className="overflow-x-auto rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <table className="w-full min-w-[720px] table-fixed text-sm">
          <colgroup>
            <col className="w-[70px]" />
            <col className="w-[110px]" />
            <col />
            <col className="w-[130px]" />
            <col className="w-[90px]" />
            <col className="w-[90px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#64748B]">
            <tr>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.number")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.category")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("boardListPage.table.postTitle")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.nickname")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.viewCount")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.upVote")}</th>
              <th className="px-4 py-3 text-center font-medium">{t("boardListPage.table.createdAt")}</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <tr
                  key={post.id}
                  className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]"
                >
                  <td className="px-4 py-3 text-center text-[#94A3B8]">
                    {/* 정렬 방식과 무관하게 항상 내림차순 행번호 표시 */}
                    {totalElements - (page * PAGE_SIZE + index)}
                  </td>
                  <td className="px-4 py-3 text-center text-[#64748B]">
                    {categories.find((c) => c.value === post.category)?.label}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="block truncate text-[#0F172A] hover:text-[#1E293B]"
                      to={`/posts/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="truncate px-4 py-3 text-center text-[#64748B]">
                    <span className="inline-flex items-center justify-center gap-1">
                      {post.userMedalIcon && (
                        <img
                          src={post.userMedalIcon}
                          alt=""
                          className="inline-block h-[1em] w-[1em] object-contain"
                        />
                      )}
                      {post.userNickname}
                    </span>
                  </td>
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
                  {t("boardListPage.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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

      {/* 글쓰기 버튼 — 로그인한 경우에만 작성 가능 */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (!user?.userId) {
              toast.error(t("boardListPage.toast.loginRequired"));
              navigate("/login");
              return;
            }
            navigate("/posts/create");
          }}
          className="rounded-[10px] bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
        >
          {t("boardListPage.writeButton")}
        </button>
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BoardListPage;
