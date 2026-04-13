import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import postApi from '../../api/boardApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './post.css';

function PostEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, authLoading } = useAuth();
    const [bootLoading, setBootLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [formData, setFormData] = useState({
        category: 'GENERAL',
        title: '',
        content: '',
        imageUrl: '',
    });
    const categories = [
    { value: 'GENERAL', label: '자유게시판' },
    { value: 'DIABETES', label: '당뇨' },
    { value: 'OBESITY', label: '비만' },
    { value: 'OSTEOPOROSIS', label: '골다공증' },
    { value: 'HYPERLIPIDEMIA', label: '고지혈증' },
    { value: 'HYPERTENSION', label: '고혈압' },
    { value: 'GOUT', label: '통풍' },
    { value: 'QNA', label: '질문' },
    ];

    useEffect(() => {
        if(authLoading) return;
        if(!isAuthenticated || !user?.userId) {
            toast.error('로그인이 필요합니다.');
            //navigate('/login', { replace: true, state: { from: `/posts/${id}/edit` } });
            return;
        }

        (async () => {
            try {
                setBootLoading(true);
                const res = await postApi.getPost(id);
                const p = res.data;
                if (user.userId !== p.userId) {
                    toast.error('본인 글만 수정할 수 있습니다.');
                    navigate(`/posts/${id}`, {replace: true});
                    return;
                }
                setFormData({
                    category: p.category ?? 'GENERAL',
                    title: p.title ?? '',
                    content: p.content ?? '',
                    imageUrl: p.imageUrl ?? '',
                });
            } catch {
                navigate('/boards');
            }finally{
                setBootLoading(false);
            }
        })();
    }, [authLoading, isAuthenticated, user?.userId, id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name] : value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('제목과 내용을 입력하세요.');
            return;
        }
        if (!user?.userId) {
            toast.error('로그인 정보에 id가 없습니다. 로그아웃 후 다시 로그인하세요.');
            return;
        }
        try {
            setSaving(true);
            await postApi.updatePost(user.userId, id, formData);
            toast.success('수정되었습니다.');
            //navigate(`/posts`);
        } catch (error) {
            console.error(error);
        }finally{
            setSaving(false);
        }
    };

    if (authLoading || bootLoading) {
        return (
            <div className="flex justify-center items-center min-h-[320px]">
                <p className="text-gray-500">확인 중...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <section className="post-page">
            <div className="post-wrap">
                <div className="post-header">
                    <h1 className="post-title">글 수정</h1>
                    <p className="post-subtitle">
                        건강한 삶을 위한 커뮤니티에 여러분의 이야기를 들려주세요.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="post-form"
                >
                    <div className="post-grid">
                        <div>
                            <label htmlFor="category" className="post-field-label">
                                카테고리
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="post-select"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="title" className="post-field-label">
                                제목
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="포스트의 제목을 입력하세요"
                                maxLength={120}
                                className="post-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="post-field-label">
                                내용
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="내용을 입력하세요..."
                                rows={14}
                                className="post-textarea"
                            />
                        </div>
                    </div>

                    <div className="post-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="post-btn"
                        >
                            나가기
                        </Button>
                        <Button type="submit" disabled={saving} className="post-btn post-btn-submit">
                            {saving ? '수정 중...' : '수정'}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PostEditPage;