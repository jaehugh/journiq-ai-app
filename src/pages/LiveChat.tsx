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
        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <h2 className="text-xl font-semibold">Coming Soon!</h2>
          <p className="text-gray-600 max-w-md">
            We are working hard to introduce our live chat feature. For now, please reach out to us at{" "}
            <a 
              href="mailto:support@journiqapp.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support@journiqapp.com
            </a>
            {" "}for support.
          </p>
        </div>
      </Card>
    </div>
  );
};