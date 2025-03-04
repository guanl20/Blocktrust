import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  History,
  LogOut,
  User
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">BlockTrust</h1>
        </div>
        
        <nav className="px-4 py-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
              <LayoutDashboard size={20} />
              Dashboard
            </Button>
          </Link>
          <Link href="/tracking">
            <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
              <Package size={20} />
              Product Tracking
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} />
            <div>
              <p className="font-medium text-sm">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
