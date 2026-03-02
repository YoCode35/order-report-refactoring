import { PromotionService } from '../src/services/PromotionService';
import { Order } from '../src/domain/Order';
import { Product } from '../src/domain/Product';
import { Promotion } from '../src/domain/Promotion';

describe('PromotionService', () => {
  const service = new PromotionService();

  const baseOrder: Order = {
    id: 'O001',
    customerId: 'C001',
    productId: 'P001',
    qty: 2,
    unitPrice: 100,
    date: '2025-01-15',
    promoCode: '',
    time: '14:00',
  };

  const baseProduct: Product = {
    id: 'P001',
    name: 'Test Product',
    category: 'Electronics',
    price: 100,
    weight: 1.0,
    taxable: true,
  };

  const promotions: Record<string, Promotion> = {
    PROMO10: { code: 'PROMO10', type: 'PERCENTAGE', value: '10', active: true },
    FIXED20: { code: 'FIXED20', type: 'FIXED', value: '20', active: true },
    INACTIVE: { code: 'INACTIVE', type: 'PERCENTAGE', value: '50', active: false },
  };

  it('should return full line total when no promo code', () => {
    const { lineTotal, morningBonus } = service.applyLinePromotion(baseOrder, baseProduct, promotions);
    expect(lineTotal).toBe(200);
    expect(morningBonus).toBe(0);
  });

  it('should apply percentage promotion', () => {
    const order = { ...baseOrder, promoCode: 'PROMO10' };
    const { lineTotal } = service.applyLinePromotion(order, baseProduct, promotions);
    expect(lineTotal).toBe(180); // 2 * 100 * 0.90
  });

  it('should apply fixed discount per quantity (bug conservé)', () => {
    const order = { ...baseOrder, promoCode: 'FIXED20' };
    const { lineTotal } = service.applyLinePromotion(order, baseProduct, promotions);
    expect(lineTotal).toBe(160); // 2 * 100 - 20 * 2
  });

  it('should not apply inactive promotion', () => {
    const order = { ...baseOrder, promoCode: 'INACTIVE' };
    const { lineTotal } = service.applyLinePromotion(order, baseProduct, promotions);
    expect(lineTotal).toBe(200);
  });

  it('should apply morning bonus for orders before 10h', () => {
    const order = { ...baseOrder, time: '09:00' };
    const { lineTotal, morningBonus } = service.applyLinePromotion(order, baseProduct, promotions);
    expect(morningBonus).toBeCloseTo(6); // 200 * 0.03
    expect(lineTotal).toBeCloseTo(194); // 200 - 6
  });

  it('should not apply morning bonus at 10h or later', () => {
    const order = { ...baseOrder, time: '10:00' };
    const { morningBonus } = service.applyLinePromotion(order, baseProduct, promotions);
    expect(morningBonus).toBe(0);
  });

  it('should use product price over order unit price when product is defined', () => {
    const productWithDifferentPrice = { ...baseProduct, price: 150 };
    const { lineTotal } = service.applyLinePromotion(baseOrder, productWithDifferentPrice, promotions);
    expect(lineTotal).toBe(300); // 2 * 150
  });

  it('should fall back to order unit price when product is undefined', () => {
    const { lineTotal } = service.applyLinePromotion(baseOrder, undefined, promotions);
    expect(lineTotal).toBe(200); // 2 * 100 (unitPrice)
  });
});