import { apiFetch } from "@/lib/api";

export interface CheckoutShippingSettings {
  flatRate: number;
  freeShippingThreshold: number | null;
}

export interface CheckoutTaxSettings {
  ratePercent: number;
}

// Matches GET/PUT /api/settings/checkout on the backend: whole rupee/lakh
// amounts (shipping flat rate, free-shipping threshold) and a tax rate
// expressed in percent. PUT accepts partial {shipping?, tax?} bodies.
export interface CheckoutSettings {
  shipping: CheckoutShippingSettings;
  tax: CheckoutTaxSettings;
}

const WRITE_PATH = "/api/settings/checkout";

export function getCheckoutSettings(): Promise<CheckoutSettings> {
  return apiFetch<CheckoutSettings>(WRITE_PATH);
}

export function updateCheckoutSettings(
  input: Partial<CheckoutSettings>,
): Promise<CheckoutSettings> {
  return apiFetch<CheckoutSettings>(WRITE_PATH, {
    method: "PUT",
    body: input,
  });
}
