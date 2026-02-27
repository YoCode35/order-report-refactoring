export interface Order {
  subtotal(subtotal: any, level: string): unknown;
  id: string;
  customerId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  date: string;
  promoCode: string;
  time: string;
}