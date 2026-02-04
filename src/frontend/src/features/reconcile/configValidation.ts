import { ReconcileConfig } from './types';

export interface ConfigValidationError {
  field: string;
  message: string;
}

export function validateReconcileConfig(config: ReconcileConfig): ConfigValidationError | null {
  if (config.keyColumnsA.length === 0) {
    return {
      field: 'keyColumnsA',
      message: 'Please select at least one key column for Sheet A'
    };
  }
  
  if (config.keyColumnsB.length === 0) {
    return {
      field: 'keyColumnsB',
      message: 'Please select at least one key column for Sheet B'
    };
  }
  
  if (config.keyColumnsC.length === 0) {
    return {
      field: 'keyColumnsC',
      message: 'Please select at least one key column for Sheet C'
    };
  }
  
  if (config.compareColumns.length === 0) {
    return {
      field: 'compareColumns',
      message: 'Please select at least one column to compare'
    };
  }
  
  return null;
}
