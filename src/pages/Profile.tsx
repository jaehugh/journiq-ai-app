import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTier } from "@/components/profile/SubscriptionTier";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { UserHeader } from "@/components/profile/UserHeader";
import { SubscriptionPlans } from "@/components/profile/SubscriptionPlans";
import { useProfile } from "@/hooks/use-profile";

export const Profile = () => {
  const { toast } = useToast();
  const { subscription, isLoading, handleUpgrade, handleLogout } = useProfile();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-gray-500">Manage your account and subscription.</p>
      </header>
      
      <Card className="p-6">
        <UserHeader 
          email={subscription?.email}
          tier={subscription?.tier}
          isLoading={isLoading}
        />

        <div className="space-y-6">
          <SubscriptionPlans 
            currentTier={subscription?.tier}
            onUpgrade={handleUpgrade}
          />
          <ProfileActions 
            onLogout={handleLogout}
            currentTier={subscription?.tier}
          />
        </div>
      </Card>
    </div>
  );
};