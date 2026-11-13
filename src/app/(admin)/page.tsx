import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick look at how the store is performing today."
        action={
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
          >
            <PlusIcon className="h-4 w-4" />
            New product
          </Link>
        }
      />
      <DashboardClient />
    </>
  );
}
