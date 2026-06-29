"use client";

import { useRouter } from "next/navigation";
import ButtonUI from "@/components/ui/shadcn/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <ButtonUI variant="tertiary" onClick={handleLogout}>
      Keluar
    </ButtonUI>
  );
}
