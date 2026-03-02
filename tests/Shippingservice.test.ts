import { ShippingService } from '../src/services/ShippingService';

describe('ShippingService', () => {
  const csvContent = `zone,base,per_kg
ZONE1,5.00,0.50
ZONE2,7.50,0.60
ZONE3,10.00,0.80
ZONE4,12.50,1.00`;

  const service = new ShippingService(csvContent);

  describe('computeUnderLimit (subtotal < 50)', () => {
    it('should return base price for weight <= 5kg', () => {
      expect(service.computeUnderLimit('ZONE1', 3)).toBe(5.0);
    });

    it('should apply intermediate tier for weight between 5 and 10kg', () => {
      // base + (weight - 5) * 0.3
      expect(service.computeUnderLimit('ZONE1', 7)).toBeCloseTo(5.6); // 5 + 2 * 0.3
    });

    it('should apply per_kg rate for weight > 10kg', () => {
      // base + (weight - 10) * per_kg
      expect(service.computeUnderLimit('ZONE1', 12)).toBeCloseTo(6.0); // 5 + 2 * 0.5
    });

    it('should apply 1.2x surcharge for ZONE3', () => {
      const base = service.computeUnderLimit('ZONE3', 3); // base only = 10.00
      expect(base).toBeCloseTo(12.0); // 10 * 1.2
    });

    it('should apply 1.2x surcharge for ZONE4', () => {
      const base = service.computeUnderLimit('ZONE4', 3); // base only = 12.50
      expect(base).toBeCloseTo(15.0); // 12.5 * 1.2
    });

    it('should not apply surcharge for ZONE1 or ZONE2', () => {
      expect(service.computeUnderLimit('ZONE1', 3)).toBe(5.0);
      expect(service.computeUnderLimit('ZONE2', 3)).toBe(7.5);
    });

    it('should use default zone if zone is unknown', () => {
      // fallback: base=5.0, perKg=0.5
      expect(service.computeUnderLimit('UNKNOWN', 3)).toBe(5.0);
    });
  });
});