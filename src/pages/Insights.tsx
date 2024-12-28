import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { CategoryStats } from "@/components/insights/CategoryStats";
import { UserStats } from "@/components/insights/UserStats";
import { AIControls } from "@/components/insights/AIControls";

export const Insights = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-gray-500">Track your progress and achievements.</p>
      </header>
      
      <AIControls />
      <CategoryStats />
      <UserStats />
      
      <div className="col-span-full">
        <AchievementsSection />
      </div>
    </div>
  );
};