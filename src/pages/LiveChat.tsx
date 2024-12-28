import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";

export const LiveChat = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Live Chat Support</h1>
      </div>
      
      <Card className="p-6">
        <div className="min-h-[600px] w-full">
          {/* ManyChat widget will be injected here */}
          <div id="manychat-widget" className="w-full h-full"></div>
        </div>
      </Card>
    </div>
  );
};