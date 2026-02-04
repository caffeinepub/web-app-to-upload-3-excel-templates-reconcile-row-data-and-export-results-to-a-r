import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { TEMPLATE_SPECS, TemplateKey } from './templateSpec';
import { validateFileType, validateTemplateStructure, ValidationError } from './fileValidation';
import { parseExcelFile, getSheetNames } from './excelParse';
import { ParsedSheet, ReconciliationResults } from './types';
import PreviewTable from './PreviewTable';
import ReconcileConfigPanel from './ReconcileConfigPanel';
import { validateReconcileConfig } from './configValidation';
import { reconcileData } from './reconcileLocal';

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
      
      // Validate structure (sheet name only at this point)
      const structureError = validateTemplateStructure(sheetNames, [], templateKey);
      if (structureError && structureError.field === 'sheetName') {
        setState(prev => ({ ...prev, error: structureError, isValidating: false }));
        return;
      }

      // Parse the file
      setState(prev => ({ ...prev, isValidating: false, isParsing: true }));
      const parsed = await parseExcelFile(file, spec.sheetName);
      
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

  const handleReconcile = async (config: any) => {
    setReconcileError(null);
    
    // Validate config
    const configError = validateReconcileConfig(config);
    if (configError) {
      setReconcileError(configError.message);
      return;
    }

    if (!fileA.parsed || !fileB.parsed || !fileC.parsed) {
      setReconcileError('All three files must be uploaded and validated before reconciliation');
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
                asChild
              >
                <a href={`/templates/${TEMPLATE_SPECS[key].fileName}`} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Sheet {key} Template
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload Excel Files</CardTitle>
          <CardDescription>Upload three Excel files matching the template structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sheet A */}
          <div className="space-y-2">
            <Label htmlFor="fileA" className="text-base font-semibold">Sheet A</Label>
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

          {/* Sheet B */}
          <div className="space-y-2">
            <Label htmlFor="fileB" className="text-base font-semibold">Sheet B</Label>
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

          {/* Sheet C */}
          <div className="space-y-2">
            <Label htmlFor="fileC" className="text-base font-semibold">Sheet C</Label>
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
          onReconcile={handleReconcile}
          isReconciling={isReconciling}
        />
      )}

      {reconcileError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{reconcileError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
