import { TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  spent: number;
  budget: number;
  remaining: number;
}

export function BudgetProgress({ spent, budget, remaining }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = remaining < 0;
  const isWarning = percentage >= 75 && percentage < 100;
  
  const getStatusColor = () => {
    if (isOverBudget) return 'text-destructive';
    if (isWarning) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-destructive';
    if (isWarning) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <Card className="shadow-card border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            isOverBudget ? "bg-destructive/10" : isWarning ? "bg-warning/10" : "bg-success/10"
          )}>
            <Target className={cn("h-4 w-4", getStatusColor())} />
          </div>
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly Progress</span>
            <span className={cn("text-sm font-bold", getStatusColor())}>
              {percentage.toFixed(0)}% used
            </span>
          </div>
          <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                getProgressColor()
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
            {/* Glow effect */}
            <div 
              className={cn(
                "absolute top-0 h-full rounded-full blur-sm opacity-50",
                getProgressColor()
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Spent</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${spent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              of ${budget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} budget
            </p>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border",
            isOverBudget 
              ? "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/10" 
              : "bg-gradient-to-br from-success/5 to-success/10 border-success/10"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {isOverBudget ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <Target className="h-4 w-4 text-success" />
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </span>
            </div>
            <p className={cn("text-2xl font-bold", getStatusColor())}>
              ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isOverBudget ? 'exceeded this month' : 'left to spend'}
            </p>
          </div>
        </div>

        {/* Warning Message */}
        {(isWarning || isOverBudget) && (
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            isOverBudget ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
          )}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {isOverBudget 
                ? "You've exceeded your monthly budget!" 
                : "You're approaching your budget limit"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
