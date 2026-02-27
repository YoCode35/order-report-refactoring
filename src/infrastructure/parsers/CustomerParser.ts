import { Customer } from '../../domain/Customer';

export function parseCustomers(csv: string): Customer[] {
  const lines = csv.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      id: parts[0],
      name: parts[1],
      level: parts[2] || 'BASIC',
      shippingZone: parts[3] || 'ZONE1',
      currency: parts[4] || 'EUR',
    } as Customer;
  });
}