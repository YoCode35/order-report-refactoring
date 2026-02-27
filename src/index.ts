import { OrderReportEngine } from './application/OrderReportEngine';
import { PromotionService } from './services/PromotionService';
import { DiscountService } from './services/DiscountService';
import { TaxService } from './services/TaxService';
import { LoyaltyService } from './services/LoyaltyService';

import { parseOrders } from './infrastructure/parsers/OrderParser';
import { parseCustomers } from './infrastructure/parsers/CustomerParser';
import { parseProducts } from './infrastructure/parsers/ProductParser';
import { parsePromotions } from './infrastructure/parsers/PromotionParser';

import * as fs from 'fs';
import * as path from 'path';
import { ShippingService } from './services/ShippingService';

export function run(): string {
  // Résolution du chemin depuis le dossier racine du projet
  const basePath = path.join(__dirname, 'data');

  const orders = parseOrders(
    fs.readFileSync(path.join(basePath, 'orders.csv'), 'utf-8')
  );

  const customers = parseCustomers(
    fs.readFileSync(path.join(basePath, 'customers.csv'), 'utf-8')
  );

  const products = parseProducts(
    fs.readFileSync(path.join(basePath, 'products.csv'), 'utf-8')
  );

  const promotions = parsePromotions(
    fs.readFileSync(path.join(basePath, 'promotions.csv'), 'utf-8')
  );

const engine = new OrderReportEngine(
  new PromotionService(),
  new DiscountService(),
  new TaxService(),
  new LoyaltyService(),
  new ShippingService()   // ← ajouter
);

  return engine.generate(orders, customers, products, promotions);
}