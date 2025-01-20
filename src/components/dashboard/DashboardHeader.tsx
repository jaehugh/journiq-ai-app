import { useProfileData } from "@/hooks/use-profile-data";

export const DashboardHeader = () => {
  const { profile } = useProfileData();

  return (
    <header className="space-y-1">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-gray-500">
        Welcome back to your journal{profile?.display_name ? `, ${profile.display_name}` : ''}!
      </p>
    </header>
  );
};