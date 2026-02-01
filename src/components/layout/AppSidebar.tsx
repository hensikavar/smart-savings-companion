import { 
  LayoutDashboard, 
  Receipt, 
  CheckSquare, 
  Bell, 
  User,
  LogOut,
  Wallet
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/contexts/ExpenseContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Expenses', url: '/expenses', icon: Receipt },
  { title: 'Checklist', url: '/checklist', icon: CheckSquare },
  { title: 'Alerts', url: '/alerts', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { alerts, upcomingItems } = useExpenses();

  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-200",
          collapsed && "justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg">
            <Wallet className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">SmartExpense</span>
              <span className="text-xs text-sidebar-foreground/70">Track smarter</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                const showBadge = item.title === 'Alerts' && pendingAlerts > 0;
                const showChecklistBadge = item.title === 'Checklist' && upcomingItems > 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "h-11 transition-all duration-200",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 relative">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                        {showBadge && (
                          <Badge 
                            variant="destructive" 
                            className={cn(
                              "ml-auto h-5 min-w-5 px-1.5 text-xs",
                              collapsed && "absolute -top-1 -right-1"
                            )}
                          >
                            {pendingAlerts}
                          </Badge>
                        )}
                        {showChecklistBadge && (
                          <Badge 
                            className={cn(
                              "ml-auto h-5 min-w-5 px-1.5 text-xs bg-warning text-warning-foreground",
                              collapsed && "absolute -top-1 -right-1"
                            )}
                          >
                            {upcomingItems}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "flex-col"
        )}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-primary/20">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
