import { TEMPLATE_SPECS, TemplateKey } from './templateSpec';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFileType(file: File): ValidationError | null {
  const validExtensions = ['.xlsx'];
  const fileName = file.name.toLowerCase();
  const isValid = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValid) {
    return {
      field: 'fileType',
      message: 'Only .xlsx files are accepted. Please upload a valid Excel file.'
    };
  }
  
  return null;
}

export function validateTemplateStructure(
  sheetNames: string[],
  headers: string[],
  templateKey: TemplateKey
): ValidationError | null {
  const spec = TEMPLATE_SPECS[templateKey];
  
  // Check if expected sheet exists
  if (!sheetNames.includes(spec.sheetName)) {
    return {
      field: 'sheetName',
      message: `Expected sheet "${spec.sheetName}" not found. Available sheets: ${sheetNames.join(', ')}`
    };
  }
  
  // Check if all required headers are present
  const missingHeaders = spec.requiredHeaders.filter(
    required => !headers.some(h => h?.toLowerCase() === required.toLowerCase())
  );
  
  if (missingHeaders.length > 0) {
    return {
      field: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}`
    };
  }
  
  return null;
}
