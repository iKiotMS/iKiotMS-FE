"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Loading from "@/app/loading";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = isAuthenticated();
    if (!authStatus) {
      router.push("/sign-in");
    } else {
      Promise.resolve().then(() => {
        setAuthenticated(true);
        setIsChecking(false);
      });
    }
  }, [router]);

  if (isChecking || !authenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}
