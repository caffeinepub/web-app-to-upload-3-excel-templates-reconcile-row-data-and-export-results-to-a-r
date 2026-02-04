import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ParsedSheet } from './types';
import { TEMPLATE_SPECS } from './templateSpec';

interface ReconcileConfigPanelProps {
  sheetA: ParsedSheet;
  sheetB: ParsedSheet;
  sheetC: ParsedSheet;
  keyColumnsA: string[];
  keyColumnsB: string[];
  keyColumnsC: string[];
  compareColumns: string[];
  onKeyColumnsAChange: (columns: string[]) => void;
  onKeyColumnsBChange: (columns: string[]) => void;
  onKeyColumnsCChange: (columns: string[]) => void;
  onCompareColumnsChange: (columns: string[]) => void;
}

export default function ReconcileConfigPanel({
  sheetA,
  sheetB,
  sheetC,
  keyColumnsA,
  keyColumnsB,
  keyColumnsC,
  compareColumns,
  onKeyColumnsAChange,
  onKeyColumnsBChange,
  onKeyColumnsCChange,
  onCompareColumnsChange
}: ReconcileConfigPanelProps) {
  // Get common headers across all sheets for compare columns
  const commonHeaders = sheetA.headers.filter(h =>
    sheetB.headers.includes(h) && sheetC.headers.includes(h)
  );

  const handleToggleKeyColumn = (
    column: string,
    sheet: 'A' | 'B' | 'C'
  ) => {
    const handlers = {
      A: onKeyColumnsAChange,
      B: onKeyColumnsBChange,
      C: onKeyColumnsCChange
    };
    const getters = {
      A: keyColumnsA,
      B: keyColumnsB,
      C: keyColumnsC
    };

    const handler = handlers[sheet];
    const current = getters[sheet];

    if (current.includes(column)) {
      handler(current.filter(c => c !== column));
    } else {
      handler([...current, column]);
    }
  };

  const handleToggleCompareColumn = (column: string) => {
    if (compareColumns.includes(column)) {
      onCompareColumnsChange(compareColumns.filter(c => c !== column));
    } else {
      onCompareColumnsChange([...compareColumns, column]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Configure Reconciliation</CardTitle>
        <CardDescription>
          Select key columns for matching rows and columns to compare for differences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Columns */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Key Columns (for matching rows)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sheet A (Accounts) Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{TEMPLATE_SPECS.A.displayName} Keys</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                {sheetA.headers.map(header => (
                  <div key={header} className="flex items-center space-x-2">
                    <Checkbox
                      id={`keyA-${header}`}
                      checked={keyColumnsA.includes(header)}
                      onCheckedChange={() => handleToggleKeyColumn(header, 'A')}
                    />
                    <label
                      htmlFor={`keyA-${header}`}
                      className="text-sm cursor-pointer"
                    >
                      {header}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sheet B (Computation) Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{TEMPLATE_SPECS.B.displayName} Keys</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                {sheetB.headers.map(header => (
                  <div key={header} className="flex items-center space-x-2">
                    <Checkbox
                      id={`keyB-${header}`}
                      checked={keyColumnsB.includes(header)}
                      onCheckedChange={() => handleToggleKeyColumn(header, 'B')}
                    />
                    <label
                      htmlFor={`keyB-${header}`}
                      className="text-sm cursor-pointer"
                    >
                      {header}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sheet C (Winman Data) Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{TEMPLATE_SPECS.C.displayName} Keys</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                {sheetC.headers.map(header => (
                  <div key={header} className="flex items-center space-x-2">
                    <Checkbox
                      id={`keyC-${header}`}
                      checked={keyColumnsC.includes(header)}
                      onCheckedChange={() => handleToggleKeyColumn(header, 'C')}
                    />
                    <label
                      htmlFor={`keyC-${header}`}
                      className="text-sm cursor-pointer"
                    >
                      {header}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compare Columns */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Compare Columns (for mismatch detection)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border rounded-md p-3">
            {commonHeaders.map(header => (
              <div key={header} className="flex items-center space-x-2">
                <Checkbox
                  id={`compare-${header}`}
                  checked={compareColumns.includes(header)}
                  onCheckedChange={() => handleToggleCompareColumn(header)}
                />
                <label
                  htmlFor={`compare-${header}`}
                  className="text-sm cursor-pointer"
                >
                  {header}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
