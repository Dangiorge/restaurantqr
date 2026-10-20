import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import "./globals.css";
import './romina.css';
import './guest-menu.css';
import './brand-intro.css';
import './guest-discovery.css';
import './guest-actions.css';
import './guest-appearance.css';
import './guest-dishes.css';

export const metadata = {
  title: "Tableline · Restaurant workspace",
  description: "Manage your restaurant branches, menus, tables, and QR codes in one workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
