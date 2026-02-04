// SheetJS Community Edition wrapper
// This provides a type-safe interface to the xlsx library loaded via CDN

export interface WorkBook {
  SheetNames: string[];
  Sheets: { [sheet: string]: WorkSheet };
}

export interface WorkSheet {
  [cell: string]: CellObject | any;
}

export interface CellObject {
  v?: any;
  w?: string;
  t?: string;
  f?: string;
  F?: string;
  r?: string;
  h?: string;
  c?: any[];
  z?: string;
  l?: any;
  s?: any;
}

export interface WritingOptions {
  bookType?: string;
  bookSST?: boolean;
  type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array';
}

export interface ParsingOptions {
  type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array';
  cellStyles?: boolean;
  cellFormulas?: boolean;
  cellDates?: boolean;
  cellNF?: boolean;
  sheetStubs?: boolean;
}

export interface Sheet2JSONOpts {
  header?: number | string[];
  defval?: any;
  raw?: boolean;
  range?: any;
}

export interface AOA2SheetOpts {
  dateNF?: string;
  cellDates?: boolean;
  sheetStubs?: boolean;
}

declare global {
  interface Window {
    XLSX: {
      read: (data: any, opts?: ParsingOptions) => WorkBook;
      write: (wb: WorkBook, opts?: WritingOptions) => any;
      writeFile: (wb: WorkBook, filename: string, opts?: WritingOptions) => void;
      utils: {
        sheet_to_json: <T = any>(sheet: WorkSheet, opts?: Sheet2JSONOpts) => T[];
        aoa_to_sheet: (data: any[][], opts?: AOA2SheetOpts) => WorkSheet;
        book_new: () => WorkBook;
        book_append_sheet: (wb: WorkBook, ws: WorkSheet, name: string) => void;
      };
    };
  }
}

// Load XLSX from CDN
let xlsxLoaded = false;
let xlsxLoadPromise: Promise<void> | null = null;

export async function ensureXLSXLoaded(): Promise<void> {
  if (xlsxLoaded) return;
  
  if (xlsxLoadPromise) {
    return xlsxLoadPromise;
  }

  xlsxLoadPromise = new Promise((resolve, reject) => {
    if (window.XLSX) {
      xlsxLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload = () => {
      xlsxLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load XLSX library'));
    };
    document.head.appendChild(script);
  });

  return xlsxLoadPromise;
}

export function getXLSX() {
  if (!window.XLSX) {
    throw new Error('XLSX library not loaded. Call ensureXLSXLoaded() first.');
  }
  return window.XLSX;
}
