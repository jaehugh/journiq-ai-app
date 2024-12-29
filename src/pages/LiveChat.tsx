import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WEBHOOK_URL = 'https://hook.us1.make.com/koi27k4abowqtr82dgvngk7o26ii6wm6';

export const LiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat service');
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('Invalid response format from chat service');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Live Chat Support</h1>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col h-[600px]">
          <ChatMessages messages={messages} />
          <ChatInput 
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={handleSubmit}
          />
        </div>
      </Card>
    </div>
  );
};