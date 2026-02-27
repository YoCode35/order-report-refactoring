import { CustomerLevel } from '../domain/Customer';
import { Order } from '../domain/Order';

export class DiscountService {
applyVolumeDiscount(order: Order, amount: number): number {
  if (order.qty > 10) return amount * 0.9;
  if (order.qty > 5) return amount * 0.95;
  return amount;
}
  compute(subtotal: number, level: CustomerLevel): number {
    if (subtotal > 1000 && level === 'PREMIUM') {
      return subtotal * 0.2;
    }

    if (subtotal > 500) return subtotal * 0.15;
    if (subtotal > 100) return subtotal * 0.1;
    if (subtotal > 50) return subtotal * 0.05;

    return 0;
  }
}