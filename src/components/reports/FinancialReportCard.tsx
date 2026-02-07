import { useState } from 'react';
import { Calendar, Download, FileBarChart, Loader2, TrendingDown, TrendingUp, Target, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { transactionService, GenerateReportResponse } from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

export function FinancialReportCard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GenerateReportResponse | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast({ title: 'Missing dates', description: 'Please select both start and end dates.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await transactionService.generateReport(startDate, endDate);
      if (response.success && response.data) {
        setReport(response.data);
        toast({ title: 'Report generated!', description: 'Your financial report is ready to download.' });
      }
    } catch (error: any) {
      toast({ title: 'Report generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report?.reportPdfUrl) return;
    const url = transactionService.getReportDownloadUrl(report.reportPdfUrl);
    window.open(url, '_blank');
  };

  const spendingPercentage = report?.summary.spendingPercentage ?? 0;
  const isOverBudget = spendingPercentage > 100;

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-chart-3 to-chart-2 flex items-center justify-center shadow-sm">
            <FileBarChart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Financial Report</CardTitle>
            <CardDescription>Generate detailed spending analysis as PDF</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !startDate || !endDate}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-glow"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileBarChart className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>

        {/* Report Results */}
        {report && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary Header */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 via-accent/30 to-primary/10 border border-border/50 p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                Report Period: {report.summary.reportPeriod}
              </p>

              {/* Budget Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Budget Usage</span>
                  <span className={cn(
                    "font-semibold",
                    isOverBudget ? "text-destructive" : spendingPercentage > 80 ? "text-warning" : "text-success"
                  )}>
                    {spendingPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(spendingPercentage, 100)} 
                  className={cn(
                    "h-2.5 rounded-full",
                    isOverBudget && "[&>div]:bg-destructive",
                    !isOverBudget && spendingPercentage > 80 && "[&>div]:bg-warning"
                  )} 
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-card/80 border border-border/40">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive mr-1" />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    ${report.summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/80 border border-border/40">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-3.5 w-3.5 text-primary mr-1" />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    ${report.summary.monthlyGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goal</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/80 border border-border/40">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-success mr-1" />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    ${report.summary.savingsLeft.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Savings</p>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            {report.topCategories && report.topCategories.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Top Spending Categories</p>
                </div>
                <div className="space-y-2">
                  {report.topCategories.slice(0, 5).map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-foreground truncate">{cat.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary w-10 text-right">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <Button onClick={handleDownload} variant="outline" className="w-full group">
              <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
              Download Report PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
