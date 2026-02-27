import { Product } from '../../domain/Product';

export function parseProducts(csv: string): Product[] {
  const lines = csv.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      id: parts[0],
      name: parts[1],
      category: parts[2],
      price: parseFloat(parts[3]),
      weight: parseFloat(parts[4] || '1.0'),
      taxable: parts[5] === 'true',
    } as Product;
  });
}