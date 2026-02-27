import * as fs from 'fs';
import * as path from 'path';

interface ShippingZone {
  base: number;
  perKg: number;
}

export class ShippingService {
  private readonly zones: Record<string, ShippingZone> = {};

  constructor(csvContent?: string) {
    const content =
      csvContent ??
      fs.readFileSync(path.join(process.cwd(), 'data', 'shipping_zones.csv'), 'utf-8');
    this.parse(content);
  }

  private parse(csv: string): void {
    const lines = csv.trim().split('\n').filter(l => l.trim()).slice(1);
    for (const line of lines) {
      const [zone, base, perKg] = line.split(',');
      this.zones[zone.trim()] = {
        base: parseFloat(base),
        perKg: parseFloat(perKg ?? '0.5'),
      };
    }
  }

  /**
   * Calcul shipping quand sub < SHIPPING_LIMIT (logique legacy complexe).
   * Appelé uniquement si le sous-total est < 50.
   */
  computeUnderLimit(zone: string, weight: number): number {
    const z = this.zones[zone] ?? { base: 5.0, perKg: 0.5 };
    let ship: number;

    if (weight > 10) {
      ship = z.base + (weight - 10) * z.perKg;
    } else if (weight > 5) {
      ship = z.base + (weight - 5) * 0.3;
    } else {
      ship = z.base;
    }

    // Majoration zones éloignées
    if (zone === 'ZONE3' || zone === 'ZONE4') {
      ship = ship * 1.2;
    }

    return ship;
  }
}