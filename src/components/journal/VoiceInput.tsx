import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    } & {
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

export const VoiceInput = ({ onVoiceInput }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const transcriptRef = useRef<string>("");

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Voice input has been processed.",
      });
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Speech recognition is not supported in your browser. Please use Chrome.",
        });
        return;
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language explicitly
      recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            // Get the most confident result
            const mostConfidentResult = Array.from(result)
              .reduce((prev, current) => 
                current.confidence > prev.confidence ? current : prev
              );
            
            finalTranscript += mostConfidentResult.transcript + ' ';
            transcriptRef.current = finalTranscript;
            onVoiceInput(finalTranscript.trim());
          } else {
            interimTranscript += result[0].transcript;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Error recording voice: ${event.message}. Please try again.`,
        });
        stopRecording();
      };

      recognition.onend = () => {
        // If we still have a transcript when the recognition ends,
        // make sure it's sent to the parent component
        if (transcriptRef.current) {
          onVoiceInput(transcriptRef.current.trim());
          transcriptRef.current = "";
        }
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      transcriptRef.current = ""; // Reset transcript
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please try again.",
      });
    }
  }, [onVoiceInput, stopRecording, toast]);

  return (
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
  );
};