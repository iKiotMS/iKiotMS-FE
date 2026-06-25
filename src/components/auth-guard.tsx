"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Loading from "@/app/loading";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const authStatus = isAuthenticated();
    if (!authStatus) {
      router.push("/sign-in");
    } else {
      // Fetch latest profile from backend on mount (e.g. F5 refresh)
      fetchMe()
        .then(() => {
          setAuthenticated(true);
          setIsChecking(false);
        })
        .catch((err) => {
          console.error("AuthGuard user fetch error:", err);
          setAuthenticated(true);
          setIsChecking(false);
        });
    }
  }, [router, fetchMe]);

  if (isChecking || !authenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}
