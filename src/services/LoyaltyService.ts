import { Order } from '../domain/Order';

const LOYALTY_RATIO = 0.01;

export class LoyaltyService {
  computePoints(orders: Order[]): Record<string, number> {
    const points: Record<string, number> = {};

    for (const o of orders) {
      if (!points[o.customerId]) {
        points[o.customerId] = 0;
      }

      points[o.customerId] += o.qty * o.unitPrice * LOYALTY_RATIO;
    }

    return points;
  }
}