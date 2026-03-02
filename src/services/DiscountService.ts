import { CustomerLevel } from '../domain/Customer';

export class DiscountService {
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