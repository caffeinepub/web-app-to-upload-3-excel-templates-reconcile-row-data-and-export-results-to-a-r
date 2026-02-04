import { ReconcileConfig } from './types';

export interface ConfigValidationError {
  field: string;
  message: string;
}

export function validateReconcileConfig(config: ReconcileConfig): ConfigValidationError | null {
  // Ensure at least one compare column exists
  if (config.compareColumns.length === 0) {
    return {
      field: 'compareColumns',
      message: 'At least one column must be available for comparison'
    };
  }
  
  return null;
}
