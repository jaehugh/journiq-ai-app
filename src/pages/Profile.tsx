import { Button } from "@/components/ui/button";
import { UserHeader } from "@/components/profile/UserHeader";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { SubscriptionPlans } from "@/components/profile/SubscriptionPlans";
import { useProfile } from "@/hooks/use-profile";
import { MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";

export const Profile = () => {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <UserHeader profile={profile} />
      <ProfileActions />
      <SubscriptionPlans />
      
      <div className="mt-6">
        <Link to="/live-chat">
          <Button className="w-full flex items-center gap-2">
            <MessageSquareText className="w-4 h-4" />
            Live Chat Support
          </Button>
        </Link>
      </div>
    </div>
  );
};