import { useMemo } from 'react';
import { DollarSign, TrendingDown, CalendarCheck, Plus, CheckSquare, Sparkles, ArrowUpRight } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { ExpenseTypeChart } from '@/components/dashboard/ExpenseTypeChart';
import { UpcomingPayments } from '@/components/dashboard/UpcomingPayments';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { expenses, totalExpenses, savingsLeft, upcomingItems, checklist, loading } = useExpenses();
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

  const budget = user?.monthlySavingsGoal || 3000;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Here's your financial overview for this month
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/checklist">
              <CheckSquare className="mr-2 h-4 w-4" />
              Checklist
            </Link>
          </Button>
          <Button asChild className="shadow-glow bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity">
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
          title="Total Spent"
          value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${savingsPercentage}% of monthly budget`}
          icon={DollarSign}
          variant="primary"
        />
        <SummaryCard
          title="Remaining Budget"
          value={`$${Math.max(0, savingsLeft).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={savingsLeft < 0 ? 'Over budget!' : 'Available this month'}
          icon={TrendingDown}
          variant={savingsLeft < 0 ? 'danger' : savingsLeft < budget * 0.2 ? 'warning' : 'success'}
        />
        <SummaryCard
          title="Pending Payments"
          value={upcomingItems}
          subtitle="Upcoming checklist items"
          icon={CalendarCheck}
          variant="default"
        />
      </div>

      {/* Budget Progress - Full Width */}
      <BudgetProgress 
        spent={totalExpenses} 
        budget={budget} 
        remaining={savingsLeft} 
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={categoryData} />
        <ExpenseTypeChart data={typeData} />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentExpenses expenses={expenses} />
        <UpcomingPayments items={upcomingChecklist} />
      </div>
    </div>
  );
}
