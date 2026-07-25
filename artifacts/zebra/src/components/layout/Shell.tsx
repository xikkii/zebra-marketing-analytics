import { Link, useLocation } from "wouter";
import { Activity, LayoutDashboard, BrainCircuit, BarChart3, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { useUser, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/predict", label: "Predictor", icon: BrainCircuit },
    { href: "/insights", label: "Model Insights", icon: Activity },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-background text-foreground dark">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/50 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-background" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight uppercase">zebra</span>
        </div>

        <nav className="px-4 py-2 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom of sidebar */}
        {user && (
          <div className="hidden md:block border-t border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] text-xs font-mono font-bold">
                  {(user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {user.fullName ?? user.firstName ?? "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="button-sign-out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
