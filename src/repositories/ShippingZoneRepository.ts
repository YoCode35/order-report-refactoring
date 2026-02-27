import { ShippingZone } from '../domain/ShippingZone';
import { CsvReader } from '../infrastructure/CsvReader';

export class ShippingZoneRepository {
  constructor(private reader: CsvReader) {}

  load(path: string): Record<string, ShippingZone> {
    const rows = this.reader.read(path);
    const zones: Record<string, ShippingZone> = {};

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];

      zones[r[0]] = {
        zone: r[0],
        base: parseFloat(r[1]),
        perKg: parseFloat(r[2] || '0.5')
      };
    }

    return zones;
  }
}