import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { HeaderProvider } from "@/components/shared/header/HeaderContext";
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import HeaderWrapper from "@/components/shared/header/Wrapper/Wrapper";
import HeaderDropdownWrapper from "@/components/shared/header/Dropdown/Wrapper/Wrapper";
import { Connector } from "@/components/shared/layout/curvy-rect";
import ButtonUI from "@/components/ui/shadcn/button";
import LogoutButton from "@/components/auth/LogoutButton";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export default async function MemberPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login?next=/member");
  }

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
              <div className="flex items-center gap-8">
                <Link href="/" className="contents">
                  <ButtonUI variant="tertiary">Beranda</ButtonUI>
                </Link>
                <LogoutButton />
              </div>
            </div>
          </HeaderWrapper>
        </div>

        <main className="cmw-container px-16 py-48">
          <div className="max-w-[720px] mx-auto">
            <div className="bg-white rounded-20 border border-border-faint p-28 shadow-sm mb-24">
              <p className="text-label-small text-heat-100 mb-8">Member Area</p>
              <h1 className="text-title-h3 text-accent-black mb-12">
                Halo, {session.name}
              </h1>
              <p className="text-body-medium text-black-alpha-64">
                Anda login sebagai <span className="text-accent-black">{session.email}</span>.
              </p>
            </div>

            <div className="grid gap-16 md:grid-cols-2">
              <div className="bg-white rounded-20 border border-border-faint p-24">
                <h2 className="text-title-h5 text-accent-black mb-8">Buat Website</h2>
                <p className="text-body-small text-black-alpha-64 mb-16">
                  Mulai clone atau buat website baru dengan AI.
                </p>
                <Link href="/" className="contents">
                  <ButtonUI variant="primary">Ke Beranda</ButtonUI>
                </Link>
              </div>

              <div className="bg-white rounded-20 border border-border-faint p-24">
                <h2 className="text-title-h5 text-accent-black mb-8">Generation</h2>
                <p className="text-body-small text-black-alpha-64 mb-16">
                  Lanjutkan sesi pembuatan website Anda.
                </p>
                <Link href="/generation" className="contents">
                  <ButtonUI variant="secondary">Buka Generation</ButtonUI>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </HeaderProvider>
  );
}
