import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const syncAllUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-all-users');
      
      if (error) {
        console.error('Error syncing users:', error);
        toast({
          title: "Error",
          description: "Failed to sync users. Check console for details.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to Journiq</h1>
        <p className="text-xl text-gray-600 mb-8">Your AI-powered journaling companion</p>
        
        <div className="space-y-4">
          <Button 
            onClick={syncAllUsers}
            className="w-full md:w-auto"
          >
            Sync All Users
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;