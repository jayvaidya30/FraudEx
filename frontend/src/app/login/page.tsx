"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSupabaseConfigured } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    [],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!supabase) {
      toast.error("Supabase is not configured. Set frontend/.env.local first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function signUp() {
    if (!supabase) {
      toast.error("Supabase is not configured. Set frontend/.env.local first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Account created. You can now sign in.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">FraudEx</h1>
            <p className="text-sm text-muted-foreground">
              Sign in for analyst access. FraudEx is a reviewer tool that surfaces risk indicators and explains why a
              document may need attention.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Human verification</CardTitle>
                <CardDescription>Always required.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                The system does not determine guilt or corruption.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Explainability</CardTitle>
                <CardDescription>Designed for review.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You get a score, top contributing factors, and recommendations.
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="w-full max-w-md justify-self-center">
          <CardHeader>
            <CardTitle>FraudEx</CardTitle>
            <CardDescription>
              Sign in to upload documents, run analysis, and view explainable risk indicators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-md border bg-muted p-3 text-muted-foreground">
                  Supabase is not configured. Create <span className="font-mono text-xs">frontend/.env.local</span> using
                  <span className="font-mono text-xs"> frontend/.env.local.example</span>.
                </div>
                <Button className="w-full" asChild>
                  <Link href="/">View setup instructions</Link>
                </Button>
              </div>
            ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <TabsContent value="signin" className="mt-0">
                  <Button className="w-full" onClick={signIn} disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <Button className="w-full" variant="secondary" onClick={signUp} disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
            )}

            <Separator className="my-6" />

            <div className="mt-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                ← Back to overview
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
