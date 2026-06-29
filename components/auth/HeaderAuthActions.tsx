"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ButtonUI from "@/components/ui/shadcn/button";
import type { UserRole } from "@/lib/auth/types";

interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

export default function HeaderAuthActions() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setUser(data.user);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
    router.push("/");
  };

  if (loading) {
    return <div className="w-[72px] h-[32px]" aria-hidden="true" />;
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-8">
        {user.role === "admin" && (
          <Link href="/admin" className="contents">
            <ButtonUI variant="primary" className="!px-8 !py-6 text-label-small sm:text-label-medium">Admin</ButtonUI>
          </Link>
        )}
        <Link href="/member" className="contents">
          <ButtonUI variant="secondary" className="!px-8 !py-6 text-label-small sm:text-label-medium">Member</ButtonUI>
        </Link>
        <ButtonUI variant="tertiary" className="!px-8 !py-6 text-label-small sm:text-label-medium" onClick={handleLogout}>
          <span className="hidden xs:inline">Keluar</span>
          <span className="xs:hidden">Out</span>
        </ButtonUI>
      </div>
    );
  }

  return (
    <Link href="/login" className="contents">
      <ButtonUI variant="secondary" className="!px-8 !py-6 text-label-small sm:text-label-medium">Masuk</ButtonUI>
    </Link>
  );
}
