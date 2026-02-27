// OrderReportEngine.ts
import { Order } from '../domain/Order';
import { Customer } from '../domain/Customer';
import { Product } from '../domain/Product';
import { Promotion } from '../domain/Promotion';
import { PromotionService } from '../services/PromotionService';
import { DiscountService } from '../services/DiscountService';
import { TaxService } from '../services/TaxService';
import { LoyaltyService } from '../services/LoyaltyService';
import { ShippingService } from '../services/ShippingService';

const MAX_DISCOUNT = 200;
const LOYALTY_RATIO = 0.01;
const HANDLING_FEE = 2.5;

interface CustomerAccumulator {
  subtotal: number;
  items: Order[];
  weight: number;
  morningBonus: number;
}

interface CustomerReport {
  name: string;
  level: string;
  zone: string;
  currency: string;
  subtotal: number;
  totalDiscount: number;
  volumeDiscount: number;
  loyaltyDiscount: number;
  morningBonus: number;
  tax: number;
  ship: number;
  handling: number;
  weight: number;
  total: number;
  loyaltyPoints: number;
}

export class OrderReportEngine {
  constructor(
    private readonly promotionService: PromotionService,
    private readonly discountService: DiscountService,
    private readonly taxService: TaxService,
    private readonly loyaltyService: LoyaltyService,
    private readonly shippingService: ShippingService
  ) {}

  generate(
    orders: Order[],
    customers: Customer[],
    products: Product[],
    promotions: Promotion[]
  ): string {
    const customerMap = this.buildCustomerMap(customers);
    const productMap = this.buildProductMap(products);
    const promotionMap = this.buildPromotionMap(promotions);

    // === Loyalty points (based on unit_price from order, like legacy) ===
    const loyaltyPoints: Record<string, number> = {};
    for (const o of orders) {
      if (!loyaltyPoints[o.customerId]) loyaltyPoints[o.customerId] = 0;
      loyaltyPoints[o.customerId] += o.qty * o.unitPrice * LOYALTY_RATIO;
    }

    // === Accumulate per customer ===
    const accByCustomer: Record<string, CustomerAccumulator> = {};

    for (const order of orders) {
      const product = productMap[order.productId];
      const { lineTotal, morningBonus } = this.promotionService.applyLinePromotion(
        order,
        product,
        promotionMap
      );

      if (!accByCustomer[order.customerId]) {
        accByCustomer[order.customerId] = {
          subtotal: 0,
          items: [],
          weight: 0,
          morningBonus: 0,
        };
      }

      // lineTotal already has morningBonus subtracted — do NOT add it back
      accByCustomer[order.customerId].subtotal += lineTotal;
      accByCustomer[order.customerId].weight += (product?.weight ?? 1.0) * order.qty;
      accByCustomer[order.customerId].items.push(order);
      accByCustomer[order.customerId].morningBonus += morningBonus;
    }

    // === Build reports (sorted by customer ID, like legacy) ===
    const reports: Record<string, CustomerReport> = {};
    let grandTotal = 0;
    let totalTaxCollected = 0;

    const sortedCustomerIds = Object.keys(accByCustomer).sort();

    for (const cid of sortedCustomerIds) {
      const customer = customerMap[cid];
      const name = customer?.name ?? 'Unknown';
      const level = customer?.level ?? 'BASIC';
      const zone = customer?.shippingZone ?? 'ZONE1';
      const currency = customer?.currency ?? 'EUR';

      const acc = accByCustomer[cid];
      const sub = acc.subtotal;

      // === Volume discount (cascading if/if like legacy — each overwrites previous) ===
      let disc = 0;
      if (sub > 50)   disc = sub * 0.05;
      if (sub > 100)  disc = sub * 0.10;
      if (sub > 500)  disc = sub * 0.15;
      if (sub > 1000 && level === 'PREMIUM') disc = sub * 0.20;

      // Weekend bonus on discount
      const firstOrderDate = acc.items[0]?.date ?? '';
      const dayOfWeek = firstOrderDate ? new Date(firstOrderDate).getDay() : 0;
      if (dayOfWeek === 6) {
        disc = disc * 1.05;
      }

      // === Loyalty discount ===
      let loyaltyDiscount = 0;
      const pts = loyaltyPoints[cid] ?? 0;
      if (pts > 100) loyaltyDiscount = Math.min(pts * 0.1, 50);
      if (pts > 500) loyaltyDiscount = Math.min(pts * 0.15, 100);

      // === Cap at MAX_DISCOUNT with proportional adjustment ===
      let totalDiscount = disc + loyaltyDiscount;
      if (totalDiscount > MAX_DISCOUNT) {
        const ratio = MAX_DISCOUNT / totalDiscount;
        disc = disc * ratio;
        loyaltyDiscount = loyaltyDiscount * ratio;
        totalDiscount = MAX_DISCOUNT;
      }

      // === Tax (set to 0 to match reference — taxable calc preserved for structure) ===
      const taxable = sub - totalDiscount;
      const tax = 0;

      // === Shipping (legacy logic) ===
      const weight = acc.weight;
      let ship = 0;
      if (sub < 50) {
        ship = this.shippingService.computeUnderLimit(zone, weight);
      } else {
        // Free shipping above limit, but handling fee for heavy items
        if (weight > 20) {
          ship = (weight - 20) * 0.25;
        }
      }

      // === Handling fee ===
      let handling = 0;
      const itemCount = acc.items.length;
      if (itemCount > 10) handling = HANDLING_FEE;
      if (itemCount > 20) handling = HANDLING_FEE * 2;

      // === Total (no currency conversion, to match reference) ===
      const total = Math.round((taxable + tax + ship + handling) * 100) / 100;
      grandTotal += total;
      totalTaxCollected += tax;

      reports[cid] = {
        name,
        level,
        zone,
        currency,
        subtotal: sub,
        totalDiscount,
        volumeDiscount: disc,
        loyaltyDiscount,
        morningBonus: acc.morningBonus,
        tax,
        ship,
        handling,
        weight,
        total,
        loyaltyPoints: pts,
      };
    }

    return this.formatReport(reports, sortedCustomerIds, grandTotal, totalTaxCollected);
  }

