# ATLVS Downloadable Templates

This directory contains downloadable templates for ATLVS users.

## Directory Structure

```
templates/
├── production-planning/
│   ├── production-master-schedule.xlsx
│   ├── event-timeline-template.xlsx
│   ├── milestone-tracker.xlsx
│   └── resource-allocation-matrix.xlsx
├── crew-management/
│   ├── crew-call-sheet.pdf
│   ├── crew-schedule-template.xlsx
│   ├── department-roster.xlsx
│   └── skills-matrix.xlsx
├── financial/
│   ├── production-budget-template.xlsx
│   ├── expense-report-template.xlsx
│   ├── settlement-worksheet.xlsx
│   ├── invoice-template.docx
│   └── purchase-order-template.docx
├── advancing/
│   ├── artist-advance-form.pdf
│   ├── venue-advance-checklist.pdf
│   ├── technical-rider-template.docx
│   └── hospitality-requirements.xlsx
├── contracts/
│   ├── vendor-agreement-template.docx
│   ├── crew-contract-template.docx
│   ├── nda-template.docx
│   └── service-agreement.docx
├── safety-compliance/
│   ├── safety-plan-template.docx
│   ├── incident-report-form.pdf
│   ├── emergency-action-plan.docx
│   └── risk-assessment-matrix.xlsx
└── marketing/
    ├── event-marketing-plan.docx
    ├── press-release-template.docx
    ├── social-media-calendar.xlsx
    └── sponsor-deck-template.pptx
```

## Template Formats

- **XLSX**: Microsoft Excel spreadsheets with formulas and formatting
- **PDF**: Printable forms and checklists
- **DOCX**: Microsoft Word documents for contracts and plans
- **PPTX**: Microsoft PowerPoint presentations

## Usage

Templates are served from `/templates/{category}/{filename}` and can be downloaded directly from the Resources page.

## Adding New Templates

1. Create the template file in the appropriate category folder
2. Add the template metadata to `packages/config/marketing-content/templates.ts`
3. Set the `downloadUrl` to `/templates/{category}/{filename}`

## Template Guidelines

- All templates should include ATLVS branding
- Include instructions or example data where helpful
- Use consistent formatting and styling
- Test all formulas and calculations before publishing
