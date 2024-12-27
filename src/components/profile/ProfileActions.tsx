import { Button } from "@/components/ui/button";
import { Settings, Lock, MessageSquare, Tag, LogOut } from "lucide-react";

interface ProfileActionsProps {
  onLogout: () => void;
}

export const ProfileActions = ({ onLogout }: ProfileActionsProps) => {
  return (
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
      <Button
        variant="outline"
        className="w-full justify-start text-red-500 hover:text-red-600"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};