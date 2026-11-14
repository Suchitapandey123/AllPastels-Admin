import { apiGet, apiPut } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import type { CheckoutSettings } from "@/lib/types/settings";

export function getCheckoutSettings(): Promise<CheckoutSettings> {
  return apiGet<CheckoutSettings>(ENDPOINTS.settings.checkout);
}

export function updateCheckoutSettings(
  input: Partial<CheckoutSettings>,
): Promise<CheckoutSettings> {
  return apiPut<CheckoutSettings>(ENDPOINTS.settings.checkout, input);
}
