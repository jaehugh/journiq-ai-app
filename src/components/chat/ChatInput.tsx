import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};