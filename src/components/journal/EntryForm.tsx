import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Personal",
  "Business",
  "Goals",
  "Reflection",
  "Ideas",
  "Learning",
  "Other"
];

interface EntryFormProps {
  title: string;
  content: string;
  category: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export const EntryForm = ({
  title,
  content,
  category,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onCancel,
  onSave,
  onDelete,
  isLoading,
}: EntryFormProps) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Input
          placeholder="Entry title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="cursor-pointer">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Write your entry..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px]"
        />
      </div>
      <div className="flex justify-between">
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading}
        >
          Delete Entry
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};