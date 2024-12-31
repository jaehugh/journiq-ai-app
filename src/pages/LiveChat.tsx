import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No access token available');

      const response = await supabase.functions.invoke('chat', {
        body: { message },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'OpenAI-Beta': 'assistants=v2'
        },
      });

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message || 'Failed to get response from chat');
      }

      if (!response.data) {
        throw new Error('No data received from chat function');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.message 
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