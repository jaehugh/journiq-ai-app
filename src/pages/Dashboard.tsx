import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { CategoryStats } from "@/components/dashboard/CategoryStats";
import { TagsSection } from "@/components/dashboard/TagsSection";
import { RecentEntries } from "@/components/dashboard/RecentEntries";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <GoalsSection />
        <CategoryStats />
        <TagsSection />
        <RecentEntries />
      </div>
    </div>
  );
};