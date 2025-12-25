// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import AppChrome from "./components/AppChrome";
import ThemeWatcher from "./ThemeWatcher";
import AppPrefsProvider from "./components/AppPrefsProvider";

export const metadata = {
  title: "STAQK",
  description: "Modern app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <ThemeWatcher />
          {/* ✅ Wrap the entire real app tree ONCE */}
          <AppPrefsProvider>
            <AppChrome>{children}</AppChrome>
          </AppPrefsProvider>
        </Providers>
      </body>
    </html>
  );
}
