import { OrderEditForm } from "@/components/orders/OrderEditForm";

export default async function EditOrderPage({
  params,
}: PageProps<"/orders/[id]/edit">) {
  const { id } = await params;
  return <OrderEditForm id={id} />;
}
