import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

const CSS_VERSION = Date.now();

export const metadata = {
  title: 'Ovifone - Telefoane Verificate',
  description: 'Cumpără sau vinde telefoane verificate, cu garanție 12 luni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <link rel="stylesheet" href={`/style.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/navbar.css?v=${CSS_VERSION}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={`/vindestyle.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/tstyle.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/pstyle.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/cautare.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/contstyle.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/cstyle.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/checkout.css?v=${CSS_VERSION}`} />
        <link rel="stylesheet" href={`/carttoast.css?v=${CSS_VERSION}`} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}