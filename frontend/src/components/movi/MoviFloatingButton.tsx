import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoviFloatingButtonProps {
  onClick: () => void;
}

export function MoviFloatingButton({ onClick }: MoviFloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
    >
      <Bot className="w-6 h-6" />
    </Button>
  );
}
