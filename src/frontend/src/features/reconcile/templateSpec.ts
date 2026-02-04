export const TEMPLATE_SPECS = {
  A: {
    fileName: 'SheetA-template.xlsx',
    sheetName: 'Sheet A',
    requiredHeaders: ['ID', 'Name', 'Amount', 'Date', 'Status']
  },
  B: {
    fileName: 'SheetB-template.xlsx',
    sheetName: 'Sheet B',
    requiredHeaders: ['ID', 'Name', 'Amount', 'Date', 'Status']
  },
  C: {
    fileName: 'SheetC-template.xlsx',
    sheetName: 'Sheet C',
    requiredHeaders: ['ID', 'Name', 'Amount', 'Date', 'Status']
  }
} as const;

export type TemplateKey = keyof typeof TEMPLATE_SPECS;
