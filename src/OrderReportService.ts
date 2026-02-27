import { DiscountService } from './services/DiscountService';
import { TaxService } from './services/TaxService';
import { ReportBuilder } from './reporting/ReportBuilder';
import { Customer } from './domain/Customer';
import { Order } from './domain/Order';

export class OrderReportService {
  constructor(
    private discountService: DiscountService,
    private taxService: TaxService,
    private reportBuilder: ReportBuilder
  ) {}

  generate(order: Order, customer: Customer): string {
    const discount = this.discountService.compute(
      order.subtotal,
      customer.level
    );

    const taxed =
      (order.subtotal - discount) +
      this.taxService.compute(order.subtotal - discount);

    return this.reportBuilder.build(taxed);
  }
}