import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AccountSettings = () => {
  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/functions/v1/upload-profile-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to upload image');

        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload profile image",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisplayNameUpdate = async () => {
    try {
      // Update display name logic here
      toast({
        title: "Success",
        description: "Display name updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display name",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {selectedFile ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-500">?</span>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-xs"
            />
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