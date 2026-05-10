import React, { useState } from 'react';
import WeightRecordModal from '../../modals/WeightRecordModal';

const RecordPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* 기록 페이지 메인 콘텐츠 예시 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">나의 건강 기록</h1>
        <p className="text-gray-500">꾸준한 기록이 변화를 만듭니다.</p>
      </div>

      {/* 모달을 여는 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
      >
        체중 기록하기
      </button>

      {/* 모달 컴포넌트 */}
      <WeightRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default RecordPage;