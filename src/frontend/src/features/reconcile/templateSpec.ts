// GST Invoice required headers - unified schema for all sheets
const GST_INVOICE_HEADERS = [
  'NAME',
  'GSTIN',
  'INVOICE NUMBER',
  'INVOICE DATE',
  'INVOICE VALUE',
  'TAX RATE',
  'TAXABLE VALUE',
  'IGST',
  'CGST',
  'SGST',
  'STATE OF SUPPLY'
];

export const TEMPLATE_SPECS = {
  A: {
    fileName: 'SheetA-Accounts-template.xlsx',
    sheetName: 'ACCOUNTS',
    displayName: 'Sheet A (Accounts)',
    requiredHeaders: GST_INVOICE_HEADERS
  },
  B: {
    fileName: 'SheetB-Computation-template.xlsx',
    sheetName: 'COMPUTTAION',
    displayName: 'Sheet B (Computation)',
    requiredHeaders: GST_INVOICE_HEADERS
  },
  C: {
    fileName: 'SheetC-WinmanData-template.xlsx',
    sheetName: 'WINMAN DATA',
    displayName: 'Sheet C (Winman Data)',
    requiredHeaders: GST_INVOICE_HEADERS
  }
} as const;

export type TemplateKey = keyof typeof TEMPLATE_SPECS;
