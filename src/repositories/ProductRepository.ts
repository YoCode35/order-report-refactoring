import { Product } from '../domain/Product';
import { CsvReader } from '../infrastructure/CsvReader';

export class ProductRepository {
  constructor(private reader: CsvReader) {}

  load(path: string): Record<string, Product> {
    const rows = this.reader.read(path);
    const products: Record<string, Product> = {};

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];

      try {
        products[r[0]] = {
          id: r[0],
          name: r[1],
          category: r[2],
          price: parseFloat(r[3]),
          weight: parseFloat(r[4] || '1.0'),
          taxable: r[5] === 'true'
        };
      } catch {
        continue; // on garde le comportement legacy
      }
    }

    return products;
  }
}