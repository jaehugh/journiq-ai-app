interface UserHeaderProps {
  email?: string;
  tier?: string;
  isLoading: boolean;
}

export const UserHeader = ({ email, tier, isLoading }: UserHeaderProps) => {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-2xl text-gray-500">
          {email?.[0]?.toUpperCase() || "J"}
        </span>
      </div>
      <div>
        <h2 className="text-xl font-semibold">
          {email || "Loading..."}
        </h2>
        <p className="text-sm text-gray-500 capitalize">
          {isLoading ? "Loading..." : `${tier || "basic"} Plan`}
        </p>
      </div>
    </div>
  );
};