// src/app/layout.js
import './globals.css';
import AppChrome from './components/AppChrome';

export const metadata = {
  title: 'STAQK',
  description: 'Modern app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
