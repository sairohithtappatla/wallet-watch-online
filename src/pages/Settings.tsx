
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFormSubmit } from "@/hooks/use-form-submit";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProfileData {
  first_name: string;
  last_name: string;
}

interface PreferencesData {
  currency: string;
  darkMode: boolean;
  notifications: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
  });
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<PreferencesData>({
    currency: "USD",
    darkMode: false,
    notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  // Fetch user profile and preferences from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load your profile data.",
          });
          return;
        }
        
        if (profile) {
          setProfileData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
          });
        }
        
        // Set email from auth
        setEmail(user.email || "");
        
        // We would fetch preferences from a separate table if available
        // For now using default values
        
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while loading your data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);

  // Handler for updating personal information
  const { handleSubmit: handleProfileSubmit, isSubmitting: isProfileSubmitting } = useFormSubmit(
    async (data: ProfileData) => {
      if (!user) throw new Error("User not authenticated");
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      return { success: true };
    },
    {
      successMessage: "Your personal information has been updated successfully.",
      errorMessage: "Failed to update your personal information.",
    }
  );

  // Handler for updating preferences
  const { handleSubmit: handlePreferencesSubmit, isSubmitting: isPreferencesSubmitting } = useFormSubmit(
    async (data: PreferencesData) => {
      // In a real app, preferences would be saved to the database
      // For now, just updating state
      setPreferences(data);
      return { success: true };
    },
    {
      successMessage: "Your preferences have been updated successfully.",
      errorMessage: "Failed to update your preferences.",
    }
  );

  // Handler for changing password
  const { handleSubmit: handlePasswordSubmit, isSubmitting: isPasswordSubmitting } = useFormSubmit(
    async () => {
      if (!user) throw new Error("User not authenticated");
      if (!currentPassword) throw new Error("Current password is required");
      if (!newPassword) throw new Error("New password is required");
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      return { success: true };
    },
    {
      successMessage: "Your password has been changed successfully.",
      errorMessage: "Failed to change your password. Please check your current password.",
    }
  );

  const savePersonalInfo = () => {
    handleProfileSubmit(profileData);
  };

  const savePreferences = () => {
    handlePreferencesSubmit(preferences);
  };

  const changePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "New password and confirmation do not match.",
      });
      return;
    }
    
    handlePasswordSubmit();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your account details and personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={savePersonalInfo} disabled={isProfileSubmitting}>
              {isProfileSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your application experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => setPreferences({...preferences, currency: value})}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme.
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={preferences.darkMode}
                onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your transactions and reminders.
                </p>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notifications}
                onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={savePreferences} disabled={isPreferencesSubmitting}>
              {isPreferencesSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={changePassword} 
              disabled={isPasswordSubmitting || !currentPassword || !newPassword || !confirmPassword}
            >
              {isPasswordSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
