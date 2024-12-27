import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Lock, MessageSquare, Tag, LogOut } from "lucide-react";

export const Profile = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-gray-500">Manage your account and preferences.</p>
      </header>
      
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">J</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-sm text-gray-500">Free Plan</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Tag className="w-4 h-4 mr-2" />
            Custom Categories
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            Live Support
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};