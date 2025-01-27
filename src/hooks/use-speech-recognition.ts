import { useCallback, useRef, useState } from "react";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseSpeechRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
}

export const useSpeechRecognition = ({ onTranscriptionComplete }: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];

            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
              body: { audio: base64Audio }
            });

            if (error) {
              console.error('Transcription error:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to transcribe audio. Please try again.",
              });
              return;
            }

            if (data.text) {
              onTranscriptionComplete(data.text.trim());
              toast({
                title: "Success",
                description: "Voice input processed successfully.",
              });
            }
          };

          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process audio. Please try again.",
          });
        } finally {
          // Clean up the media stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone. Click stop when finished.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
      });
    }
  }, [onTranscriptionComplete, toast]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};