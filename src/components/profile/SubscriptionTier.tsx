import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TierDetails = {
  name: string;
  price: string;
  features: readonly string[];
  yearlyPrice?: string;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
};

interface SubscriptionTierProps {
  tier: string;
  details: TierDetails;
  currentTier?: string;
  onUpgrade: (priceId: string) => void;
}

export const SubscriptionTier = ({
  tier,
  details,
  currentTier,
  onUpgrade,
}: SubscriptionTierProps) => {
  return (
    <Card className="p-6 space-y-4">
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
      {tier !== "basic" && currentTier !== tier && (
        <div className="space-y-2">
          {'monthlyPriceId' in details && (
            <Button
              className="w-full"
              onClick={() => onUpgrade(details.monthlyPriceId!)}
            >
              Upgrade Monthly
            </Button>
          )}
          {'yearlyPriceId' in details && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onUpgrade(details.yearlyPriceId!)}
            >
              Upgrade Yearly
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};