import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { transactionService, UploadPdfResponse } from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function PdfUploadCard({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadPdfResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setStatus('idle');
    } else {
      toast({ title: 'Invalid file', description: 'Please upload a PDF file.', variant: 'destructive' });
      setStatus('idle');
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setResult(null);
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setResult(null);
    setErrorMsg('');

    // Simulate progress since fetch doesn't support progress natively
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 85));
    }, 300);

    try {
      const response = await transactionService.uploadPdf(file);
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data) {
        setResult(response.data);
        setStatus('success');
        toast({
          title: 'PDF processed successfully!',
          description: `${response.data.createdExpensesCount} expenses created from your transactions.`,
        });
        onUploadSuccess?.();
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setStatus('error');
      setErrorMsg(error.message || 'Failed to process PDF');
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <Upload className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Upload Transaction PDF</CardTitle>
            <CardDescription>Import bank statements to auto-create expenses</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300",
            status === 'dragging' && "border-primary bg-primary/5 scale-[1.02]",
            status === 'idle' && !file && "border-border hover:border-primary/50 hover:bg-accent/50",
            file && status !== 'uploading' && "border-primary/30 bg-primary/5",
            status === 'success' && "border-success/30 bg-success/5",
            status === 'error' && "border-destructive/30 bg-destructive/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {status === 'uploading' ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Processing your PDF...</p>
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          ) : status === 'success' && result ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Upload Successful!</p>
                <p className="text-xs text-muted-foreground mt-1">{result.uploadedFileName}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-sm">
                <div className="text-center p-2 rounded-lg bg-card border border-border">
                  <p className="text-lg font-bold text-primary">{result.extractedTransactionsCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Transactions</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-card border border-border">
                  <p className="text-lg font-bold text-success">{result.createdExpensesCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expenses</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-card border border-border">
                  <p className="text-lg font-bold text-foreground">
                    ${result.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-2">
                Upload Another
              </Button>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <p className="text-sm font-medium text-foreground">Upload Failed</p>
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                file ? "bg-primary/10" : "bg-muted"
              )}>
                {file ? (
                  <FileText className="h-7 w-7 text-primary" />
                ) : (
                  <Upload className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {file.name}
                    <button
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your PDF here, or <span className="text-primary underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports bank statements and transaction exports
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload Button */}
        {file && status === 'idle' && (
          <Button
            onClick={handleUpload}
            className="w-full shadow-glow bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Process PDF & Create Expenses
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
