import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ParsedSheet } from './types';
import { TEMPLATE_SPECS } from './templateSpec';

interface ReconcileConfigPanelProps {
  sheetA: ParsedSheet;
  sheetB: ParsedSheet;
  sheetC: ParsedSheet;
  compareColumns: string[];
}

export default function ReconcileConfigPanel({
  sheetA,
  sheetB,
  sheetC,
  compareColumns
}: ReconcileConfigPanelProps) {
  // Get common headers across all sheets for compare columns
  const commonHeaders = sheetA.headers.filter(h =>
    sheetB.headers.includes(h) && sheetC.headers.includes(h)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Reconciliation Configuration</CardTitle>
        <CardDescription>
          Rows will be compared by position (row index) across all three sheets. All common columns will be checked for equality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Matching Rule:</strong> Rows are matched by their position (row 1 in Sheet A is compared with row 1 in Sheet B and Sheet C).
            <br />
            <strong>Comparison Rule:</strong> All common columns are automatically compared across Sheet A, B, and C. Any differences will be flagged as mismatches.
          </AlertDescription>
        </Alert>

        {/* Compare Columns - Read-only display */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Columns Being Compared</Label>
          <CardDescription className="text-sm">
            All common columns across the three sheets are automatically compared for row-wise equality.
          </CardDescription>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border rounded-md p-3 bg-muted/20">
            {commonHeaders.map(header => (
              <div key={header} className="flex items-center space-x-2">
                <Checkbox
                  id={`compare-${header}`}
                  checked={true}
                  disabled={true}
                />
                <label
                  htmlFor={`compare-${header}`}
                  className="text-sm cursor-not-allowed font-medium"
                >
                  {header}
                </label>
              </div>
            ))}
          </div>
          {commonHeaders.length === 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                No common columns found across all three sheets. Please ensure your files have matching column headers.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
