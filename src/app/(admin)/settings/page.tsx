import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutSettingsForm } from "@/components/settings/CheckoutSettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Checkout settings served live from the backend API."
      />
      <CheckoutSettingsForm />
    </>
  );
}
