import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { AuthError, Session, AuthChangeEvent } from "@supabase/supabase-js";

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event);
        
        switch (event) {
          case 'SIGNED_UP':
            console.log("User signed up successfully");
            toast({
              title: "Success",
              description: "Account created successfully!",
            });
            break;
          case 'SIGNED_IN':
            console.log("User signed in successfully");
            break;
          case 'USER_DELETED':
            console.log("User deleted");
            break;
          case 'USER_UPDATED':
            console.log("User updated");
            break;
        }

        if (session) {
          navigate("/");
        }
      }
    );

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
          />
        </div>
      </div>
    </div>
  );
};