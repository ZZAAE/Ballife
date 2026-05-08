import { MessageSquare } from "lucide-react";

export default function FloatingChatButton() {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-[#1B1F2A] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
      <MessageSquare className="w-6 h-6 text-white" />
    </div>
  );
}