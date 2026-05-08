import React, { useState } from 'react';
import BloodPressureRecordModal from '../modals/BloodPressureRecordModal';

export default function TestPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <BloodPressureRecordModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );
}