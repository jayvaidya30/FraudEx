"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, FileSearch, LayoutDashboard, LogOut, Search, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getMe } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard", label: "My queue", icon: FileSearch },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClientOrNull(), []);

  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const hideShell = pathname === "/login" || pathname === "/";

  useEffect(() => {
    if (hideShell) return;
    const client = supabase;
    if (!client) return;

    let cancelled = false;

    async function load() {
      if (!client) return;
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const me = await getMe(token);
        if (cancelled) return;
        setEmail(me.email);
        setRole(me.role);
      } catch {
        // ignore
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hideShell, supabase]);

  async function onSignOut() {
    if (!supabase) {
      toast.error("Supabase is not configured");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out");
    router.push("/login");
  }

  if (hideShell) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-muted/20 p-4 lg:flex">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
              FX
            </div>
            FraudEx
          </div>

          <Separator className="my-4" />

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-md border bg-background p-3 text-xs text-muted-foreground">
              System status: normal
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard#upload">
                <UploadCloud className="mr-2 h-4 w-4" />
                New upload
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/40 lg:hidden">
                  FX
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search cases, vendors, or case IDs" className="pl-9" />
                </div>
              </div>

              {!isSupabaseConfigured ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Configure Supabase</Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {email || "Account"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="text-sm font-medium">{email || "Signed in"}</div>
                      <div className="text-xs text-muted-foreground">Role: {role || "—"}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/analytics")}>Analytics</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
