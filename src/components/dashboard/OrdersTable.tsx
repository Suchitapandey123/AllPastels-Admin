import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { formatINR } from "@/lib/utils/format";
import type { RecentOrderRow } from "@/lib/types/dashboard";

export function OrdersTable({
  title,
  subtitle,
  orders,
  footerUrl,
  footerLabel,
}: {
  title: string;
  subtitle?: string;
  orders: RecentOrderRow[];
  footerUrl?: string;
  footerLabel?: string;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          footerUrl ? (
            <Link
              href={footerUrl}
              className="shrink-0 rounded-sm border border-line px-3 py-1.5 text-sm transition-colors hover:border-burnt-500 hover:text-burnt-400"
            >
              {footerLabel ?? "View all"}
            </Link>
          ) : null
        }
      />
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <p className="font-display text-xl">No orders yet</p>
          <p className="text-sm text-ash-200">
            Orders placed on the storefront will appear here.
          </p>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th className="hidden sm:table-cell">Items</Th>
              <Th align="right">Total</Th>
              <Th className="hidden md:table-cell">Date</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-surface">
                <Td className="font-medium">{order.id}</Td>
                <Td>
                  <span className="block">{order.customer}</span>
                  {order.detail ? (
                    <span className="block text-xs text-ash-200">
                      {order.detail}
                    </span>
                  ) : null}
                </Td>
                <Td className="hidden text-ash-200 sm:table-cell">
                  {order.items}
                </Td>
                <Td className="text-right">{formatINR(order.total)}</Td>
                <Td className="hidden text-ash-200 md:table-cell">
                  {order.date}
                </Td>
                <Td className="text-right">
                  <Badge status={order.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
