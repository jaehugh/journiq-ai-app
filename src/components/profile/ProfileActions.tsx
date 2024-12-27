import { Button } from "@/components/ui/button";
import { Settings, Lock, MessageSquare, Tag, LogOut } from "lucide-react";
import { PremiumTag } from "@/components/ui/premium-tag";

interface ProfileActionsProps {
  onLogout: () => void;
  currentTier?: string;
}

export const ProfileActions = ({ onLogout, currentTier }: ProfileActionsProps) => {
  const isBasic = currentTier === 'basic';

  return (
    <div className="space-y-4">
      <Button variant="outline" className="w-full justify-start">
        <Settings className="w-4 h-4 mr-2" />
        Account Settings
      </Button>
      <div className="relative">
        <Button variant="outline" className="w-full justify-start">
          <Tag className="w-4 h-4 mr-2" />
          Custom Categories
        </Button>
        {isBasic && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <PremiumTag tier="plus" />
          </div>
        )}
      </div>
      <div className="relative">
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="w-4 h-4 mr-2" />
          Live Support
        </Button>
        {isBasic && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <PremiumTag tier="pro" />
          </div>
        )}
      </div>
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