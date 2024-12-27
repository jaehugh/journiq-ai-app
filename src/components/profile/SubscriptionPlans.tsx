import { SubscriptionTier } from "./SubscriptionTier";

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
    monthlyPriceId: "price_1QWk3ZAC3xzW6CxUVB0cNsPH",
    yearlyPriceId: "price_1Qaks1AC3xzW6CxUylLcvd6O",
  },
} as const;

interface SubscriptionPlansProps {
  currentTier?: string;
  onUpgrade: (priceId: string) => void;
}

export const SubscriptionPlans = ({ currentTier, onUpgrade }: SubscriptionPlansProps) => {
  // If user is on pro tier, don't show any subscription options
  if (currentTier === 'pro') {
    return (
      <div className="text-center p-6">
        <h3 className="text-xl font-semibold mb-2">Pro Subscription Active</h3>
        <p className="text-gray-500">You're enjoying all premium features!</p>
      </div>
    );
  }

  // If user is on plus tier, only show pro tier
  if (currentTier === 'plus') {
    return (
      <div className="max-w-md mx-auto">
        <SubscriptionTier
          tier="pro"
          details={TIER_DETAILS.pro}
          currentTier={currentTier}
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  // Show all tiers for basic users
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {(Object.entries(TIER_DETAILS) as [keyof typeof TIER_DETAILS, typeof TIER_DETAILS[keyof typeof TIER_DETAILS]][]).map(([tier, details]) => (
        <SubscriptionTier
          key={tier}
          tier={tier}
          details={details}
          currentTier={currentTier}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
};