import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SetupRequired() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup required</CardTitle>
        <CardDescription>Supabase environment variables are missing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div>
          Create <span className="font-mono text-xs">frontend/.env.local</span> using
          <span className="font-mono text-xs"> frontend/.env.local.example</span> and set:
        </div>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</span>
          </li>
          <li>
            <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          </li>
        </ul>
        <Button variant="outline" asChild>
          <Link href="/">Back to overview</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
