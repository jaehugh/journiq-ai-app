import { useCallback, useRef, useState } from "react";
import { useToast } from "./use-toast";

// Define types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'service-not-allowed';
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
}

export const useSpeechRecognition = ({ onTranscriptionComplete }: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const transcriptRef = useRef<string>("");

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      
      if (transcriptRef.current) {
        onTranscriptionComplete(transcriptRef.current.trim());
        transcriptRef.current = "";
      }

      toast({
        title: "Recording complete",
        description: "Your voice input has been processed.",
      });
    }
  }, [toast, onTranscriptionComplete]);

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
          const transcript = lastResult[0].transcript;
          transcriptRef.current += transcript + " ";
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event);
        // Only stop recording if it's a fatal error
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Error recording voice: ${event.error}. Please try again.`,
          });
          stopRecording();
        }
      };

      // Remove automatic stopping on silence
      recognition.onspeechend = null;
      recognition.onend = () => {
        // Only set isRecording to false if we're actually stopping
        // This prevents the recording from stopping automatically
        if (recognitionRef.current === null) {
          setIsRecording(false);
          if (transcriptRef.current) {
            onTranscriptionComplete(transcriptRef.current.trim());
            transcriptRef.current = "";
          }
        } else {
          // If recognition ended but we didn't stop it, restart it
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