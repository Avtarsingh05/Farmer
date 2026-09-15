# Kisan Insights — Analytics Architecture & Data Model Documentation
**KisanMitra Platform (SIH26033)**

---

## 1. Executive Summary

"Kisan Insights" is the historical market intelligence and agricultural analytics module for KisanMitra. It gives farmers transparent access to APMC mandi benchmarks, regional price comparisons, platform buyer demand activity, and private farm sales performance to support confident pricing and direct-to-buyer negotiation without predatory intermediaries.

All analytics data originates from Firestore. Charts and metrics are calculated dynamically rather than hardcoded.

---

## 2. Firestore Collections & Schema

### `marketPrices/{priceId}`
Primary historical observations collection. Each document represents one daily APMC/Mandi modal rate observation.

| Field | Type | Description |
|---|---|---|
| `cropId` | string | Normalized crop key (e.g. `'tomato'`, `'wheat'`) |
| `cropName` | string | Canonical display name (`'Tomato'`) |
| `marketId` | string | Mandi identifier (`'amritsar'`) |
| `marketName` | string | Full mandi name (`'Amritsar Main Mandi'`) |
| `state` | string | State name (`'Punjab'`) |
| `district` | string | District name (`'Amritsar'`) |
| `minPrice` | number | Daily minimum auction rate |
| `maxPrice` | number | Daily maximum auction rate |
| `modalPrice` | number | Daily modal (most frequent) rate |
| `unit` | string | `'kg'` or `'quintal'` |
| `currency` | string | `'INR'` |
| `date` | Timestamp | Observation date (11:00 AM IST) |
| `source` | string | Ingestion source identifier (`'apmc_daily'`, `'agmarknet'`) |
| `sourceName` | string | Human readable source name (`'Amritsar APMC Bulletin'`) |
| `dataSource` | string | `'official'`, `'platform'`, or `'demo'` |
| `isDemo` | boolean | `true` if generated for testing/demo mode |

---

### `regionalPrices/{recordId}`
Pre-aggregated district comparisons for the current agricultural cycle.

| Field | Type | Description |
|---|---|---|
| `cropId` | string | Crop identifier |
| `state` | string | State name |
| `district` | string | District name |
| `marketName` | string | Representative market |
| `averagePrice` | number | Current modal average |
| `unit` | string | Unit of measurement |
| `date` | Timestamp | Effective date |
| `dataSource` | string | `'official'` or `'demo'` |

---

### `demandHistory/{demandId}`
Platform buyer activity metrics aggregating searches, views, cart additions, and order volumes.

| Field | Type | Description |
|---|---|---|
| `cropId` | string | Crop identifier |
| `date` | Timestamp | Aggregation date |
| `searchCount` | number | User query count for this crop |
| `viewCount` | number | Product detail page views |
| `cartCount` | number | Add-to-cart operations |
| `orderCount` | number | Orders placed |
| `demandScore` | number | Normalized 0-100 score |
| `dataSource` | string | `'platform'` or `'demo'` |

---

### `salesAnalytics/{salesId}` & `farmerAnalytics/{farmerId}`
Strictly private farmer sales records derived exclusively from delivered/accepted orders.

| Security Rule | Authorization |
|---|---|
| Read | Authenticated farmer (own UID only) or Platform Admin |
| Write | Automated system calculation / Admin |

---

## 3. Statistical Formulas & Methodology

### Rolling Averages
$$\bar{P} = \frac{1}{N} \sum_{i=1}^N P_i$$
Calculated over 7-day, 30-day, 90-day, and 1-year windows.

### Price Change Percentage
$$\Delta\% = \frac{\bar{P}_{\text{recent}} - \bar{P}_{\text{prior}}}{\bar{P}_{\text{prior}}} \times 100$$

### Trend Classification
- $\Delta\% > +3.0\% \implies$ `rising`
- $\Delta\% < -3.0\% \implies$ `falling`
- $-3.0\% \le \Delta\% \le +3.0\% \implies$ `stable`
- Observation count $< 3 \implies$ `insufficient_data`

### Historical Volatility (Coefficient of Variation)
$$CV = \frac{\sigma}{\bar{P}} \times 100$$
- $CV < 5\% \implies$ `low`
- $5\% \le CV \le 15\% \implies$ `moderate`
- $CV > 15\% \implies$ `high`

### Platform Demand Activity Score
$$\text{DemandScore} = \min(100, \, (0.5 \times \text{searches}) + (1.0 \times \text{views}) + (2.5 \times \text{carts}) + (5.0 \times \text{orders}))$$

---

## 4. Voice Assistant ("Mitra") Integration

Mitra is equipped with 3 analytics tools:
1. `getHistoricalPrice`: Returns historical average, current price, and trend state for a specified crop and timeframe.
2. `getRegionalPriceComparison`: Compares rates across neighboring mandis (e.g. Amritsar vs. Jalandhar).
3. `getFarmerSalesSummary`: Reports the authenticated farmer's actual delivered orders, total revenue, and top-selling crop.

All tools respect user authorization and never fabricate data.

---

## 5. Security & Privacy Guarantees

- **No client mutation**: Ordinary farmers and buyers have read-only access to market prices, regional comparisons, and demand indexes.
- **Privacy isolation**: Farmers cannot view another farmer's revenue, order counts, or sales breakdowns.
- **Data integrity**: Historical data writes are restricted to administrative batches and server-side aggregation pipelines in `firestore.rules`.
