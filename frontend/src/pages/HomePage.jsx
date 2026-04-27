import { useState } from "react";
import WaterRecordModal from "../modals/bloodsugarModal";

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        혈당 모달 열기
      </button>

      <WaterRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;