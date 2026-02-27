import { Promotion } from '../../domain/Promotion';

export function parsePromotions(csv: string): Promotion[] {
    const lines = csv.split('\n').filter(l => l.trim());
    return lines.slice(1).map(line => {
        const parts = line.split(',');
        return {
            code: parts[0],
            type: parts[1], // 'PERCENTAGE' | 'FIXED'
            value: parts[2],
            active: parts[3] !== 'false',
        } as Promotion;
    });
}