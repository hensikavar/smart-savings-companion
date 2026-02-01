import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ExpenseProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1" />
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <Outlet />
            </main>
          </SidebarInset>
        </div>

        {/* Floating Add Button */}
        <Button
          onClick={() => setShowAddExpense(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AddExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />
      </SidebarProvider>
    </ExpenseProvider>
  );
}
