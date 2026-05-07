import { useState } from "react";
import WaterRecordModal from "../modals/bloodsugarModal";
import Chatbot from '../modals/Chatbot'

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
      </button>
        <Chatbot />
      <WaterRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;