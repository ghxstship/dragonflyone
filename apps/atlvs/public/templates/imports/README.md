# GHXSTSHIP Data Import Templates

This directory contains database-aligned CSV templates for bulk data import into the GHXSTSHIP platform. These templates are designed for **plug-and-play data migration** from existing systems.

## Quick Start

1. Download the appropriate template for your data type
2. Delete the example rows (keep the header row)
3. Fill in your data following the field definitions
4. Delete the documentation section at the bottom
5. Import via the ATLVS Data Import feature

## Import Order (Dependencies)

Import data in this order to ensure foreign key relationships are satisfied:

```
1. vendors-import.csv          (no dependencies)
2. venues-import.csv           (no dependencies)
3. contacts-import.csv         (no dependencies)
4. workforce-roles-import.csv  (no dependencies)
5. workforce-employees-import.csv (no dependencies)
6. workforce-certifications-import.csv (requires employees)
7. events-import.csv           (references venues)
8. assets-import.csv           (no dependencies)
9. finance-budgets-import.csv  (no dependencies)
10. finance-budget-lines-import.csv (requires budgets)
11. finance-expenses-import.csv (no dependencies)
12. finance-purchase-orders-import.csv (references vendors)
13. finance-bills-import.csv   (references vendors, POs)
14. workforce-shifts-import.csv (references events, roles)
15. workforce-time-entries-import.csv (requires employees, events)
```

## Available Templates

### Workforce Management

| Template | Description | Key Fields |
|----------|-------------|------------|
| `workforce-employees-import.csv` | Employee/crew member records | employee_number, name, employment_type, hourly_rate |
| `workforce-roles-import.csv` | Job roles and positions | code, name, hourly_rate_min/max, certifications |
| `workforce-shifts-import.csv` | Shift scheduling | shift_date, start/end_time, role_code, headcount |
| `workforce-time-entries-import.csv` | Time tracking/timesheets | employee_number, work_date, hours, status |
| `workforce-certifications-import.csv` | Employee certifications | employee_number, cert_type, expiration_date |

### Financial Management

| Template | Description | Key Fields |
|----------|-------------|------------|
| `finance-expenses-import.csv` | Expense reports | expense_number, amount, category, status |
| `finance-purchase-orders-import.csv` | Purchase orders | po_number, vendor, total_amount, status |
| `finance-budgets-import.csv` | Budget headers | name, total_amount, fiscal_year, status |
| `finance-budget-lines-import.csv` | Budget line items | budget_name, category, planned/actual_amount |
| `finance-bills-import.csv` | Vendor invoices | bill_number, vendor, total_amount, due_date |

### Events & Venues

| Template | Description | Key Fields |
|----------|-------------|------------|
| `events-import.csv` | Event records | event_code, name, dates, venue, capacity |
| `venues-import.csv` | Venue database | venue_code, name, address, capacities |

### Contacts & Vendors

| Template | Description | Key Fields |
|----------|-------------|------------|
| `contacts-import.csv` | CRM contacts | name, email, company, tags |
| `vendors-import.csv` | Vendor database | vendor_code, name, type, payment_terms |

### Assets

| Template | Description | Key Fields |
|----------|-------------|------------|
| `assets-import.csv` | Equipment inventory | tag, name, category, serial_number, state |

## Data Format Requirements

### Dates
- Format: `YYYY-MM-DD` (e.g., `2024-07-15`)
- Leave blank if unknown (don't use placeholder dates)

### Times
- Format: `HH:MM` in 24-hour format (e.g., `14:00` not `2:00 PM`)
- For overnight shifts, end_time can be less than start_time

### Currency/Amounts
- Use decimal numbers without currency symbols (e.g., `1500.00` not `$1,500.00`)
- Use period as decimal separator
- No thousands separators

### Boolean Values
- Use lowercase: `true` or `false`
- Leave blank for default value

### Multiple Values
- Use semicolons to separate multiple values (e.g., `audio;lighting;video`)
- For tags, use commas within quotes (e.g., `"vendor,preferred,audio"`)

### Text Fields
- Wrap in quotes if contains commas (e.g., `"Smith, John"`)
- No special character restrictions

## Enum Values Reference

### Employment Types
`full_time`, `part_time`, `contractor`, `seasonal`, `intern`

### Employee Status
`active`, `inactive`, `terminated`, `on_leave`

### Event Status
`draft`, `planning`, `confirmed`, `in_progress`, `completed`, `cancelled`, `postponed`

### Event Types
`concert`, `festival`, `corporate`, `private`, `fundraiser`, `party`, `conference`, `other`

### Expense Status
`draft`, `submitted`, `approved`, `rejected`, `paid`

### Purchase Order Status
`draft`, `pending_approval`, `approved`, `ordered`, `received`, `closed`, `cancelled`

### Asset State
`available`, `reserved`, `deployed`, `maintenance`, `retired`

### Shift Status
`scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`

### Time Entry Status
`pending`, `approved`, `rejected`

## Validation Rules

1. **Required fields** must have values (see each template's field definitions)
2. **Unique fields** (codes, numbers) must not duplicate existing records
3. **Foreign keys** must reference existing records (import in correct order)
4. **Enum values** must match exactly (case-sensitive)
5. **Dates** must be valid calendar dates
6. **Amounts** must be positive numbers

## Error Handling

If import fails:
1. Check the error message for the specific row and field
2. Verify enum values match exactly
3. Ensure required fields are populated
4. Confirm referenced records exist (venues, employees, etc.)
5. Validate date and number formats

## Migrating from Other Systems

### From Excel/Google Sheets
1. Export as CSV (UTF-8 encoding)
2. Map columns to template fields
3. Convert date formats to YYYY-MM-DD
4. Remove currency symbols from amounts

### From Other Production Software
1. Export data in CSV format
2. Create field mapping document
3. Transform data to match template structure
4. Import in dependency order

## Support

For import assistance or custom migration support, contact your GHXSTSHIP administrator or visit the Help Center.
