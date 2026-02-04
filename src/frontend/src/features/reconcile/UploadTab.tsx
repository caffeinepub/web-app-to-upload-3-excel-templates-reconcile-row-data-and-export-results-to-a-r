import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2, Play } from 'lucide-react';
import { TEMPLATE_SPECS, TemplateKey } from './templateSpec';
import { validateFileType, validateTemplateStructure, findSheetName, ValidationError } from './fileValidation';
import { parseExcelFile, getSheetNames } from './excelParse';
import { ParsedSheet, ReconciliationResults, ReconcileConfig } from './types';
import PreviewTable from './PreviewTable';
import ReconcileConfigPanel from './ReconcileConfigPanel';
import { validateReconcileConfig } from './configValidation';
import { reconcileData } from './reconcileLocal';
import { downloadTemplate } from '@/lib/generateTemplates';

interface UploadTabProps {
  onReconciliationComplete: (results: ReconciliationResults) => void;
}

interface FileState {
  file: File | null;
  error: ValidationError | null;
  isValidating: boolean;
  isParsing: boolean;
  parsed: ParsedSheet | null;
}

export default function UploadTab({ onReconciliationComplete }: UploadTabProps) {
  const [fileA, setFileA] = useState<FileState>({
    file: null,
    error: null,
    isValidating: false,
    isParsing: false,
    parsed: null
  });
  
  const [fileB, setFileB] = useState<FileState>({
    file: null,
    error: null,
    isValidating: false,
    isParsing: false,
    parsed: null
  });
  
  const [fileC, setFileC] = useState<FileState>({
    file: null,
    error: null,
    isValidating: false,
    isParsing: false,
    parsed: null
  });
  
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileError, setReconcileError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState<TemplateKey | null>(null);

  // Configuration state - derive compare columns from common headers
  const [compareColumns, setCompareColumns] = useState<string[]>([]);

  // Auto-configure when all files are loaded - derive compare columns from common headers
  useEffect(() => {
    if (fileA.parsed && fileB.parsed && fileC.parsed) {
      // Derive all common columns for comparison
      const commonHeaders = fileA.parsed.headers.filter(h =>
        fileB.parsed!.headers.includes(h) && fileC.parsed!.headers.includes(h)
      );
      setCompareColumns(commonHeaders);
    }
  }, [fileA.parsed, fileB.parsed, fileC.parsed]);

  const handleFileUpload = async (
    file: File,
    templateKey: TemplateKey,
    setState: React.Dispatch<React.SetStateAction<FileState>>
  ) => {
    // Reset state
    setState({
      file,
      error: null,
      isValidating: true,
      isParsing: false,
      parsed: null
    });

    // Validate file type
    const typeError = validateFileType(file);
    if (typeError) {
      setState(prev => ({ ...prev, error: typeError, isValidating: false }));
      return;
    }

    try {
      // Get sheet names
      const sheetNames = await getSheetNames(file);
      
      // Get expected sheet name
      const spec = TEMPLATE_SPECS[templateKey];
      
      // Find the actual sheet name (case-insensitive match)
      const actualSheetName = findSheetName(sheetNames, spec.sheetName);
      
      // Validate structure (sheet name only at this point)
      const structureError = validateTemplateStructure(sheetNames, [], templateKey);
      if (structureError && structureError.field === 'sheetName') {
        setState(prev => ({ ...prev, error: structureError, isValidating: false }));
        return;
      }

      // Parse the file using the actual matched sheet name
      setState(prev => ({ ...prev, isValidating: false, isParsing: true }));
      const parsed = await parseExcelFile(file, actualSheetName!);
      
      // Validate headers
      const headerError = validateTemplateStructure(sheetNames, parsed.headers, templateKey);
      if (headerError) {
        setState(prev => ({ ...prev, error: headerError, isParsing: false }));
        return;
      }

      // Success
      setState({
        file,
        error: null,
        isValidating: false,
        isParsing: false,
        parsed
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: {
          field: 'parse',
          message: error instanceof Error ? error.message : 'Failed to parse file'
        },
        isValidating: false,
        isParsing: false
      }));
    }
  };

  const handleTemplateDownload = async (templateKey: TemplateKey) => {
    setIsDownloadingTemplate(templateKey);
    try {
      await downloadTemplate(templateKey);
    } catch (error) {
      console.error('Failed to download template:', error);
    } finally {
      setIsDownloadingTemplate(null);
    }
  };

  const handleReconcile = async () => {
    setReconcileError(null);
    
    if (!fileA.parsed || !fileB.parsed || !fileC.parsed) {
      setReconcileError('All three files must be uploaded and validated before reconciliation');
      return;
    }

    // Derive compare columns at runtime - all common columns
    const commonHeaders = fileA.parsed.headers.filter(h =>
      fileB.parsed!.headers.includes(h) && fileC.parsed!.headers.includes(h)
    );

    const config: ReconcileConfig = {
      compareColumns: commonHeaders
    };

    // Validate config
    const configError = validateReconcileConfig(config);
    if (configError) {
      setReconcileError(configError.message);
      return;
    }

    setIsReconciling(true);

    try {
      // Perform reconciliation
      const results = reconcileData(fileA.parsed, fileB.parsed, fileC.parsed, config);
      onReconciliationComplete(results);
    } catch (error) {
      setReconcileError(error instanceof Error ? error.message : 'Reconciliation failed');
    } finally {
      setIsReconciling(false);
    }
  };

  const allFilesValid = fileA.parsed && fileB.parsed && fileC.parsed;
  const configComplete = compareColumns.length > 0;
  const canReconcile = allFilesValid && configComplete;

  // Build prerequisite message
  const getPrerequisiteMessage = (): string => {
    const missing: string[] = [];
    if (!fileA.parsed) missing.push('Sheet A (Accounts)');
    if (!fileB.parsed) missing.push('Sheet B (Computation)');
    if (!fileC.parsed) missing.push('Sheet C (Winman Data)');
    if (allFilesValid && compareColumns.length === 0) missing.push('common columns for comparison');
    
    if (missing.length === 0) return '';
    return `Missing: ${missing.join(', ')}`;
  };

  return (
    <div className="space-y-6">
      {/* Template Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Download Templates</CardTitle>
          <CardDescription>Download the Excel templates to ensure your files match the required format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['A', 'B', 'C'] as TemplateKey[]).map(key => (
              <Button
                key={key}
                variant="outline"
                className="w-full"
                onClick={() => handleTemplateDownload(key)}
                disabled={isDownloadingTemplate === key}
              >
                {isDownloadingTemplate === key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download {TEMPLATE_SPECS[key].displayName} Template
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload Excel Files</CardTitle>
          <CardDescription>
            Upload three Excel files matching the template structure. Rows will be compared by position (row index) across all three sheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sheet A (Accounts) */}
          <div className="space-y-2">
            <Label htmlFor="fileA" className="text-base font-semibold">{TEMPLATE_SPECS.A.displayName}</Label>
            <div className="flex gap-2">
              <Input
                id="fileA"
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'A', setFileA);
                }}
                disabled={fileA.isValidating || fileA.isParsing}
              />
              {fileA.isValidating && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileA.isParsing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileA.parsed && !fileA.error && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
            {fileA.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileA.error.message}</AlertDescription>
              </Alert>
            )}
            {fileA.parsed && <PreviewTable sheet={fileA.parsed} maxRows={20} />}
          </div>

          {/* Sheet B (Computation) */}
          <div className="space-y-2">
            <Label htmlFor="fileB" className="text-base font-semibold">{TEMPLATE_SPECS.B.displayName}</Label>
            <div className="flex gap-2">
              <Input
                id="fileB"
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'B', setFileB);
                }}
                disabled={fileB.isValidating || fileB.isParsing}
              />
              {fileB.isValidating && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileB.isParsing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileB.parsed && !fileB.error && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
            {fileB.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileB.error.message}</AlertDescription>
              </Alert>
            )}
            {fileB.parsed && <PreviewTable sheet={fileB.parsed} maxRows={20} />}
          </div>

          {/* Sheet C (Winman Data) */}
          <div className="space-y-2">
            <Label htmlFor="fileC" className="text-base font-semibold">{TEMPLATE_SPECS.C.displayName}</Label>
            <div className="flex gap-2">
              <Input
                id="fileC"
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'C', setFileC);
                }}
                disabled={fileC.isValidating || fileC.isParsing}
              />
              {fileC.isValidating && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileC.isParsing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {fileC.parsed && !fileC.error && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
            {fileC.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileC.error.message}</AlertDescription>
              </Alert>
            )}
            {fileC.parsed && <PreviewTable sheet={fileC.parsed} maxRows={20} />}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      {allFilesValid && (
        <ReconcileConfigPanel
          sheetA={fileA.parsed!}
          sheetB={fileB.parsed!}
          sheetC={fileC.parsed!}
          compareColumns={compareColumns}
        />
      )}

      {/* Reconcile Button - Always visible when files are uploaded */}
      {allFilesValid && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button
                onClick={handleReconcile}
                disabled={!canReconcile || isReconciling}
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
              
              {!canReconcile && !isReconciling && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getPrerequisiteMessage()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {reconcileError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{reconcileError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
