'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MainNav } from './MainNav';

export function Sidebar() {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-x-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              height={40}
              width={40}
              className="dark:hidden"
            />
            <h1 className="text-2xl font-bold">
              LMS
            </h1>
          </div>
        </Link>
      </div>
      <div className="flex flex-col w-full">
        <MainNav />
      </div>
    </div>
  );
}
