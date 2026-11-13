"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ConfirmDeleteDialog } from "@/components/products/ConfirmDeleteDialog";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  AlertIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/icons";
import { formatINR } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import { hasAdminSession, logoutAdmin } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type Product,
  type ProductInput,
} from "@/lib/products";

type Notice = { tone: "success" | "error"; message: string };

function stockBadge(stock: number): string {
  if (stock === 0) return "Out of stock";
  if (stock < 10) return "Low stock";
  return "In stock";
}

export function ProductsClient() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dialog, setDialog] = useState<"create" | Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [session, setSession] = useState<"checking" | "guest" | "authed">(
    "checking",
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    try {
      const data = await listProducts();
      setProducts(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load products",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const authed = await hasAdminSession();
      if (!cancelled) {
        setSession(authed ? "authed" : "guest");
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  function handleLoggedIn() {
    setSession("authed");
    clearNotice();
    load();
  }

  async function handleLogout() {
    await logoutAdmin();
    setSession("guest");
    setDialog(null);
    setDeleting(null);
  }

  function handleSessionExpired() {
    setSession("guest");
    setNotice({
      tone: "error",
      message: "Your session expired. Please log in again.",
    });
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(clearNotice, 5000);
    return () => clearTimeout(timer);
  }, [notice, clearNotice]);

  async function handleSave(
    input: ProductInput,
    existing: Product | null,
  ) {
    try {
      if (existing) {
        await updateProduct(existing._id, input);
        setNotice({
          tone: "success",
          message: `${input.name} was updated.`,
        });
      } else {
        const created = await createProduct(input);
        setNotice({
          tone: "success",
          message: `${created.name} was added to the catalog.`,
        });
      }
      setDialog(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleSessionExpired();
      }
      throw err instanceof Error
        ? err
        : new Error("Something went wrong while saving");
    }
  }

  async function handleDelete(product: Product) {
    setDeleteBusy(true);
    try {
      await deleteProduct(product._id);
      setNotice({
        tone: "success",
        message: `${product.name} was removed from the storefront.`,
      });
      setDeleting(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleSessionExpired();
        setNotice({
          tone: "error",
          message: "Your session expired. Please log in again.",
        });
      } else {
        setNotice({
          tone: "error",
          message:
            err instanceof Error ? err.message : "Failed to delete product",
        });
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  const loggedIn = session === "authed";

  function sessionNotice() {
    if (!notice) return null;
    return (
      <p
        role="alert"
        className={`flex items-start gap-2 rounded-sm px-4 py-3 text-sm ${
          notice.tone === "success"
            ? "bg-ash-800 text-ash-200"
            : "bg-powder-800 text-powder-200"
        }`}
      >
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
        {notice.message}
      </p>
    );
  }

  if (session === "guest") {
    return (
      <>
        <PageHeader
          title="Products"
          description="Log in with an admin account to manage the live catalog."
        />
        {sessionNotice() ? (
          <div className="mb-4">{sessionNotice()}</div>
        ) : null}
        <Card>
          <LoginForm onLoggedIn={handleLoggedIn} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Live catalog data served by the backend API."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                clearNotice();
                load();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface disabled:opacity-60"
            >
              <RefreshIcon
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setDialog("create")}
              disabled={!loggedIn}
              title={
                loggedIn ? undefined : "Log in to add products"
              }
              className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
            >
              <PlusIcon className="h-4 w-4" />
              Add product
            </button>
          </div>
        }
      />

      {sessionNotice() ? (
        <div className="mb-4">{sessionNotice()}</div>
      ) : null}

      <Card>
        <CardHeader
          title="Catalog"
          subtitle={
            products === null ? "Loading…" : `${products.length} active products`
          }
          action={
            <div className="flex items-center gap-3">
              <span className="ap-eyebrow hidden whitespace-nowrap text-ash-300 sm:inline">
                Logged in
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-sm border border-line px-3 py-1.5 text-xs transition-colors hover:bg-surface"
              >
                Log out
              </button>
            </div>
          }
        />

        {loading && products === null ? (
          <div className="space-y-3 px-5 py-6" aria-busy="true">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-4 w-40 animate-pulse rounded-sm bg-line" />
                <div className="h-4 w-24 animate-pulse rounded-sm bg-line" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded-sm bg-line" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <AlertIcon className="h-6 w-6 text-powder-400" />
            <p className="text-sm" role="alert">
              {loadError}
            </p>
            <button
              type="button"
              onClick={load}
              className="rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
            >
              Retry
            </button>          </div>
        ) : products !== null && products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="font-display text-xl">No products yet</p>
            <p className="text-sm text-ash-200">
              Add your first product and it will appear on the storefront
              immediately.
            </p>
            <button
              type="button"
              onClick={() => setDialog("create")}
              className="rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
            >
              Add product
            </button>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th className="hidden md:table-cell">Sizes</Th>
                <Th align="right">Price</Th>
                <Th>Stock</Th>
                <Th className="hidden sm:table-cell">Updated</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody aria-busy={loading}>
              {products?.map((product) => (
                <tr
                  key={product._id}
                  className="transition-colors hover:bg-surface"
                >
                  <Td>
                    <span className="block font-medium">{product.name}</span>
                    <span className="block max-w-[16rem] truncate text-xs text-ash-200">
                      {product.description || product.images[0] || "—"}
                    </span>
                  </Td>
                  <Td className="text-ash-200">{product.category}</Td>
                  <Td className="hidden text-ash-200 md:table-cell">
                    {product.sizes.length > 0
                      ? product.sizes.join(", ")
                      : "—"}
                  </Td>
                  <Td className="text-right">{formatINR(product.price)}</Td>
                  <Td>
                    <Badge status={stockBadge(product.stock)} />
                  </Td>
                  <Td className="hidden whitespace-nowrap text-ash-200 sm:table-cell">
                    {formatDate(product.updatedAt)}
                  </Td>
                  <Td className="text-right">
                    <span className="inline-flex gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => setDialog(product)}
                        className="rounded-sm p-2 text-ash-300 hover:bg-floral-400 hover:text-ink"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">
                          Edit {product.name}
                        </span>
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setDeleting(product)}
                        className="rounded-sm p-2 text-ash-300 hover:bg-cotton-500 hover:text-cotton-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">
                          Delete {product.name}
                        </span>
                      </button>
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {dialog ? (
        <ProductDialog
          key={dialog === "create" ? "create" : dialog._id}
          product={dialog === "create" ? null : dialog}
          onClose={() => setDialog(null)}
          onSubmit={handleSave}
        />
      ) : null}

      <ConfirmDeleteDialog
        product={deleting}
        busy={deleteBusy}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting)}
      />
    </>
  );
}
