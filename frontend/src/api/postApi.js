import api from './index';

const postApi = {

    //  게시글 상세 조회
    getPost: (postId) => {
        return api.get(`/posts/${postId}`);
    },
    // 게시글 등록 CreatePostPage에서 넘어오는 data가 title content category imgurl
    createPost: (userId, data) => {
        return api.post('/posts',  { userId, ...data } )},

    // 게시글 목록 조회 (페이지, 사이즈, sort는 고정) 카테고리랑 키워드는 선택값 카테고리만 포함된 거하나 키워드만 , 둘다 포함 하나 
    // page size category sort keyword 
    // 삼항연산자로 category, keyword가 있으면 보내고, 없으면 공백으로 보낸다 
    getPosts: (page = 0, size = 10, category ,sort='ALL', searchKeyword) => {
        return api.get('/posts', { params: {
                                                page,
                                                size,
                                                ...(category ? { category } : {}),
                                                sort,
                                                ...(searchKeyword ? { searchKeyword } : {}),
                                            }, });
    },

    // 게시글 수정 // title content category imgurl -> createrequest param이 아니라 data에서 받아 보내는거
    updatePost: (userId, postId, data) => {
        return api.put(`/posts/${postId}`, data ,{params: { userId } })

    },

    // 게시글 삭제 
    deletePost: (userId, postId) => {
        return api.delete(`/posts/${postId}`, {params: { userId } })
    },

};



export default postApi;
