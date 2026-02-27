export class TaxService {
  private readonly TAX_RATE = 0.2;

  // Méthode pour les tests
  compute(amount: number): number {
    return Math.round(amount * this.TAX_RATE * 100) / 100;
  }

  // Méthode pour le moteur
  applyTax(country: string, amount: number): number {
    const rate = country === 'EUR' ? this.TAX_RATE : 0;
    return Math.round(amount * (1 + rate) * 100) / 100;
  }
}