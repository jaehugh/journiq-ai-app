import { useCallback, useRef, useState } from "react";
import { useToast } from "./use-toast";
import { handleSpeechError } from "@/utils/speech-recognition-error";
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "@/types/speech-recognition";

interface UseSpeechRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
}

export const useSpeechRecognition = ({ onTranscriptionComplete }: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  const { toast } = useToast();

  const handleTranscriptionComplete = useCallback(() => {
    if (transcriptRef.current) {
      onTranscriptionComplete(transcriptRef.current.trim());
      transcriptRef.current = "";
    }
  }, [onTranscriptionComplete]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      
      handleTranscriptionComplete();

      toast({
        title: "Recording complete",
        description: "Your voice input has been processed.",
      });
    }
  }, [toast, handleTranscriptionComplete]);

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
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          transcriptRef.current += lastResult[0].transcript + " ";
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        handleSpeechError(
          event,
          (message) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: message,
            });
          },
          stopRecording
        );
      };

      recognition.onspeechend = null;
      recognition.onend = () => {
        if (recognitionRef.current === null) {
          setIsRecording(false);
          handleTranscriptionComplete();
        } else {
          recognition.start();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      transcriptRef.current = "";
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone. Click stop when finished.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please try again.",
      });
    }
  }, [onTranscriptionComplete, stopRecording, toast]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};