import { Order } from '../../domain/Order';

export function parseOrders(csv: string): Order[] {
  const lines = csv.split('\n').filter(l => l.trim());
  const header = lines[0].split(',');

  return lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      id: parts[0],
      customerId: parts[1],
      productId: parts[2],
      qty: parseInt(parts[3], 10),
      unitPrice: parseFloat(parts[4]),
      date: parts[5],
      promoCode: parts[6] || '',
      time: parts[7] || '12:00',
    } as Order;
  });
}