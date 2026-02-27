# Order Report Refactoring

Refactorisation d'un système legacy de génération de rapports de commandes.

## Objectif

Le projet consiste à refactoriser `legacy/orderReportLegacy.ts` — une fonction monolithique de ~300 lignes — en une architecture modulaire, testable et maintenable, tout en préservant **exactement** le comportement observable via un test Golden Master.

## Architecture

```
src/
├── application/
│   └── OrderReportEngine.ts       # Orchestration principale
├── domain/
│   ├── Customer.ts
│   ├── Order.ts
│   ├── Product.ts
│   └── Promotion.ts
├── infrastructure/
│   └── parsers/
│       ├── CustomerParser.ts
│       ├── OrderParser.ts
│       ├── ProductParser.ts
│       └── PromotionParser.ts
├── services/
│   ├── DiscountService.ts         # Calcul des remises par paliers
│   ├── LoyaltyService.ts          # Points de fidélité
│   ├── PromotionService.ts        # Application des codes promo + morning bonus
│   ├── ShippingService.ts         # Frais de port par zone et poids
│   └── TaxService.ts              # Calcul de la taxe
└── index.ts                       # Point d'entrée
data/
├── customers.csv
├── orders.csv
├── products.csv
├── products.csv
├── promotions.csv
└── shipping_zones.csv
legacy/
└── orderReportLegacy.ts           # Code original (non modifié)
tests/
├── DiscountService.test.ts
├── TaxService.test.ts
└── goldenMaster.test.ts           # Vérifie la parité avec le legacy
```

## Décisions de refactorisation

### Comportements legacy préservés (bugs inclus)

- **Discount en cascade** : les paliers utilisent des `if/if` successifs (chaque palier écrase le précédent), comportement identique au legacy.
- **Weekend bonus** : uniquement le samedi (`dayOfWeek === 6`). Le dimanche ne déclenche pas le bonus — en raison du parsing UTC de `new Date()` dans le legacy, `2025-01-19` (dimanche) était interprété comme lundi selon le fuseau horaire de référence.
- **Fixed promo bug** : la remise fixe est appliquée par ligne × quantité au lieu d'une remise globale.
- **Morning bonus** : 3% de réduction supplémentaire pour les commandes passées avant 10h.
- **Shipping gratuit** si sous-total ≥ 50€, sauf surcoût `(poids - 20kg) × 0.25` pour les commandes très lourdes.

## Installation

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

Résultat attendu :

```
PASS  tests/DiscountService.test.ts
PASS  tests/TaxService.test.ts
PASS  tests/goldenMaster.test.ts

Test Suites: 3 passed, 3 total
Tests:       4 passed, 4 total
```

## Lancer le rapport

```bash
npx ts-node src/index.ts
```
