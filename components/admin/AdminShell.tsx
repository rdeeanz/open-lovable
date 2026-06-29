import Link from "next/link";
import { ReactNode } from "react";
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeModeToggle from "@/components/theme/ThemeModeToggle";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/settings", label: "Pengaturan Website", exact: false },
  { href: "/admin/users", label: "Kelola User", exact: false },
];

export default function AdminShell({
  children,
  activePath,
  adminName,
}: {
  children: ReactNode;
  activePath: string;
  adminName: string;
}) {
  return (
    <div className="min-h-screen bg-background-base">
      <header className="border-b border-border-faint bg-white">
        <div className="max-w-[1200px] mx-auto px-16 py-12 flex items-center justify-between">
          <HeaderBrandKit />
          <div className="flex items-center gap-12">
            <ThemeModeToggle />
            <span className="text-body-small text-black-alpha-64 hidden sm:inline">
              {adminName}
            </span>
            <Link href="/" className="text-label-small text-heat-100 hover:underline">
              Beranda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-16 py-24 grid lg:grid-cols-[220px_1fr] gap-24">
        <aside className="bg-white rounded-20 border border-border-faint p-12 h-fit">
          <p className="text-label-small text-black-alpha-48 px-12 py-8">Admin Panel</p>
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = item.exact
                ? activePath === item.href
                : activePath.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-10 px-12 py-10 text-label-medium transition-colors ${
                    isActive
                      ? "bg-heat-4 text-heat-100 border border-heat-20"
                      : "text-black-alpha-64 hover:bg-black-alpha-4"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
