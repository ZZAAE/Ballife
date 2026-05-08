import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Button from '../../components/Button';
import authApi from '../../api/authApi';
<<<<<<< HEAD

=======
>>>>>>> origin/jisoo0508

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.loginId) {
            newErrors.loginId = '아이디를 입력해주세요.';
        }
        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); //기본 새로고침, 요청 막음

        if (!validate()) return; //유효성 검사 false면 return

        try {
            setLoading(true);
            const response = await authApi.login(formData);
            login(response.data); //AuthContext의 login 함수 호출하여 상태 업데이트

            // 토큰 저장 -> JWT 토근 발급
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            login(response.data);
            
            toast.success(`${response.data.nickname || response.data.username}님, 환영합니다!`); //토스트 메시지 띄우기
            const from = typeof location.state?.from === 'string' ? location.state.from : '/';
            navigate(from, { replace: true });

        } catch (error) {
            console.error('로그인 실패:', error);
        } finally {
            setLoading(false);
        }


    };

    return (
        <div>
            <div>
                <h1>로그인</h1>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="아이디"
                        name="loginId"
                        value={formData.loginId}
                        onChange={handleChange}
                        placeholder="아이디"
                        error={errors.loginId}
                    />

                    <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        error={errors.password}
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    계정이 없으신가요?{' '}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
