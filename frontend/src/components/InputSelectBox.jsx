import { forwardRef } from "react";

/**
 * 재사용 가능한 입력 필드 컴포넌트
 *
 * @param {string} label - 라벨 텍스트
 * @param {string} type - 입력 타입 (text, email, password 등)
 * @param {string} placeholder - 플레이스홀더
 * @param {string} error - 에러 메시지
 * @param {ReactNode} icon - 아이콘 (선택)
 */

//forwardRef하면 Input 이름이 가려짐
//forwardRef(type = 'text', ref) -> ref로 type = 'text'값이 나가게됨
//forwardRef 쓰는 이유: 자동으로 포커스가게 하거나 
const Input = forwardRef(({
    label, //입력창 위 텍스트 (예: "이메일")
    error, //에러메세지 문자열
    icon, //아이콘 컴포넌트
    className = '', //추가 css 코드
    ...props //그 외 나머지(onClick, ,disabled, onChange등등)
},ref) => {
  return (
    <div className="w-full">
      {/* 라벨: && label prop이 있을때만 렌더링 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* 입력 필드 컨테이너 */}
      <div className="relative">
        {/* 아이콘 */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* 입력 필드 */}
        <select {...props}>
              <option value="">-- 선택 --</option>
              <option value="1">진행 전</option>
              <option value="2">진행 중</option>
              <option value="3">완료</option>
            </select>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

/* 
<div>
    <label>
        <div>
            <div>{icon}</div>
            <input type="text" .... />
        </div>
    </label>
</div> 
*/
//forwardRef로 감싸면 DevTools이름 사라짐 그래서 Input으로 재정의 해서 사용
Input.displayName = 'Input'; //forwardRef 대신 Input으로 사용 import Input from ./Input

export default Input;