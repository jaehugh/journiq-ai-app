import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};