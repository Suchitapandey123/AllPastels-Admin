import { listOrders } from "@/lib/services/orders.service";
import { listProducts } from "@/lib/services/products.service";
import type { AdminOrder } from "@/lib/types/order";
import type { Product } from "@/lib/types/product";

export interface DashboardData {
  orders: AdminOrder[];
  products: Product[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [orders, products] = await Promise.all([
    listOrders(),
    listProducts(),
  ]);
  return { orders, products };
}
