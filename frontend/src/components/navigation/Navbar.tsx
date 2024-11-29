'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { MobileSidebar } from './MobileSidebar';

export function Navbar() {
  const { user } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MobileSidebar />
        <div className="flex items-center justify-end space-x-4 w-full">
          {!user && (
            <>
              <Link href="/login">
                <Button variant="ghost">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button>
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
