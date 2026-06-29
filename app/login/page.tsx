"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeaderProvider } from "@/components/shared/header/HeaderContext";
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import HeaderWrapper from "@/components/shared/header/Wrapper/Wrapper";
import HeaderDropdownWrapper from "@/components/shared/header/Dropdown/Wrapper/Wrapper";
import { Connector } from "@/components/shared/layout/curvy-rect";
import ButtonUI from "@/components/ui/shadcn/button";
import Input from "@/components/ui/shadcn/input";

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/member");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/member");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login gagal");
        return;
      }

      toast.success(`Selamat datang, ${data.user.name}!`);
      const fallback = data.user.role === "admin" ? "/admin" : "/member";
      router.push(nextPath === "/member" ? fallback : nextPath);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-background-base">
        <HeaderDropdownWrapper />

        <div className="sticky top-0 left-0 w-full z-[101] bg-background-base header">
          <div className="absolute top-0 cmw-container border-x border-border-faint h-full pointer-events-none" />
          <div className="h-1 bg-border-faint w-full left-0 -bottom-1 absolute" />
          <div className="cmw-container absolute h-full pointer-events-none top-0">
            <Connector className="absolute -left-[10.5px] -bottom-11" />
            <Connector className="absolute -right-[10.5px] -bottom-11" />
          </div>

          <HeaderWrapper>
            <div className="max-w-[900px] mx-auto w-full flex justify-between items-center">
              <HeaderBrandKit />
              <Link href="/" className="contents">
                <ButtonUI variant="tertiary">Beranda</ButtonUI>
              </Link>
            </div>
          </HeaderWrapper>
        </div>

        <main className="cmw-container px-16 py-48">
          <div className="max-w-[420px] mx-auto">
            <div className="bg-white rounded-20 border border-border-faint p-28 shadow-sm">
              <h1 className="text-title-h4 text-accent-black mb-8">Masuk</h1>
              <p className="text-body-medium text-black-alpha-64 mb-24">
                Login untuk mengakses halaman member dan fitur eksklusif.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-16">
                <div>
                  <label htmlFor="email" className="text-label-small text-black-alpha-64 mb-8 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-label-small text-black-alpha-64 mb-8 block">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <ButtonUI
                  type="submit"
                  variant="primary"
                  className="w-full mt-8"
                  isLoading={isLoading}
                  loadingLabel="Memproses..."
                >
                  Masuk
                </ButtonUI>
              </form>
            </div>
          </div>
        </main>
      </div>
    </HeaderProvider>
  );
}
