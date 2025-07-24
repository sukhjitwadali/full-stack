import './globals.css';
import NavBar from '@/components/NavBar';
import SessionWrapper from '@/components/SessionWrapper';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/brain.js@2.0.0-beta.23/dist/brain-browser.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
        <SessionWrapper>
          <NavBar />
          <main className="flex-1 p-6">{children}</main>
          <footer className="mt-auto bg-white p-4 text-center text-sm border-t">
            &copy; 2025 MERN Full-Stack Tutorial
          </footer>
        </SessionWrapper>
      </body>
    </html>
  );
}
