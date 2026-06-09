import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import authApi from '../../api/authApi';

function LoginPage() {
    const { t } = useTranslation();
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
        if (!formData.loginId) newErrors.loginId = t('loginPage.validation.loginIdRequired');
        if (!formData.password) newErrors.password = t('loginPage.validation.passwordRequired');
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
            // localStorage.setItem('token', response.data.token);
            // localStorage.setItem('user', JSON.stringify(response.data));
            toast.success(t('loginPage.toast.welcome', { name: response.data.nickname || response.data.username }));
            const from = typeof location.state?.from === 'string' ? location.state.from : '/';
            navigate(from, { replace: true });
        } catch (error) {
            console.error('로그인 실패:', error);
            const msg = error?.response?.data?.message || t('loginPage.toast.loginFailed');
            toast.error(msg);   // 직접 띄우기
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4"style={{ minHeight: '93vh' }}>
            <div className="w-full max-w-sm">

                {/* 타이틀 */}
                <h1 className="text-2xl font-medium text-center text-gray-900 mb-8 tracking-tight">
                    {t('loginPage.title')}
                </h1>

                <form onSubmit={handleSubmit} noValidate>

                    {/* 아이디 인풋 */}
                    <div className="mb-3">
                        <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            placeholder={t('loginPage.loginIdPlaceholder')}
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
                            placeholder={t('loginPage.passwordPlaceholder')}
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
                        {loading ? t('loginPage.submitting') : t('loginPage.submit')}
                    </button>
                </form>

                {/* 회원가입 링크 */}
                <p className="text-center mt-5 text-sm text-gray-500">
                    {t('loginPage.noAccount')}{' '}
                    <Link
                        to="/signup"
                        className="text-blue-600 hover:underline"
                    >
                        {t('loginPage.signUp')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;