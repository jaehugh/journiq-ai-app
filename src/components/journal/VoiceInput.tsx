import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
}

export const VoiceInput = ({ onVoiceInput }: VoiceInputProps) => {
  return (
    <Button variant="outline">
      <Mic className="w-4 h-4 mr-2" />
      Voice Input
    </Button>
  );
};