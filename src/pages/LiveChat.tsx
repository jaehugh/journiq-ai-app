import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
};

export const LiveChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const createTestUser = async () => {
    try {
      console.log("Creating test user...");
      const { data, error } = await supabase.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
      });

      if (error) throw error;

      console.log("Test user created:", data);
      toast({
        title: "Test User Created",
        description: "Check the job_logs table and email function logs for the welcome email trigger.",
      });
    } catch (error) {
      console.error("Error creating test user:", error);
      toast({
        title: "Error",
        description: "Failed to create test user. Check console for details.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const channel = supabase.channel('chat');

    channel
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message]);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: crypto.randomUUID(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    try {
      await supabase.channel('chat').send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={createTestUser}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Create Test User
        </button>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Live Chat</h2>
            <span className={`px-2 py-1 rounded text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <ScrollArea className="h-[400px] mb-4 p-4 border rounded-md">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 p-2 rounded ${
                  message.sender === 'user'
                    ? 'bg-blue-100 ml-auto'
                    : 'bg-gray-100'
                } max-w-[80%]`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};