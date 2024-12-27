import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

export const PremiumTag = ({ tier }: { tier: "plus" | "pro" }) => {
  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800 gap-1">
      <Crown className="w-3 h-3" />
      {tier === "plus" ? "Plus" : "Pro"} Feature
    </Badge>
  );
};