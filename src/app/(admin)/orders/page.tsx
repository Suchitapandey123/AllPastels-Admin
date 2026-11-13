import type { Metadata } from "next";
import { OrdersTablePage } from "@/components/orders/OrdersTablePage";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersTablePage />;
}
