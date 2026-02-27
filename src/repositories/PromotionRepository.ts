import { Promotion } from '../domain/Promotion';
import { CsvReader } from '../infrastructure/CsvReader';

export class PromotionRepository {
  constructor(private reader: CsvReader) {}

  load(path: string): Record<string, Promotion> {
    const promotions: Record<string, Promotion> = {};

    try {
      const rows = this.reader.read(path);

      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];

        promotions[r[0]] = {
          code: r[0],
          type: r[1] as any,
          value: r[2],
          active: r[3] !== 'false'
        };
      }
    } catch {
      // legacy : ignore si fichier absent
    }

    return promotions;
  }
}