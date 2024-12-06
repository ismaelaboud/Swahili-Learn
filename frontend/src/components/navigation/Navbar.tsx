'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { MobileSidebar } from './MobileSidebar';
import { ThemeToggle } from '../theme/theme-toggle';

export function Navbar() {
  const { user } = useAuth();

  return (
    <div className="h-full">
      <div className="flex h-full items-center px-6 justify-between">
        <div className="flex items-center gap-x-4">
          <MobileSidebar />
          <Link href="/" className="flex items-center gap-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Swahilipot Learn
            </span>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <ThemeToggle />
          {!user && (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-accent">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </Link>
            </>
          )}
          {user && (
            <UserNav />
          )}
        </div>
      </div>
    </div>
  );
}
