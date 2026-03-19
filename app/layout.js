import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Ovifone - Telefoane Verificate',
  description: 'Cumpără sau vinde telefoane verificate, cu garanție 12 luni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/navbar.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/vindestyle.css" />
        <link rel="stylesheet" href="/tstyle.css" />
        <link rel="stylesheet" href="/pstyle.css" />
        <link rel="stylesheet" href="/cautare.css" />
        <link rel="stylesheet" href="/contstyle.css" />
        <link rel="stylesheet" href="/cstyle.css" />
        <link rel="stylesheet" href="/checkout.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}