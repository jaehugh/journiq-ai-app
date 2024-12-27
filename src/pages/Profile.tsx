import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTier } from "@/components/profile/SubscriptionTier";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { UserHeader } from "@/components/profile/UserHeader";

const TIER_DETAILS = {
  basic: {
    name: "Basic",
    price: "Free",
    features: ["Basic journaling", "Basic search", "Basic categories"] as const,
  },
  plus: {
    name: "Plus",
    price: "$12.99/month",
    yearlyPrice: "$129.99/year",
    features: ["Voice input", "Custom categories", "AI search"] as const,
    monthlyPriceId: "price_1QTtXhAC3xzW6CxUVB0cNsPH",
    yearlyPriceId: "price_1Qakt3AC3xzW6CxUTdBs9SE6",
  },
  pro: {
    name: "Pro",
    price: "$24.99/month",
    yearlyPrice: "$249.99/year",
    features: ["AI-generated goals", "Live support", "Export data", "All Plus features"] as const,
    monthlyPriceId: "price_1QWk3ZAC3xzW6CxUplNxKSYf",
    yearlyPriceId: "price_1Qaks1AC3xzW6CxUylLcvd6O",
  },
} as const;

export const Profile = () => {
  const { toast } = useToast();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/functions/v1/check-subscription", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch subscription status");
      return response.json();
    },
  });

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
          <div className="grid gap-6 md:grid-cols-3">
            {(Object.entries(TIER_DETAILS) as [keyof typeof TIER_DETAILS, typeof TIER_DETAILS[keyof typeof TIER_DETAILS]][]).map(([tier, details]) => (
              <SubscriptionTier
                key={tier}
                tier={tier}
                details={details}
                currentTier={subscription?.tier}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>

          <ProfileActions onLogout={handleLogout} />
        </div>
      </Card>
    </div>
  );
};