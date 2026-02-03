import { Link } from 'react-router-dom';
import { Receipt, ArrowRight, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpenseApiData } from '@/services/expenseService';
import { cn } from '@/lib/utils';

interface RecentExpensesProps {
  expenses: ExpenseApiData[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses.slice(0, 5);

  return (
    <Card className="shadow-card border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-primary" />
          </div>
          Recent Expenses
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
          <Link to="/expenses" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((expense, index) => (
              <div 
                key={expense.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border border-border/30",
                  "bg-gradient-to-r from-secondary/30 to-transparent hover:from-secondary/50 transition-all duration-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ 
                      backgroundColor: `${expense.categoryColor}15`,
                      border: `1px solid ${expense.categoryColor}30`
                    }}
                  >
                    {expense.categoryIcon || '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {expense.description || expense.categoryName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.categoryName} • {expense.expenseDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    -${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    expense.expenseType === 'RECURRING' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-info/10 text-info"
                  )}>
                    {expense.expenseType === 'RECURRING' ? 'Recurring' : 'One-time'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Receipt className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <p className="font-medium text-muted-foreground">No expenses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start tracking your spending</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
