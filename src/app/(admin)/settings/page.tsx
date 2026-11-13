import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutSettingsForm } from "@/components/settings/CheckoutSettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage the shipping and tax rules the backend applies to every new checkout."
      />
      <CheckoutSettingsForm />
    </>
  );
}
