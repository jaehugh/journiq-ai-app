import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Lock, MessageSquare, Tag, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TIER_DETAILS = {
  basic: {
    name: "Basic",
    price: "Free",
    features: ["Basic journaling", "Basic search", "Basic categories"],
  },
  plus: {
    name: "Plus",
    price: "$12.99/month",
    yearlyPrice: "$129.99/year",
    features: ["Voice input", "Custom categories", "AI search"],
    monthlyPriceId: "price_1QTtXhAC3xzW6CxUVB0cNsPH",
    yearlyPriceId: "price_1Qakt3AC3xzW6CxUTdBs9SE6",
  },
  pro: {
    name: "Pro",
    price: "$24.99/month",
    yearlyPrice: "$249.99/year",
    features: ["AI-generated goals", "Live support", "Export data", "All Plus features"],
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
      const response = await fetch("/functions/v1/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (error) {
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
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {subscription?.email?.[0]?.toUpperCase() || "J"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {subscription?.email || "Loading..."}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {isLoading ? "Loading..." : `${subscription?.tier || "basic"} Plan`}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {(Object.entries(TIER_DETAILS) as [keyof typeof TIER_DETAILS, typeof TIER_DETAILS[keyof typeof TIER_DETAILS]][]).map(([tier, details]) => (
              <Card key={tier} className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">{details.name}</h3>
                <p className="text-2xl font-bold">{details.price}</p>
                {'yearlyPrice' in details && (
                  <p className="text-sm text-gray-500">or {details.yearlyPrice}</p>
                )}
                <ul className="space-y-2">
                  {details.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                {tier !== "basic" && subscription?.tier !== tier && (
                  <div className="space-y-2">
                    {'monthlyPriceId' in details && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(details.monthlyPriceId)}
                      >
                        Upgrade Monthly
                      </Button>
                    )}
                    {'yearlyPriceId' in details && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpgrade(details.yearlyPriceId)}
                      >
                        Upgrade Yearly
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
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
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};