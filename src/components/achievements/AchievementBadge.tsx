import { CheckCircle } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description: string;
  image: string;
  isAchieved: boolean;
}

export const AchievementBadge = ({
  title,
  description,
  image,
  isAchieved,
}: AchievementBadgeProps) => {
  return (
    <div
      className={`flex flex-col items-center text-center space-y-2 ${
        !isAchieved ? "opacity-40" : ""
      }`}
    >
      <img
        src={image}
        alt={title}
        className="w-24 h-24 object-contain"
      />
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">{title}</h3>
        {isAchieved && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};