import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const CustomCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Error",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
    toast({
      title: "Success",
      description: "Category removed successfully",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Custom Categories</h1>
      <Card className="p-6">
        <div className="flex space-x-4 mb-6">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category"
            className="max-w-xs"
          />
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span>{category}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCategory(category)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};