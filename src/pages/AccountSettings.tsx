import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfileData } from "@/hooks/use-profile-data";
import { useProfile } from "@/hooks/use-profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export const AccountSettings = () => {
  const { profile, updateProfile } = useProfileData();
  const { subscription } = useProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No access token available');
        }

        const { data, error } = await supabase.functions.invoke('upload-profile-image', {
          body: formData,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        // Update profile with new avatar URL
        await updateProfile.mutateAsync({ avatarUrl: data.url });
        
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload profile image",
          variant: "destructive",
        });
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDisplayNameUpdate = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({ displayName: displayName.trim() });
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    if (subscription?.tier !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "Data export is only available for Pro users",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No access token available');

      const response = await supabase.functions.invoke('export-user-data', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'journiq-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No access token available');

      const response = await supabase.functions.invoke('cancel-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Your subscription has been cancelled",
      });
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );

      if (error) throw error;

      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {(selectedFile || profile?.avatar_url) ? (
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : profile?.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">?</span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="max-w-xs"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-gray-500">Uploading...</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Display Name</h2>
            <div className="flex space-x-4">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="max-w-xs"
              />
              <Button onClick={handleDisplayNameUpdate}>Update</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
              />
            </div>
            <div>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
              />
            </div>
            <div>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
              />
            </div>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Account Actions</h2>
          
          {subscription?.tier === 'pro' && (
            <>
              <div>
                <Button onClick={handleExportData} variant="outline">
                  Export Data
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Download all your journal entries and data
                </p>
              </div>
              <Separator />
            </>
          )}

          {(subscription?.tier === 'plus' || subscription?.tier === 'pro') && (
            <>
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-orange-600">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your subscription will be cancelled at the end of your current billing period.
                        You'll still have access to premium features until then.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-sm text-gray-500 mt-2">
                  Cancel your subscription at the end of the billing period
                </p>
              </div>
              <Separator />
            </>
          )}

          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-sm text-gray-500 mt-2">
              Permanently delete your account and all associated data
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
