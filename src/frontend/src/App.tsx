import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadTab from './features/reconcile/UploadTab';
import ResultsTab from './features/reconcile/ResultsTab';
import { ReconciliationResults } from './features/reconcile/types';
import { FileSpreadsheet } from 'lucide-react';

function App() {
  const [results, setResults] = useState<ReconciliationResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');

  const handleReconciliationComplete = (reconciliationResults: ReconciliationResults) => {
    setResults(reconciliationResults);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Excel Reconciliation Tool</h1>
              <p className="text-sm text-muted-foreground">Upload three Excel files and reconcile data across sheets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <UploadTab onReconciliationComplete={handleReconciliationComplete} />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {results && <ResultsTab results={results} />}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with <span className="text-destructive">♥</span> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
