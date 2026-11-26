import {preload} from 'react-dom';
import './fonts.css';
import "./globals.css";
import {appOrigin} from '@/lib/app-origin.mjs';

// Page-specific stylesheets are imported by the components that use them, so each
// route only downloads its own CSS. The faces below appear above the fold.
const criticalFonts=['cormorant-garamond-latin-500-normal','cormorant-garamond-latin-500-italic','poppins-latin-400-normal','poppins-latin-600-normal'];

function siteOrigin(){
  try{return new URL(appOrigin());}catch{return undefined;}
}

export const metadata = {
  metadataBase: siteOrigin(),
  title: "Tableline · Restaurant workspace",
  description: "Manage your restaurant branches, menus, tables, and QR codes in one workspace.",
};

export default function RootLayout({ children }) {
  for(const font of criticalFonts)preload(`/fonts/${font}.woff2`,{as:'font',type:'font/woff2',crossOrigin:'anonymous'});
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
