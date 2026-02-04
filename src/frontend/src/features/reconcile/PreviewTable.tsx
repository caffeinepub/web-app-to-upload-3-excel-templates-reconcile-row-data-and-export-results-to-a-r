import { ParsedSheet } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewTableProps {
  sheet: ParsedSheet;
  maxRows?: number;
}

export default function PreviewTable({ sheet, maxRows = 20 }: PreviewTableProps) {
  const displayRows = sheet.rows.slice(0, maxRows);
  const hasMore = sheet.rows.length > maxRows;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Preview: {sheet.fileName}</CardTitle>
        <CardDescription>
          Showing {displayRows.length} of {sheet.rows.length} rows
          {hasMore && ` (first ${maxRows} rows)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {sheet.headers.map((header, index) => (
                  <TableHead key={index} className="whitespace-nowrap">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {sheet.headers.map((header, colIndex) => (
                    <TableCell key={colIndex} className="whitespace-nowrap">
                      {row[header] || <span className="text-muted-foreground italic">empty</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
