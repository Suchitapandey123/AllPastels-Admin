import { AuthGate } from "@/components/auth/AuthGate";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
