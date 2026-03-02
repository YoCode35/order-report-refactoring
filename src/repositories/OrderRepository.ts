import { Order } from '../domain/Order';
import { CsvReader } from '../infrastructure/CsvReader';

export class OrderRepository {
  constructor(private reader: CsvReader) {}

  load(path: string): Order[] {
    const rows = this.reader.read(path);
    const orders: Order[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];

      try {
        orders.push({
          id: r[0],
          customerId: r[1],
          productId: r[2],
          qty: parseInt(r[3]),
          unitPrice: parseFloat(r[4]),
          date: r[5],
          promoCode: r[6] || '',
          time: r[7] || '12:00',
        });
      } catch {
        continue;
      }
    }

    return orders;
  }
}