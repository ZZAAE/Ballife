import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { useAuth } from '../../contexts/AuthContext';
import WeightRecordModal from '../../modals/WeightRecordModal';

const RecordPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  //토큰 인증 테스트용
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
            toast.error(t('recordPage.toast.loginRequired'));
            navigate('/login', { replace: true, state: { from: `/allRecord` } });
            return;
        }
  },  [authLoading, isAuthenticated, user?.id, navigate]);

  // 복원 중이거나 비로그인 상태면 본문 자체를 그리지 않음
  if (authLoading) return null;
  if (!isAuthenticated || !user?.id) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* 기록 페이지 메인 콘텐츠 예시 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('recordPage.title')}</h1>
        <p className="text-gray-500">{t('recordPage.subtitle')}</p>
      </div>

      {/* 모달을 여는 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
      >
        {t('recordPage.recordWeight')}
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