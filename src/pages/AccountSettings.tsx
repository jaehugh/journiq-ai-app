import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfileData } from "@/hooks/use-profile-data";

export const AccountSettings = () => {
  const { profile, updateProfile } = useProfileData();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
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
    </div>
  );
};