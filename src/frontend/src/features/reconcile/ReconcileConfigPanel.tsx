import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ParsedSheet, ReconcileConfig } from './types';
import { Play, Loader2 } from 'lucide-react';

interface ReconcileConfigPanelProps {
  sheetA: ParsedSheet;
  sheetB: ParsedSheet;
  sheetC: ParsedSheet;
  onReconcile: (config: ReconcileConfig) => void;
  isReconciling: boolean;
}

export default function ReconcileConfigPanel({
  sheetA,
  sheetB,
  sheetC,
  onReconcile,
  isReconciling
}: ReconcileConfigPanelProps) {
  const [keyColumnsA, setKeyColumnsA] = useState<string[]>([]);
  const [keyColumnsB, setKeyColumnsB] = useState<string[]>([]);
  const [keyColumnsC, setKeyColumnsC] = useState<string[]>([]);
  const [compareColumns, setCompareColumns] = useState<string[]>([]);

  // Get common headers across all sheets for compare columns
  const commonHeaders = sheetA.headers.filter(h =>
    sheetB.headers.includes(h) && sheetC.headers.includes(h)
  );

  const handleToggleKeyColumn = (
    column: string,
    sheet: 'A' | 'B' | 'C'
  ) => {
    const setters = {
      A: setKeyColumnsA,
      B: setKeyColumnsB,
      C: setKeyColumnsC
    };
    const getters = {
      A: keyColumnsA,
      B: keyColumnsB,
      C: keyColumnsC
    };

    const setter = setters[sheet];
    const current = getters[sheet];

    if (current.includes(column)) {
      setter(current.filter(c => c !== column));
    } else {
      setter([...current, column]);
    }
  };

  const handleToggleCompareColumn = (column: string) => {
    if (compareColumns.includes(column)) {
      setCompareColumns(compareColumns.filter(c => c !== column));
    } else {
      setCompareColumns([...compareColumns, column]);
    }
  };

  const handleRunReconciliation = () => {
    const config: ReconcileConfig = {
      keyColumnsA,
      keyColumnsB,
      keyColumnsC,
      compareColumns
    };
    onReconcile(config);
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
            {/* Sheet A Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sheet A Keys</Label>
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

            {/* Sheet B Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sheet B Keys</Label>
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

            {/* Sheet C Keys */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sheet C Keys</Label>
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

        {/* Run Button */}
        <Button
          onClick={handleRunReconciliation}
          disabled={isReconciling}
          size="lg"
          className="w-full"
        >
          {isReconciling ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Reconciling...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Run Reconciliation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
