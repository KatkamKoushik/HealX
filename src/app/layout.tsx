import type { Metadata } from 'next';
import './globals.css';
import APP_CONFIG from '@/config/app-config';
import { LanguageProvider } from '@/i18n/context';
import { AccessibilityProvider } from '@/lib/accessibility/context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Inclusive Healthcare Navigation Platform`,
  description: APP_CONFIG.description,
  keywords: [
    'healthcare navigation',
    'hospital directory',
    'South India',
    'Telugu healthcare',
    'accessible healthcare',
    'SFIC',
    'Swasth Bharat',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-normal" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <LanguageProvider>
          <AccessibilityProvider>
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
