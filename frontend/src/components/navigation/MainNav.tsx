'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Compass,
  Layout,
  List,
  BookOpen,
  Settings,
  GraduationCap,
} from 'lucide-react';

const guestRoutes = [
  {
    label: 'Home',
    href: '/',
    icon: Layout,
  },
  {
    label: 'Browse',
    href: '/browse',
    icon: Compass,
  },
];

const studentRoutes = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Layout,
  },
  {
    label: 'Browse Courses',
    href: '/browse',
    icon: Compass,
  },
  {
    label: 'My Learning',
    href: '/learning',
    icon: BookOpen,
  },
  {
    label: 'Progress',
    href: '/progress',
    icon: BarChart,
  },
];

const instructorRoutes = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Layout,
  },
  {
    label: 'My Courses',
    href: '/instructor/courses',
    icon: List,
  },
  {
    label: 'Analytics',
    href: '/instructor/analytics',
    icon: BarChart,
  },
  {
    label: 'Students',
    href: '/instructor/students',
    icon: GraduationCap,
  },
  {
    label: 'Settings',
    href: '/instructor/settings',
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isInstructor = user?.role === 'INSTRUCTOR';
  const routes = user 
    ? (isInstructor ? instructorRoutes : studentRoutes)
    : guestRoutes;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-300 hover:scale-105',
                pathname === route.href 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn(
                  "h-5 w-5 mr-3 transition-transform group-hover:rotate-3",
                  pathname === route.href ? "text-white" : "text-gray-500 dark:text-gray-400"
                )} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {user && (
        <div className="p-3">
          <Button 
            variant="outline" 
            className="w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
            onClick={logout}
          >
            <Settings className="h-5 w-5 mr-3 transition-transform hover:rotate-90" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
