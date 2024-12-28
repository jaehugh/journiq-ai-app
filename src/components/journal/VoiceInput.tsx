import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { RecordingStatus } from "./RecordingStatus";

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
}

export const VoiceInput = ({ onVoiceInput }: VoiceInputProps) => {
  const { isRecording, startRecording, stopRecording } = useSpeechRecognition({
    onTranscriptionComplete: onVoiceInput
  });

  return (
    <div className="flex items-center gap-2">
      <RecordingStatus isRecording={isRecording} />
      <Button 
        variant="outline"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "bg-red-100 hover:bg-red-200" : ""}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Voice Input
          </>
        )}
      </Button>
    </div>
  );
};