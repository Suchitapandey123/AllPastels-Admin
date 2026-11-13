"use client";

import { useCallback, useEffect, useState } from "react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import type { DashboardStat } from "@/components/dashboard/SummaryCards";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import type {
  SalesSeriesPoint,
  CategoryShare,
} from "@/components/dashboard/SalesOverview";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import type { RecentOrderRow } from "@/components/dashboard/OrdersTable";
import { AlertIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { listOrders, toBadge } from "@/lib/orders";
import type { AdminOrder } from "@/lib/orders";
import { listProducts } from "@/lib/products";
import type { Product } from "@/lib/products";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const LOW_STOCK_THRESHOLD = 10;
const NEW_PRODUCT_WINDOW_DAYS = 30;
const RECENT_ORDER_COUNT = 7;

function countsAsRevenue(order: AdminOrder): boolean {
  return order.status !== "cancelled";
}

function percentDelta(current: number, previous: number): string | undefined {
  if (previous === 0) {
    return current > 0 ? "New" : undefined;
  }
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function countDelta(current: number, previous: number): string {
  const diff = current - previous;
  return `${diff >= 0 ? "+" : ""}${diff.toLocaleString("en-IN")} orders`;
}

function inRange(createdAt: string, from: number, to: number): boolean {
  const at = new Date(createdAt).getTime();
  return at >= from && at < to;
}

function buildSeries(orders: AdminOrder[]): SalesSeriesPoint[] {
  const sold = orders.filter(countsAsRevenue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: SalesSeriesPoint[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const start = new Date(today.getTime() - offset * DAY_MS);
    const end = new Date(start.getTime() + DAY_MS);
    series.push({
      label: start.toLocaleDateString("en-IN", { weekday: "short" }),
      value: sold.reduce((sum, order) => {
        return inRange(order.createdAt, start.getTime(), end.getTime())
          ? sum + order.total
          : sum;
      }, 0),
    });
  }
  return series;
}

function buildCategoryShares(orders: AdminOrder[]): CategoryShare[] {
  const byCategory = new Map<string, number>();
  let revenue = 0;
  for (const order of orders.filter(countsAsRevenue)) {
    for (const item of order.items) {
      const amount = item.priceAtPurchase * item.qty;
      if (amount <= 0) continue;
      const category = item.product?.category?.trim() || "Other";
      byCategory.set(category, (byCategory.get(category) ?? 0) + amount);
      revenue += amount;
    }
  }
  if (revenue === 0) return [];
  return [...byCategory.entries()]
    .map(([label, amount]) => ({
      label,
      share: Math.round((amount / revenue) * 100),
    }))
    .sort((a, b) => b.share - a.share);
}

function buildStats(
  orders: AdminOrder[],
  products: Product[],
): DashboardStat[] {
  const now = Date.now();
  const sold = orders.filter(countsAsRevenue);
  const revenue = sold.reduce((sum, order) => sum + order.total, 0);

  const revenueThisWeek = sold.reduce(
    (sum, order) =>
      inRange(order.createdAt, now - WEEK_MS, now) ? sum + order.total : sum,
    0,
  );
  const revenuePrevWeek = sold.reduce(
    (sum, order) =>
      inRange(order.createdAt, now - 2 * WEEK_MS, now - WEEK_MS)
        ? sum + order.total
        : sum,
    0,
  );
  const ordersThisWeek = orders.filter((order) =>
    inRange(order.createdAt, now - WEEK_MS, now),
  ).length;
  const ordersPrevWeek = orders.filter((order) =>
    inRange(order.createdAt, now - 2 * WEEK_MS, now - WEEK_MS),
  ).length;

  const lowStock = products.filter(
    (product) => product.stock < LOW_STOCK_THRESHOLD,
  ).length;
  const newProducts = products.filter((product) =>
    inRange(
      product.createdAt,
      now - NEW_PRODUCT_WINDOW_DAYS * DAY_MS,
      now + DAY_MS,
    ),
  ).length;

  return [
    {
      label: "Total Revenue",
      value: formatINR(revenue),
      delta: percentDelta(revenueThisWeek, revenuePrevWeek),
      up: revenueThisWeek >= revenuePrevWeek,
      note: "vs previous 7 days",
    },
    {
      label: "Orders",
      value: orders.length.toLocaleString("en-IN"),
      delta: countDelta(ordersThisWeek, ordersPrevWeek),
      up: ordersThisWeek >= ordersPrevWeek,
      note: "vs previous 7 days",
    },
    {
      label: "Active Products",
      value: products.length.toLocaleString("en-IN"),
      delta: newProducts > 0 ? `+${newProducts}` : undefined,
      up: true,
      note: lowStock > 0 ? `${lowStock} need restocking` : undefined,
    },
    {
      label: "Low Stock Items",
      value: lowStock.toLocaleString("en-IN"),
      note: `of ${products.length.toLocaleString("en-IN")} active products`,
    },
  ];
}

function toRecentOrderRow(order: AdminOrder): RecentOrderRow {
  const customer = order.shippingAddress?.fullName?.trim();
  return {
    id: order.orderNumber,
    customer: customer || "Guest",
    detail: order.shippingAddress
      ? [
          order.shippingAddress.city,
          order.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", ")
      : undefined,
    items: order.items.reduce((sum, item) => sum + item.qty, 0),
    total: order.total,
    status: toBadge(order.status),
    date: formatDate(order.createdAt),
  };
}

export function DashboardClient() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [orderData, productData] = await Promise.all([
        listOrders(),
        listProducts(),
      ]);
      setOrders(orderData);
      setProducts(productData);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading && (orders === null || products === null)) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-sm border border-line bg-floral-700 px-5 py-4"
            >
              <div className="h-3 w-24 animate-pulse rounded-sm bg-line" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded-sm bg-line" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded-sm bg-line" />
            </div>
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-sm border border-line bg-floral-700" />
      </div>
    );
  }

  if (loadError && (orders === null || products === null)) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <AlertIcon className="h-6 w-6 text-powder-400" />
          <p className="text-sm" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const series = orders !== null && products !== null ? buildSeries(orders) : [];
  const categories =
    orders !== null && products !== null ? buildCategoryShares(orders) : [];
  const stats =
    orders !== null && products !== null ? buildStats(orders, products) : [];
  const recent =
    orders !== null && products !== null
      ? orders.slice(0, RECENT_ORDER_COUNT).map(toRecentOrderRow)
      : [];

  return (
    <div className="flex flex-col gap-4">
      <SummaryCards stats={stats} />
      <SalesOverview series={series} categories={categories} />
      <OrdersTable
        title="Recent Orders"
        subtitle="Latest 7 orders across the store"
        orders={recent}
        footerUrl="/orders"
      />
    </div>
  );
}
