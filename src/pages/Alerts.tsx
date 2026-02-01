import { format } from 'date-fns';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExpenses } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const alertStyles = {
  warning: 'border-l-4 border-l-warning bg-warning/5',
  danger: 'border-l-4 border-l-destructive bg-destructive/5',
  info: 'border-l-4 border-l-primary bg-primary/5',
};

const iconStyles = {
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-primary',
};

export default function Alerts() {
  const { alerts, dismissAlert } = useExpenses();

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const seenAlerts = alerts.filter(a => a.status === 'seen');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Stay informed about your spending and upcoming payments
        </p>
      </div>

      {/* Active Alerts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Active Alerts ({pendingAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAlerts.length > 0 ? (
            <div className="space-y-4">
              {pendingAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg transition-all",
                      alertStyles[alert.type]
                    )}
                  >
                    <div className={cn("mt-0.5", iconStyles[alert.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(alert.date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize",
                          alert.type === 'warning' && 'border-warning text-warning',
                          alert.type === 'danger' && 'border-destructive text-destructive',
                          alert.type === 'info' && 'border-primary text-primary'
                        )}
                      >
                        {alert.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-16 w-16 mb-4 text-success opacity-50" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No pending alerts at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dismissed Alerts */}
      {seenAlerts.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
              <Bell className="h-5 w-5" />
              Dismissed ({seenAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seenAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div 
                    key={alert.id} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 opacity-60"
                  >
                    <div className="mt-0.5 text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(alert.date), 'PPP')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      Dismissed
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
