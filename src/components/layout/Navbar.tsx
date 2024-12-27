import { Link } from "react-router-dom";
import { Home, Search, PlusCircle, LineChart, User } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:relative md:top-0 md:left-0 md:h-screen md:w-20 md:border-r md:border-t-0">
      <div className="flex justify-around items-center h-16 md:h-full md:flex-col md:justify-start md:pt-8 md:gap-8">
        <Link
          to="/"
          className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1 md:text-[10px]">Home</span>
        </Link>
        <Link
          to="/insights"
          className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
        >
          <LineChart className="w-6 h-6" />
          <span className="text-xs mt-1 md:text-[10px]">Insights</span>
        </Link>
        <Link
          to="/new"
          className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs mt-1 md:text-[10px]">New</span>
        </Link>
        <Link
          to="/search"
          className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1 md:text-[10px]">Search</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1 md:text-[10px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
};