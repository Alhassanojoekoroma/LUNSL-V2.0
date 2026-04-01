"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Search, 
  Bot, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp, 
  Coins, 
  Users, 
  Settings,
  Upload,
  FolderOpen,
  BarChart,
  Send,
  FileText,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { STUDENT_NAV_ITEMS, LECTURER_NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/lib/constants'
import { CustomIcon, ICON_NAMES } from '@/components/custom-icon'

// Map of navigation icon names to custom icon files
// If a custom icon exists, it will be used; otherwise falls back to Lucide
const customIconMap: Record<string, string | null> = {
  LayoutDashboard: 'Dashboard Icon',
  Search: 'Search icon',
  Bot: 'AI bot icon ',
  Calendar: 'Schedule icon ',
  CheckSquare: null, // Use Lucide fallback
  MessageSquare: 'Notification Icon',
  TrendingUp: 'My Progress icon',
  Coins: null, // Use Lucide fallback
  Users: null, // Use Lucide fallback
  Settings: 'Setting icon',
  Upload: null, // Use Lucide fallback
  FolderOpen: null, // Use Lucide fallback
  BarChart: null, // Use Lucide fallback
  Send: null, // Use Lucide fallback
  FileText: null, // Use Lucide fallback
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Search,
  Bot,
  Calendar,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Coins,
  Users,
  Settings,
  Upload,
  FolderOpen,
  BarChart,
  Send,
  FileText,
}

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const navItems = 
    user.role === 'student' ? STUDENT_NAV_ITEMS :
    user.role === 'lecturer' ? LECTURER_NAV_ITEMS :
    ADMIN_NAV_ITEMS

  const handleLogout = () => {
    logout()
    window.location.href = '/setup'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">LUSL Notepad</h1>
                <p className="text-xs text-muted-foreground capitalize">{user.role} Portal</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const lucideIcon = item.icon as keyof typeof iconMap
                const Icon = iconMap[lucideIcon] || LayoutDashboard
                const customIconName = customIconMap[lucideIcon]
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onToggle()
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    {customIconName ? (
                      <CustomIcon name={customIconName} size={20} className="flex-shrink-0" />
                    ) : (
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role === 'student' && user.faculty && user.semester
                    ? `${user.faculty} - Semester ${user.semester}`
                    : user.role === 'lecturer' && user.faculty
                    ? user.faculty
                    : user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={handleLogout}
            >
              <CustomIcon name="Log out" size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-30 lg:hidden"
        onClick={onToggle}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  )
}
