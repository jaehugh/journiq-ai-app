import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const PrivacySettings = () => {
  const { toast } = useToast();

  const handlePrivacyToggle = () => {
    toast({
      title: "Settings Updated",
      description: "Your privacy settings have been updated",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Settings</h1>
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="public-profile">Public Profile</Label>
            <p className="text-sm text-gray-500">
              Allow others to see your profile information
            </p>
          </div>
          <Switch id="public-profile" onCheckedChange={handlePrivacyToggle} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="share-entries">Share Entries</Label>
            <p className="text-sm text-gray-500">
              Allow sharing of your journal entries
            </p>
          </div>
          <Switch id="share-entries" onCheckedChange={handlePrivacyToggle} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="data-collection">Data Collection</Label>
            <p className="text-sm text-gray-500">
              Allow us to collect usage data to improve your experience
            </p>
          </div>
          <Switch id="data-collection" onCheckedChange={handlePrivacyToggle} />
        </div>
      </Card>
    </div>
  );
};