import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error);
        toast({
          title: "Error",
          description: "Failed to check login status. Please try again.",
          variant: "destructive",
        });
        return;
      }
      if (session) {
        navigate("/");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_UP') {
        console.log("User signed up successfully");
      }
      if (event === 'SIGNED_IN') {
        console.log("User signed in successfully");
      }
      if (event === 'USER_DELETED') {
        console.log("User deleted");
      }
      if (event === 'USER_UPDATED') {
        console.log("User updated");
      }
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Journiq</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0f172a',
                    brandAccent: '#1e293b'
                  }
                }
              },
              className: {
                message: 'text-red-500 text-sm',
                container: 'flex flex-col gap-4'
              }
            }}
            providers={[]}
            onError={(error) => {
              console.error("Auth error:", error);
              toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};