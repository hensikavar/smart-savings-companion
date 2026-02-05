import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useToast } from '@/hooks/use-toast';

export default function Checklist() {
  const { checklist, categories, addChecklistItem, toggleChecklistStatus, deleteChecklistItem, checklistLoading } = useExpenses();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId || !amount || !dueDate) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addChecklistItem({
        name,
        categoryId,
        amount: parseFloat(amount),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
      });

      toast({ title: 'Checklist item added' });
      setName('');
      setCategoryId('');
      setAmount('');
      setDueDate(undefined);
      setShowForm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add checklist item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingItems = checklist.filter(i => i.status === 'PENDING');
  const completedItems = checklist.filter(i => i.status === 'COMPLETED');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recurring Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recurring payments and bills
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Add New Checklist Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Rent Payment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Items */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Circle className="h-5 w-5 text-warning" />
            Pending ({pendingItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklistLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingItems.length > 0 ? (
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => toggleChecklistStatus(item.id)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="mr-1">{item.categoryIcon}</span>
                      {item.categoryName} • Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">${item.amount.toFixed(2)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => deleteChecklistItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending items</p>
          )}
        </CardContent>
      </Card>

      {/* Completed Items */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Completed ({completedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedItems.length > 0 ? (
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 opacity-75 group"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => toggleChecklistStatus(item.id)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-through">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="mr-1">{item.categoryIcon}</span>
                      {item.categoryName} • Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="font-semibold text-lg line-through">${item.amount.toFixed(2)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => deleteChecklistItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No completed items</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
