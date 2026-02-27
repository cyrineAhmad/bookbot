import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    email: string | null;
    role: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (user) authService.getProfile().then(setProfile);
  }, [user]);

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email || "User";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const role = profile?.role ?? "member";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>

        {/* User Info */}
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <div className="flex items-center gap-4 mb-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Role</span>
              </div>
              <p className="text-sm font-semibold text-secondary-foreground capitalize">{role}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Account</span>
              </div>
              <p className="text-sm font-semibold text-secondary-foreground">Google SSO</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;