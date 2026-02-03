import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useToast } from '@/hooks/use-toast';
import { ExpenseApiData } from '@/services/expenseService';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editExpense?: ExpenseApiData | null;
}

export function AddExpenseDialog({ open, onOpenChange, editExpense }: AddExpenseDialogProps) {
  const { addExpense, updateExpense, categories } = useExpenses();
  const { toast } = useToast();
  
  const [categoryId, setCategoryId] = useState(editExpense?.categoryId || '');
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || '');
  const [expenseType, setExpenseType] = useState<'ONE_TIME' | 'RECURRING'>(
    editExpense?.expenseType || 'ONE_TIME'
  );
  const [description, setDescription] = useState(editExpense?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    editExpense?.expenseDate ? new Date(editExpense.expenseDate) : new Date()
  );
  const [recurrenceType, setRecurrenceType] = useState<'WEEKLY' | 'MONTHLY'>(
    editExpense?.recurrenceType || 'MONTHLY'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or editExpense changes
  useEffect(() => {
    if (open) {
      if (editExpense) {
        setCategoryId(editExpense.categoryId);
        setAmount(editExpense.amount.toString());
        setExpenseType(editExpense.expenseType);
        setDescription(editExpense.description);
        setDate(new Date(editExpense.expenseDate));
        setRecurrenceType(editExpense.recurrenceType || 'MONTHLY');
      } else {
        resetForm();
      }
    }
  }, [open, editExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !amount || !date) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        categoryId,
        amount: parseFloat(amount),
        description,
        expenseDate: format(date, 'yyyy-MM-dd'),
        expenseType,
        recurrenceType: expenseType === 'RECURRING' ? recurrenceType : null,
      };

      if (editExpense) {
        await updateExpense(editExpense.id, expenseData);
        toast({ title: 'Expense updated successfully' });
      } else {
        await addExpense(expenseData);
        toast({ title: 'Expense added successfully' });
      }

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save expense',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setExpenseType('ONE_TIME');
    setDescription('');
    setDate(new Date());
    setRecurrenceType('MONTHLY');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={expenseType} onValueChange={(v: 'ONE_TIME' | 'RECURRING') => setExpenseType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_TIME">One-time</SelectItem>
                <SelectItem value="RECURRING">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {expenseType === 'RECURRING' && (
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={recurrenceType} onValueChange={(v: 'WEEKLY' | 'MONTHLY') => setRecurrenceType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editExpense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
