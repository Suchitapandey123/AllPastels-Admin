import { apiFetch } from "@/lib/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  sizes: string[];
  isActive: boolean;
  /** SEO copy. Empty string means the storefront uses its generated defaults. */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  /** Alt text for the product's images on the storefront. */
  imageAlt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  sizes: string[];
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  imageAlt: string;
}

const WRITE_PATH = "/api/products";

export function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>(WRITE_PATH);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>(WRITE_PATH, {
    method: "POST",
    body: input,
  });
}

export function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  return apiFetch<Product>(`${WRITE_PATH}/${id}`, {
    method: "PUT",
    body: input,
  });
}

export interface DeleteResult {
  id: string;
  isActive: boolean;
}

export function deleteProduct(id: string): Promise<DeleteResult> {
  return apiFetch<DeleteResult>(`${WRITE_PATH}/${id}`, { method: "DELETE" });
}
