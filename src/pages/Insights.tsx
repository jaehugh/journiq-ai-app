import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";

interface Achievement {
  id: string;
  badge_type: string;
  achieved_at: string;
}

export const Insights = () => {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*");
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  const badges = [
    {
      title: "1 Week Streak",
      description: "Journaled consistently for a week",
      image: "/lovable-uploads/2adcfbc9-fb51-4ae8-b9d9-b727f1037d03.png",
      type: "week_streak"
    },
    {
      title: "30 Day Streak",
      description: "Maintained journaling for a month",
      image: "/lovable-uploads/88606a61-8adf-42da-889a-84f186580808.png",
      type: "month_streak"
    },
    {
      title: "6 Month Dedication",
      description: "Half a year of consistent journaling",
      image: "/lovable-uploads/05421753-9ae2-4a42-8e73-6855ebcaaefc.png",
      type: "six_month_streak"
    },
    {
      title: "Journal Master",
      description: "One year of journaling excellence",
      image: "/lovable-uploads/90056f35-f70e-450e-82f0-b8785240e462.png",
      type: "year_streak"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
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
        
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((badge) => {
                const isAchieved = achievements?.some(
                  (achievement) => achievement.badge_type === badge.type
                );
                
                return (
                  <div
                    key={badge.type}
                    className={`flex flex-col items-center text-center space-y-2 ${
                      !isAchieved ? "opacity-40" : ""
                    }`}
                  >
                    <img
                      src={badge.image}
                      alt={badge.title}
                      className="w-24 h-24 object-contain"
                    />
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{badge.title}</h3>
                      {isAchieved && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};