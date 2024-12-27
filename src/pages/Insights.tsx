import { Card } from "@/components/ui/card";

export const Insights = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-gray-500">Track your progress and achievements.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">All Entries</h2>
          <p className="text-sm text-gray-500">Browse your entries by category.</p>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <p className="text-sm text-gray-500">Track your journaling journey.</p>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Achievements</h2>
          <p className="text-sm text-gray-500">View your earned badges and streaks.</p>
        </Card>
      </div>
    </div>
  );
};