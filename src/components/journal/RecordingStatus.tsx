import { cn } from "@/lib/utils";

interface RecordingStatusProps {
  isRecording: boolean;
}

export const RecordingStatus = ({ isRecording }: RecordingStatusProps) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-full",
      isRecording ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isRecording ? "bg-red-500 animate-pulse" : "bg-gray-500"
      )} />
      {isRecording ? "Recording..." : "Ready"}
    </div>
  );
};