interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground ml-4'
            : 'bg-muted mr-4'
        }`}
      >
        {content}
      </div>
    </div>
  );
};