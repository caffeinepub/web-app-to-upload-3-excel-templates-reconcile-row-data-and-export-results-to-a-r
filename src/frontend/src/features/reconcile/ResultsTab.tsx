import { useState, useMemo } from 'react';
import { ReconciliationResults, ReconcileStatus, ReconcileResultRow } from './types';
import { TEMPLATE_SPECS } from './templateSpec';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Search, Eye, Loader2 } from 'lucide-react';
import { exportToXlsx } from './exportXlsx';

interface ResultsTabProps {
  results: ReconciliationResults;
}

export default function ResultsTab({ results }: ResultsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<ReconcileResultRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter and search results
  const filteredRows = useMemo(() => {
    let filtered = results.rows;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    // Apply search - search by row number or any cell value
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(row => {
        // Search in row index
        if (row.rowIndex.toString().includes(search)) {
          return true;
        }
        // Search in any value from A, B, or C
        const allValues = [
          ...Object.values(row.valuesA),
          ...Object.values(row.valuesB),
          ...Object.values(row.valuesC)
        ];
        return allValues.some(val => 
          val && val.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }, [results.rows, statusFilter, searchQuery]);

  const getStatusBadge = (status: ReconcileStatus) => {
    const variants: Record<ReconcileStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      'Matched': { variant: 'default', className: 'bg-green-600 hover:bg-green-700' },
      'Mismatch': { variant: 'destructive' },
      'Missing in A': { variant: 'secondary' },
      'Missing in B': { variant: 'secondary' },
      'Missing in C': { variant: 'secondary' }
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToXlsx(results);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rows</CardDescription>
            <CardTitle className="text-3xl">{results.summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Matched</CardDescription>
            <CardTitle className="text-3xl text-green-600">{results.summary.matched}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mismatch</CardDescription>
            <CardTitle className="text-3xl text-destructive">{results.summary.mismatch}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missing in A</CardDescription>
            <CardTitle className="text-3xl">{results.summary.missingInA}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missing in B</CardDescription>
            <CardTitle className="text-3xl">{results.summary.missingInB}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missing in C</CardDescription>
            <CardTitle className="text-3xl">{results.summary.missingInC}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Results</CardTitle>
          <CardDescription>Filter, search, and export reconciliation data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Matched">Matched</SelectItem>
                  <SelectItem value="Mismatch">Mismatch</SelectItem>
                  <SelectItem value="Missing in A">Missing in A</SelectItem>
                  <SelectItem value="Missing in B">Missing in B</SelectItem>
                  <SelectItem value="Missing in C">Missing in C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by row # or value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Export Button */}
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Results (.xlsx)
                </>
              )}
            </Button>
          </div>

          {/* Results Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">In A</TableHead>
                  <TableHead className="text-center">In B</TableHead>
                  <TableHead className="text-center">In C</TableHead>
                  <TableHead>Mismatched Columns</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{row.rowIndex}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell className="text-center">
                        {row.presentInA ? '✓' : '✗'}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.presentInB ? '✓' : '✗'}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.presentInC ? '✓' : '✗'}
                      </TableCell>
                      <TableCell>
                        {row.mismatches.length > 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {row.mismatches.join(', ')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRow(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredRows.length} of {results.rows.length} results
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Row Details</DialogTitle>
            <DialogDescription>
              Row #: <span className="font-mono">{selectedRow?.rowIndex}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedRow && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                {getStatusBadge(selectedRow.status)}
              </div>

              {/* Compare Column Values with proper sheet labels */}
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {selectedRow.status === 'Mismatch' ? 'Mismatched Values' : 'Compared Values'}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>{TEMPLATE_SPECS.A.displayName}</TableHead>
                      <TableHead>{TEMPLATE_SPECS.B.displayName}</TableHead>
                      <TableHead>{TEMPLATE_SPECS.C.displayName}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Show only mismatched columns for Mismatch status, all columns otherwise */}
                    {(selectedRow.status === 'Mismatch' && selectedRow.mismatches.length > 0
                      ? selectedRow.mismatches
                      : results.config.compareColumns
                    ).map(col => {
                      const vA = selectedRow.valuesA[col];
                      const vB = selectedRow.valuesB[col];
                      const vC = selectedRow.valuesC[col];
                      const isMismatch = selectedRow.mismatches.includes(col);

                      return (
                        <TableRow key={col} className={isMismatch ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-medium">
                            {col}
                            {isMismatch && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Mismatch
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={!selectedRow.presentInA ? 'text-muted-foreground italic' : ''}>
                            {selectedRow.presentInA ? (vA || <span className="text-muted-foreground italic">empty</span>) : 'N/A'}
                          </TableCell>
                          <TableCell className={!selectedRow.presentInB ? 'text-muted-foreground italic' : ''}>
                            {selectedRow.presentInB ? (vB || <span className="text-muted-foreground italic">empty</span>) : 'N/A'}
                          </TableCell>
                          <TableCell className={!selectedRow.presentInC ? 'text-muted-foreground italic' : ''}>
                            {selectedRow.presentInC ? (vC || <span className="text-muted-foreground italic">empty</span>) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
