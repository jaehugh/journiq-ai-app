import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";

export const NewEntry = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
        <p className="text-gray-500">Write or record your thoughts.</p>
      </header>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="outline">Generate Prompt</Button>
            <Button variant="outline">
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
          </div>
          
          <Textarea
            placeholder="Start writing your journal entry..."
            className="min-h-[300px]"
          />
          
          <div className="flex justify-end">
            <Button>Save Entry</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};