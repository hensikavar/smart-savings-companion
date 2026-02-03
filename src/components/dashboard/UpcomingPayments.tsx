import { Link } from 'react-router-dom';
import { CalendarCheck, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChecklistItem } from '@/types/expense';
import { cn } from '@/lib/utils';

interface UpcomingPaymentsProps {
  items: ChecklistItem[];
}

export function UpcomingPayments({ items }: UpcomingPaymentsProps) {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyStyle = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days <= 2) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (days <= 5) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-info/10 text-info border-info/20';
  };

  return (
    <Card className="shadow-card border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <CalendarCheck className="h-4 w-4 text-warning" />
          </div>
          Upcoming Payments
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
          <Link to="/checklist" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => {
              const daysUntil = getDaysUntilDue(item.dueDate);
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    "bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-secondary/70 hover:to-secondary/50"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center border",
                      getUrgencyStyle(item.dueDate)
                    )}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-muted-foreground">{item.category}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className={cn(
                          "text-sm font-medium",
                          daysUntil <= 2 ? 'text-destructive' : 
                          daysUntil <= 5 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                          {daysUntil === 0 ? 'Due today' : 
                           daysUntil === 1 ? 'Due tomorrow' : 
                           daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                           `In ${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.dueDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <p className="font-medium text-muted-foreground">No upcoming payments</p>
            <p className="text-sm text-muted-foreground mt-1">Add items to your checklist</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
