import { DiscountService } from '../src/services/DiscountService';

describe('DiscountService', () => {
  const service = new DiscountService();

  it('should apply 20% for premium > 1000', () => {
    expect(service.compute(1200, 'PREMIUM')).toBe(240);
  });

  it('should apply 15% for > 500', () => {
    expect(service.compute(600, 'BASIC')).toBe(90);
  });
});