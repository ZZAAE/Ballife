import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import authApi from '../../api/authApi';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.loginId) newErrors.loginId = '아이디를 입력해주세요.';
        if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const response = await authApi.login(formData);
            login(response.data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success(`${response.data.nickname || response.data.username}님, 환영합니다!`);
            const from = typeof location.state?.from === 'string' ? location.state.from : '/';
            navigate(from, { replace: true });
        } catch (error) {
            console.error('로그인 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4"style={{ minHeight: '93vh' }}>
            <div className="w-full max-w-sm">

                {/* 타이틀 */}
                <h1 className="text-2xl font-medium text-center text-gray-900 mb-8 tracking-tight">
                    로그인
                </h1>

                <form onSubmit={handleSubmit} noValidate>

                    {/* 아이디 인풋 */}
                    <div className="mb-3">
                        <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            placeholder="아이디를 입력해주세요."
                            autoComplete="username"
                            className={`
                                w-full h-12 px-4
                                bg-gray-100 rounded
                                text-sm text-gray-800 placeholder-gray-400
                                border border-transparent
                                outline-none
                                transition-colors duration-150
                                focus:bg-white focus:border-gray-300
                                ${errors.loginId ? 'border-red-400 bg-red-50' : ''}
                            `}
                        />
                        {errors.loginId && (
                            <p className="mt-1 text-xs text-red-500 pl-1">{errors.loginId}</p>
                        )}
                    </div>

                    {/* 비밀번호 인풋 */}
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력해주세요."
                            autoComplete="current-password"
                            className={`
                                w-full h-12 px-4
                                bg-gray-100 rounded
                                text-sm text-gray-800 placeholder-gray-400
                                border border-transparent
                                outline-none
                                transition-colors duration-150
                                focus:bg-white focus:border-gray-300
                                ${errors.password ? 'border-red-400 bg-red-50' : ''}
                            `}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>
                        )}
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full h-12
                            bg-gray-900 hover:bg-black
                            text-white text-sm font-medium
                            rounded
                            transition-colors duration-150
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {/* 회원가입 링크 */}
                <p className="text-center mt-5 text-sm text-gray-500">
                    계정이 없으신가요?{' '}
                    <Link
                        to="/signup"
                        className="text-blue-600 hover:underline"
                    >
                        회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;