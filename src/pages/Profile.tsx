import { useState } from 'react';
import { User, Mail, Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingsGoal, setSavingsGoal] = useState(user?.monthlySavingsGoal?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateProfile({
        name,
        monthlySavingsGoal: parseFloat(savingsGoal) || 3000,
      });
      
      if (result.success) {
        toast({ title: 'Profile updated successfully' });
      } else {
        toast({
          title: 'Update failed',
          description: result.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardHeader className="text-center pb-2">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">{user?.name}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
      </Card>

      {/* Settings Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Account Settings</CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="savingsGoal">Monthly Savings Goal ($)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="savingsGoal"
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your monthly budget to track spending against
              </p>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              <Save className="mr-2 h-5 w-5" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="shadow-card bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">${user?.monthlySavingsGoal?.toLocaleString() || '3,000'}</p>
              <p className="text-sm opacity-80">Monthly Goal</p>
            </div>
            <div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm opacity-80">Months Active</p>
            </div>
            <div>
              <p className="text-3xl font-bold">$2.5K</p>
              <p className="text-sm opacity-80">Saved This Year</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
