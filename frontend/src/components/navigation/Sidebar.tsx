'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MainNav } from './MainNav';

export function Sidebar() {
  return (
    <div className="h-full flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-x-2 transition-transform hover:scale-105">
          <Image
            src="/logo.svg"
            alt="Logo"
            height={40}
            width={40}
            className="dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt="Logo"
            height={40}
            width={40}
            className="hidden dark:block"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LMS
          </h1>
        </Link>
      </div>
      <div className="flex flex-col w-full p-4">
        <MainNav />
      </div>
    </div>
  );
}