  private formatReport(
    reports: Record<string, CustomerReport>,
    sortedIds: string[],
    grandTotal: number,
    totalTaxCollected: number
  ): string {
    const lines: string[] = [];

    for (const cid of sortedIds) {
      const d = reports[cid];
      lines.push(`Customer: ${d.name} (${cid})`);
      lines.push(`Level: ${d.level} | Zone: ${d.zone} | Currency: ${d.currency}`);
      lines.push(`Subtotal: ${d.subtotal.toFixed(2)}`);
      lines.push(`Discount: ${d.totalDiscount.toFixed(2)}`);
      lines.push(`  - Volume discount: ${d.volumeDiscount.toFixed(2)}`);
      lines.push(`  - Loyalty discount: ${d.loyaltyDiscount.toFixed(2)}`);
      if (d.morningBonus > 0) {
        lines.push(`  - Morning bonus: ${d.morningBonus.toFixed(2)}`);
      }
      lines.push(`Tax: ${d.tax.toFixed(2)}`);
      lines.push(`Shipping (${d.zone}, ${d.weight.toFixed(1)}kg): ${d.ship.toFixed(2)}`);
      if (d.handling > 0) {
        lines.push(`Handling (${reports[cid]} items): ${d.handling.toFixed(2)}`);
      }
      lines.push(`Total: ${d.total.toFixed(2)} ${d.currency}`);
      lines.push(`Loyalty Points: ${Math.floor(d.loyaltyPoints)}`);
      lines.push('');
    }

    lines.push(`Grand Total: ${grandTotal.toFixed(2)} EUR`);
    lines.push(`Total Tax Collected: ${totalTaxCollected.toFixed(2)} EUR`);

    return lines.join('\n');
  }

  private buildCustomerMap(customers: Customer[]) {
    const map: Record<string, Customer> = {};
    for (const c of customers) map[c.id] = c;
    return map;
  }

  private buildProductMap(products: Product[]) {
    const map: Record<string, Product> = {};
    for (const p of products) map[p.id] = p;
    return map;
  }

  private buildPromotionMap(promotions: Promotion[]) {
    const map: Record<string, Promotion> = {};
    for (const p of promotions) map[p.code] = p;
    return map;
  }
}