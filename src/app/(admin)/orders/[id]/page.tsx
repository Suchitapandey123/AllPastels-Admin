import { OrderDetails } from "@/components/orders/OrderDetails";

export default async function OrderPage({
  params,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return <OrderDetails id={id} />;
}
