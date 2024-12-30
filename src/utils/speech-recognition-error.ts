import { SpeechRecognitionErrorEvent } from "@/types/speech-recognition";

export const isFatalError = (error: string): boolean => {
  return error === 'no-speech' || error === 'audio-capture';
};

export const getErrorMessage = (error: string): string => {
  return `Error recording voice: ${error}. Please try again.`;
};

export const handleSpeechError = (
  event: SpeechRecognitionErrorEvent,
  onError: (message: string) => void,
  onFatalError: () => void
) => {
  console.error('Speech recognition error:', event);
  
  if (isFatalError(event.error)) {
    onError(getErrorMessage(event.error));
    onFatalError();
  }
};