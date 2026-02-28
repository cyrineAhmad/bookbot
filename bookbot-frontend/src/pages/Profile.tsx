import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";
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

        <div className="rounded-xl border bg-card p-6 card-shadow space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Name</span>
              </div>
              <p className="text-base font-semibold text-foreground">{displayName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Email</span>
              </div>
              <p className="text-base font-semibold text-foreground">{displayEmail}</p>
            </div>
          </div>
        </div>

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