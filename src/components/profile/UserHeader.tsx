import { useProfileData } from "@/hooks/use-profile-data";

interface UserHeaderProps {
  email?: string;
  tier?: string;
  isLoading: boolean;
}

export const UserHeader = ({ email, tier, isLoading }: UserHeaderProps) => {
  const { profile } = useProfileData();

  return (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl text-gray-500">
            {email?.[0]?.toUpperCase() || "J"}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold">
          {profile?.display_name || email || "Loading..."}
        </h2>
        <p className="text-sm text-gray-500 capitalize">
          {isLoading ? "Loading..." : `${tier || "basic"} Plan`}
        </p>
      </div>
    </div>
  );
};