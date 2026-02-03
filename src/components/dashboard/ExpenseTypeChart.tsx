import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftRight, RefreshCcw, Zap } from 'lucide-react';

interface ExpenseTypeChartProps {
  data: { name: string; value: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{payload[0].payload.name}</p>
        <p className="text-primary font-bold text-lg">
          ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function ExpenseTypeChart({ data }: ExpenseTypeChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const recurringPercentage = total > 0 ? Math.round((data[0]?.value || 0) / total * 100) : 0;

  return (
    <Card className="shadow-card border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
            <ArrowLeftRight className="h-4 w-4 text-info" />
          </div>
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap={20}>
              <defs>
                <linearGradient id="recurringGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(222, 47%, 25%)" />
                  <stop offset="100%" stopColor="hsl(222, 60%, 35%)" />
                </linearGradient>
                <linearGradient id="oneTimeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(199, 89%, 48%)" />
                  <stop offset="100%" stopColor="hsl(199, 89%, 58%)" />
                </linearGradient>
              </defs>
              <XAxis 
                type="number" 
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]}
                maxBarSize={40}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? 'url(#recurringGradient)' : 'url(#oneTimeGradient)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recurring</p>
              <p className="font-bold text-primary">{recurringPercentage}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/10">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">One-time</p>
              <p className="font-bold text-info">{100 - recurringPercentage}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
