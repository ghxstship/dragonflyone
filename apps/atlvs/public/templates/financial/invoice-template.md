# INVOICE

<!-- IMPORT FORMAT: Copy line items table to CSV for import -->

## Invoice Details (Importable)

| field | value |
|-------|-------|
| invoice_number | |
| invoice_date | |
| due_date | |
| payment_terms | net_30 |
| client_name | |
| client_contact | |
| client_email | |
| project_name | |
| po_number | |
| status | draft |

## From

| field | value |
|-------|-------|
| company_name | |
| address | |
| city_state_zip | |
| phone | |
| email | |

## Bill To

| field | value |
|-------|-------|
| client_company | |
| contact_name | |
| address | |
| city_state_zip | |
| phone | |
| email | |

## Line Items (Importable)

| description | quantity | unit_price | amount | notes |
|-------------|----------|------------|--------|-------|
| | 1 | 0.00 | 0.00 | |
| | 1 | 0.00 | 0.00 | |
| | 1 | 0.00 | 0.00 | |

## Summary

| item | amount |
|------|--------|
| subtotal | 0.00 |
| tax_rate | 0.00 |
| tax_amount | 0.00 |
| discount | 0.00 |
| total_due | 0.00 |

## Payment Information

| method | details |
|--------|---------|
| Check Payable To | |
| Bank Name | |
| Account Name | |
| Account Number | |
| Routing Number | |

## Terms

1. Payment due within 30 days of invoice date
2. Late payments subject to 1.5% monthly finance charge
3. All sales final unless agreed in writing

---

<!-- IMPORT INSTRUCTIONS
To import invoice:
1. Copy Line Items table to a CSV file
2. Amounts should be decimal (no $ symbol)
3. Valid payment_terms: net_30 | net_15 | net_60 | due_on_receipt
4. Valid status: draft | sent | paid | overdue | cancelled
5. Import via ATLVS > Settings > Data Import > Invoices
-->
