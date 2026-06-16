"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCachedUser } from "@/lib/auth";
import Loading from "@/app/loading";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/sign-in");
      return;
    }

    const user = getCachedUser();
    if (user?.role !== "SUPER_ADMIN") {
      router.push("/errors/forbidden");
      return;
    }

    setAuthorized(true);
    setIsChecking(false);
  }, [router]);

  if (isChecking || !authorized) {
    return <Loading />;
  }

  return <>{children}</>;
}
