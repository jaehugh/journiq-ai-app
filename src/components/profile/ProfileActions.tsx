import { Button } from "@/components/ui/button";
import { Settings, Lock, MessageSquare, Tag, LogOut } from "lucide-react";
import { PremiumTag } from "@/components/ui/premium-tag";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileActionsProps {
  onLogout: () => void;
  currentTier?: string;
}

export const ProfileActions = ({ onLogout, currentTier }: ProfileActionsProps) => {
  const isBasic = currentTier === 'basic';
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCustomCategories = () => {
    if (isBasic) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Plus or Pro to access custom categories",
        variant: "default",
      });
      return;
    }
    navigate("/new"); // Navigate to new entry page where custom categories are available
  };

  const handleLiveSupport = () => {
    if (currentTier !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to access live support",
        variant: "default",
      });
      return;
    }
    // Implement live support logic for pro users
    toast({
      title: "Live Support",
      description: "Connecting to support...",
      variant: "default",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Account Settings",
      description: "Opening account settings...",
      variant: "default",
    });
  };

  const handlePrivacy = () => {
    toast({
      title: "Privacy Settings",
      description: "Opening privacy settings...",
      variant: "default",
    });
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={handleSettings}
      >
        <Settings className="w-4 h-4 mr-2" />
        Account Settings
      </Button>
      <div className="relative">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleCustomCategories}
        >
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
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleLiveSupport}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Live Support
        </Button>
        {currentTier !== 'pro' && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <PremiumTag tier="pro" />
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={handlePrivacy}
      >
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