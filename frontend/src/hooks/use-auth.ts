"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/config";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token || null;
      
      if (!accessToken) {
        router.push("/login");
        return;
      }
      
      if (cancelled) return;
      setToken(accessToken);
      setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { token, loading, isConfigured: isSupabaseConfigured };
}
