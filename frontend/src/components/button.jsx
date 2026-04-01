/**
 * 재사용 가능한 버튼 컴포넌트
 * @param {string} variant - 버튼 스타일 ('primary' | 'secondary' | 'outline')
 * @param {string} size - 버튼 크기 ('sm' | 'md' | 'lg')
 * @param {ReactNode} children - 버튼 내용
 * @param {function} onClick - 클릭 핸들러
 * @param {string} className - 추가 클래스
 * @param {boolean} disabled - 비활성화 여부
 */

const Button = ({
    variant = 'primary', //기본값
    size = 'md',         //중간크기
    children, //버튼안에 들어갈 내용
    onClick, //클릭시 실행할 함수
    className = '', //css
    disabled = false, //비활성화 여부
    type = 'button', 
    ...props //나머지 props들 관리 (기타 다른 html 속성(id나 label등)이 올수도 있으므로)
}) => {
    // 기본 스타일
    const baseStyles = 'font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    // variant별 스타일
    const variantStyles = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300',
    };

    // size별 스타일
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    return (
        <button type={type}
                onClick={onClick}
                disabled={disabled}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                {...props}>
            {children}ㅌ
        </button>
    );
};

export default Button;