export type CustomerLevel = 'BASIC' | 'PREMIUM';

export interface Customer {
  country: string;
  id: string;
  name: string;
  level: CustomerLevel;
  shippingZone: string;
  currency: string;
}