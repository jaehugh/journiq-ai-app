import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const PrivacySettings = () => {
  const [shareData, setShareData] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const { toast } = useToast();

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'shareData':
        setShareData(value);
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'activityTracking':
        setActivityTracking(value);
        break;
    }

    toast({
      title: "Settings Updated",
      description: "Your privacy settings have been saved",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Privacy Settings</h1>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Share Usage Data</Label>
              <p className="text-sm text-gray-500">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <Switch
              checked={shareData}
              onCheckedChange={(checked) => handleSettingChange('shareData', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive updates and notifications via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Activity Tracking</Label>
              <p className="text-sm text-gray-500">
                Track your journal writing patterns and habits
              </p>
            </div>
            <Switch
              checked={activityTracking}
              onCheckedChange={(checked) => handleSettingChange('activityTracking', checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};