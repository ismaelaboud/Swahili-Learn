import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navigation/Navbar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { ThemeProvider } from '@/components/theme/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Swahilipot Learn',
  description: 'A modern platform for online education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="h-full relative">
              <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
                <Navbar />
              </div>
              <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50 bg-background border-r">
                <Sidebar />
              </div>
              <main className="md:pl-56 pt-[80px] h-full bg-background">
                {children}
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
