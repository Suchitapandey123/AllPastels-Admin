export interface CheckoutShippingSettings {
  flatRate: number;
  freeShippingThreshold: number | null;
}

export interface CheckoutTaxSettings {
  ratePercent: number;
}

export interface CheckoutSettings {
  shipping: CheckoutShippingSettings;
  tax: CheckoutTaxSettings;
}
