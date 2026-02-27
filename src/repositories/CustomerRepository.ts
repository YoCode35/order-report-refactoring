import { Customer } from '../domain/Customer';
import { CsvReader } from '../infrastructure/CsvReader';

export class CustomerRepository {
  constructor(private reader: CsvReader) { }

  load(path: string): Record<string, Customer> {
    const rows = this.reader.read(path);
    const customers: Record<string, Customer> = {};

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      customers[r[0]] = {
        id: r[0],
        name: r[1],
        level: (r[2] || 'BASIC') as any,
        shippingZone: r[3] || 'ZONE1',
        currency: r[4] || 'EUR',
        country: r[5] || 'FR'
      };
    }

    return customers;
  }
}