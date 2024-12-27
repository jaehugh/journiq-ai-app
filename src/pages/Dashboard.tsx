import { Card } from "@/components/ui/card";

export const Dashboard = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your journal.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Goals</h2>
          <p className="text-sm text-gray-500">Set and track your personal and business goals.</p>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Insights</h2>
          <p className="text-sm text-gray-500">AI-powered analysis of your journal entries.</p>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Entries</h2>
          <p className="text-sm text-gray-500">Your latest journal entries.</p>
        </Card>
      </div>
    </div>
  );
};