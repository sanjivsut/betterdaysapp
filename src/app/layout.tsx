import type { Metadata, Viewport } from 'next';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import './globals.css';
import { siteConfig } from '@/config/site';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.shortName,
  },
  // favicon + apple-touch-icon come from src/app/icon.svg and
  // src/app/apple-icon.png (Next file conventions).
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Set the theme class before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('bd-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

// Capture the install prompt as early as possible — the event can fire before
// React hydrates. Components read window.__bdInstallEvent via useInstall().
const pwaScript = `(function(){try{window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bdInstallEvent=e;window.dispatchEvent(new Event('bd:installable'));});window.addEventListener('appinstalled',function(){window.__bdInstallEvent=null;window.dispatchEvent(new Event('bd:installed'));});}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: pwaScript }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <ServiceWorkerRegister />
        <OfflineIndicator />
      </body>
    </html>
  );
}
