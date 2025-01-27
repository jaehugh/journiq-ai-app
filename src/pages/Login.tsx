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
    // Enhanced URL and error logging
    const currentUrl = window.location.origin;
    console.log("Current application URL:", currentUrl);
    console.log("Current pathname:", window.location.pathname);
    
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Error",
            description: `Authentication error: ${error.message}`,
            variant: "destructive",
          });
          return;
        }
        if (session) {
          console.log("User already has a session, redirecting to home");
          navigate("/");
        }
      } catch (err) {
        console.error("Unexpected session check error:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    };

    checkUser();

    // Enhanced auth state change handling with detailed error logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      console.log("Session state:", session ? "Active" : "None");
      console.log("Current URL:", window.location.href);
      
      if (event === 'SIGNED_IN') {
        console.log("Sign in successful, preparing redirect...");
        // Extended delay to ensure database operations complete
        setTimeout(() => {
          console.log("Executing redirect after successful sign in");
          navigate("/");
          toast({
            title: "Welcome",
            description: "You have been signed in successfully",
          });
        }, 3000); // Increased delay to 3 seconds
      }
      if (event === 'SIGNED_OUT') {
        console.log("Sign out detected");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
      }
      if (event === 'USER_UPDATED') {
        console.log("User profile updated:", session?.user?.id);
      }
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery initiated");
      }

      // Handle any auth errors
      if (event === 'SIGNED_IN' && !session) {
        console.error("Sign in event without session");
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive",
        });
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
              }
            }}
            providers={[]}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Your password",
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign in",
                  loading_button_label: "Signing in ...",
                },
                sign_up: {
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Create a password",
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up ...",
                },
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};