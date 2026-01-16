"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Home, LayoutDashboard, BarChart3, Activity, LogIn, LogOut, User } from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMe } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = useMemo(() => getSupabaseBrowserClientOrNull(), []);

    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const showNav = pathname !== "/login";

    useEffect(() => {
        if (!showNav) return;
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
    }, [showNav, supabase]);

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

    if (!showNav) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-6 h-full">
                    <Link href="/" className="flex items-center space-x-2 h-full">
                        <span className="font-bold inline-block">FraudEx</span>
                    </Link>
                    <NavigationMenu className="hidden md:flex h-full">
                        <NavigationMenuList className="h-full">
                            <NavigationMenuItem className="h-full flex items-center">
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/" className="flex items-center">
                                        <Home className="mr-2 h-4 w-4" />
                                        Home
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="h-full flex items-center">
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/dashboard" className="flex items-center">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Command Center
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="h-full flex items-center">
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/analytics" className="flex items-center">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Pattern Intelligence
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="h-full flex items-center">
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/health" className="flex items-center">
                                        <Activity className="mr-2 h-4 w-4" />
                                        System Health
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex items-center gap-4">
                    <TooltipProvider>
                        {!isSupabaseConfigured ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/">Configure Supabase</Link>
                            </Button>
                        ) : email ? (
                            <DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                                                <User className="h-5 w-5" />
                                                <span className="sr-only">Toggle user menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>Account</TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none truncate" title={email}>
                                                {email}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                Role: {role || "—"}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Link>
                            </Button>
                        )}
                    </TooltipProvider>
                </div>
            </div>
        </header>
    );
}
