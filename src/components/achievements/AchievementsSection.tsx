import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AchievementBadge } from "./AchievementBadge";

interface Achievement {
  id: string;
  badge_type: string;
  achieved_at: string;
}

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

export const AchievementsSection = () => {
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

  return (
    <Card>
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
              <AchievementBadge
                key={badge.type}
                title={badge.title}
                description={badge.description}
                image={badge.image}
                isAchieved={!!isAchieved}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};