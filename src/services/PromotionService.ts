import { Order } from '../domain/Order';
import { Product } from '../domain/Product';
import { Promotion } from '../domain/Promotion';

export class PromotionService {
  applyLinePromotion(
    order: Order,
    product: Product | undefined,
    promotions: Record<string, Promotion>
  ): { lineTotal: number; morningBonus: number } {
    const basePrice =
      product?.price !== undefined ? product.price : order.unitPrice;

    let discountRate = 0;
    let fixedDiscount = 0;

    const promoCode = order.promoCode;

    if (promoCode && promotions[promoCode]) {
      const promo = promotions[promoCode];

      if (promo.active) {
        if (promo.type === 'PERCENTAGE') {
          discountRate = parseFloat(promo.value) / 100;
        } else if (promo.type === 'FIXED') {
          fixedDiscount = parseFloat(promo.value); // bug conservé
        }
      }
    }

    let lineTotal =
      order.qty * basePrice * (1 - discountRate) -
      fixedDiscount * order.qty;

    // Morning bonus (règle cachée)
    const hour = parseInt(order.time.split(':')[0]);
    let morningBonus = 0;

    if (hour < 10) {
      morningBonus = lineTotal * 0.03;
      lineTotal -= morningBonus;
    }

    return { lineTotal, morningBonus };
  }
}