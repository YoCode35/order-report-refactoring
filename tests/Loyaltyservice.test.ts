import { LoyaltyService } from '../src/services/LoyaltyService';
import { Order } from '../src/domain/Order';

describe('LoyaltyService', () => {
  const service = new LoyaltyService();

  const makeOrder = (customerId: string, qty: number, unitPrice: number): Order => ({
    id: 'O001',
    customerId,
    productId: 'P001',
    qty,
    unitPrice,
    date: '2025-01-15',
    promoCode: '',
    time: '14:00',
  });

  it('should compute points as qty * unitPrice * 0.01', () => {
    const orders = [makeOrder('C001', 2, 100)];
    const points = service.computePoints(orders);
    expect(points['C001']).toBeCloseTo(2); // 2 * 100 * 0.01
  });

  it('should accumulate points across multiple orders for the same customer', () => {
    const orders = [
      makeOrder('C001', 2, 100),
      makeOrder('C001', 5, 50),
    ];
    const points = service.computePoints(orders);
    expect(points['C001']).toBeCloseTo(4.5); // (2*100 + 5*50) * 0.01
  });

  it('should compute points separately for different customers', () => {
    const orders = [
      makeOrder('C001', 2, 100),
      makeOrder('C002', 3, 200),
    ];
    const points = service.computePoints(orders);
    expect(points['C001']).toBeCloseTo(2);
    expect(points['C002']).toBeCloseTo(6);
  });

  it('should return 0 points for an order with qty 0', () => {
    const orders = [makeOrder('C001', 0, 100)];
    const points = service.computePoints(orders);
    expect(points['C001']).toBe(0);
  });

  it('should return empty record for empty orders list', () => {
    const points = service.computePoints([]);
    expect(points).toEqual({});
  });
});