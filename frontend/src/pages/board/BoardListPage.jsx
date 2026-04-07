import { useState, useEffect } from "react";
import boardApi from "../../api/boardApi";
import { Link } from "react-router-dom";

// 로그인 auth 구현 필요
// 내가쓴거 : getBoardByCategory(카테고리별로 검색)

function BoardListPage(){
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0)

    const [category, setCategory] = useState("ALL"); // 초기값: 전체조회
    const [sort, setSort] = useState("latest") // 초기값: 날짜순,   latest|views|recommend
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색기능
    const [keyword, setKeyword] = useState("") // 검색키워드 저장

    // 기본적으로 전체 게시글 조회
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await boardApi.getPosts(
                    page,
                    10,
                    category === "ALL" ? undefined : category,
                    sort,
                    searchKeyword || undefined
                );
                setPosts(res.data.content ?? []);
                setTotalPages(res.data.totalPages ?? 0);
            } catch (error) {
                console.error(error);
            } finally{
                setLoading(false);
            }
        })();
    }, [page, category, sort, searchKeyword]); // 페이지, 카테고리, 정렬법 변경시 리랜더링


    // 카테고리, 정렬법 변경, 검색시 1페이지로
    const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setPage(0);
    };

    const handleSortChange = (nextSort) => {
    setSort(nextSort);
    setPage(0);
    };



    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;


    return(
        <div className="px-12 py-10">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
            <p className="mt-2 text-sm text-gray-500">
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
                className="w-72 rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
                onClick={() => {
                    setSearchKeyword(keyword);
                    setPage(0);
                }}
                className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
                검색
            </button>
        </div>

        {/* 카테고리 + 정렬 */}
        <div className="mb-4 flex items-center justify-end gap-4 text-sm">
            <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
            >
                <option value="ALL">전체</option>
                <option value="GENERAL">자유</option>
                <option value="DIABETES">당뇨</option>
                <option value="OBESITY">비만</option>
                <option value="HYPERTENSION">고혈압</option>
                <option value="OSTEOPOROSIS">골다공증</option>
                <option value="GOUT">통풍</option>
                <option value="HYPERLIPIDEMIA">고지혈증</option>
            </select>

            <button
                onClick={() => handleSortChange("recommend")}
                className={`${sort === "recommend" ? "text-blue-600 font-semibold" : "text-gray-600"}`}
            >
                추천순
            </button>
            <button
                onClick={() => handleSortChange("views")}
                className={`${sort === "views" ? "text-blue-600 font-semibold" : "text-gray-600"}`}
            >
                조회순
            </button>
            <button
                onClick={() => handleSortChange("latest")}
                className={`${sort === "latest" ? "text-blue-600 font-semibold" : "text-gray-600"}`}
            >
                날짜순
            </button>
        </div>

        {/* 게시글 테이블 */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-center">번호</th>
                        <th className="px-4 py-3 text-center">카테고리</th>
                        <th className="px-4 py-3 text-left">게시글 제목</th>
                        <th className="px-4 py-3 text-center">닉네임</th>
                        <th className="px-4 py-3 text-center">조회수</th>
                        <th className="px-4 py-3 text-center">날짜</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <tr key={post.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="px-4 py-3 text-center text-gray-500">
                                    {page * 10 + index + 1}
                                </td>
                                <td className="px-4 py-3 text-center">{post.category}</td>
                                <td className="px-4 py-3">

                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="text-gray-900 hover:text-blue-600"
                                    >
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-center">{post.userNickname}</td>
                                <td className="px-4 py-3 text-center">{post.viewCount}</td>
                                <td className="px-4 py-3 text-center text-gray-500">
                                    {post.createdAt}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
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
                    className={`h-9 w-9 rounded-full text-sm ${
                        page === i
                            ? "bg-slate-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
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
                className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
                글쓰기
            </Link>
        </div>
    </div>
    );
}

export default BoardListPage;