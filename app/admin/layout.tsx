import { redirect } from "next/navigation";
import { requireAdminSession } from '@/lib/admin/require-admin';
import { HeaderProvider } from '@/components/shared/header/HeaderContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  if (!session) redirect('/login?next=/admin');
  return <HeaderProvider>{children}</HeaderProvider>;
}
