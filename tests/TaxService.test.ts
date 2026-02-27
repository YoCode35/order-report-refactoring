import { TaxService } from '../src/services/TaxService';

describe('TaxService', () => {
  it('should compute 20% tax', () => {
    const service = new TaxService();
    expect(service.compute(100)).toBe(20);
  });
});