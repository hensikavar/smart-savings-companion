import { FileBarChart, Upload, ArrowUpRight } from 'lucide-react';
import { PdfUploadCard } from '@/components/reports/PdfUploadCard';
import { FinancialReportCard } from '@/components/reports/FinancialReportCard';
import { useExpenses } from '@/contexts/ExpenseContext';

export default function Reports() {
  const { refreshExpenses } = useExpenses();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-3 to-chart-2 flex items-center justify-center shadow-sm">
            <FileBarChart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Import</h1>
            <p className="text-muted-foreground">
              Upload bank statements or generate financial reports
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <PdfUploadCard onUploadSuccess={refreshExpenses} />
        </div>

        {/* Report Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
          <FinancialReportCard />
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-accent/30 to-background p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Smart PDF Import</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload your bank statement PDF and our system will automatically extract transactions, 
                categorize them, and create expense entries — saving you hours of manual data entry.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <FileBarChart className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Detailed Reports</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate comprehensive financial reports with spending breakdowns, 
                category analysis, and budget tracking — downloadable as professional PDF documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
