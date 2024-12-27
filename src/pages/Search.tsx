import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export const Search = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-gray-500">Find your past entries and insights.</p>
      </header>
      
      <Card className="p-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search your entries..."
            className="pl-10"
          />
        </div>
      </Card>
    </div>
  );
};