import { useMemo } from 'react';
import { DollarSign, TrendingDown, CalendarCheck, Plus, Receipt, CheckSquare } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const CHART_COLORS = [
  'hsl(168, 84%, 40%)', // primary teal
  'hsl(199, 89%, 48%)', // blue
  'hsl(262, 83%, 58%)', // purple
  'hsl(38, 92%, 50%)',  // orange
  'hsl(0, 84%, 60%)',   // red
  'hsl(142, 76%, 36%)', // green
];

export default function Dashboard() {
  const { expenses, totalExpenses, savingsLeft, upcomingItems, checklist } = useExpenses();
  const { user } = useAuth();

  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, exp) => {
      const categoryName = exp.categoryName || 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  const typeData = useMemo(() => {
    const recurring = expenses.filter(e => e.expenseType === 'RECURRING').reduce((sum, e) => sum + e.amount, 0);
    const oneTime = expenses.filter(e => e.expenseType === 'ONE_TIME').reduce((sum, e) => sum + e.amount, 0);
    return [
      { name: 'Recurring', value: recurring },
      { name: 'One-time', value: oneTime },
    ];
  }, [expenses]);

  const upcomingChecklist = useMemo(() => 
    checklist.filter(i => i.status === 'pending').slice(0, 4),
    [checklist]
  );

  const savingsPercentage = user?.monthlySavingsGoal 
    ? Math.round((totalExpenses / user.monthlySavingsGoal) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your financial overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/checklist">
              <CheckSquare className="mr-2 h-4 w-4" />
              Add Checklist
            </Link>
          </Button>
          <Button asChild>
            <Link to="/expenses">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${savingsPercentage}% of monthly budget`}
          icon={DollarSign}
          variant="primary"
        />
        <SummaryCard
          title="Savings Left"
          value={`$${Math.max(0, savingsLeft).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={savingsLeft < 0 ? 'Over budget!' : 'Remaining this month'}
          icon={TrendingDown}
          variant={savingsLeft < 0 ? 'danger' : savingsLeft < (user?.monthlySavingsGoal || 0) * 0.2 ? 'warning' : 'success'}
        />
        <SummaryCard
          title="Upcoming Items"
          value={upcomingItems}
          subtitle="Pending checklist items"
          icon={CalendarCheck}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recurring vs One-time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    fill="hsl(168, 84%, 40%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Checklist */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Payments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/checklist">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingChecklist.length > 0 ? (
            <div className="space-y-4">
              {upcomingChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <CalendarCheck className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                  </div>
                  <p className="font-semibold">${item.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming payments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
