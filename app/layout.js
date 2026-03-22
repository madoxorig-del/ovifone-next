import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

const CSS_VERSION = Date.now();

export const metadata = {
  metadataBase: new URL('https://ovifone-next.vercel.app'),
  title: {
    default: 'OviFone - Telefoane Verificate | Ne-recondiționate cu Garanție',
    template: '%s | OviFone',
  },
  description:
    'Magazin online de telefoane ne-recondiționate, verificate și cu garanție 12 luni. Cumpără sau vinde telefoane, tablete, căști și accesorii la cele mai bune prețuri din România.',
  keywords: [
    'telefoane verificate',
    'telefoane ne-recondiționate',
    'telefoane cu garanție',
    'magazin telefoane România',
    'OviFone',
    'cumpără telefon',
    'vinde telefon',
    'tablete',
    'căști',
    'accesorii telefoane',
    'huse telefon',
    'folii protecție',
  ],
  openGraph: {
    title: 'OviFone - Telefoane Verificate | Ne-recondiționate cu Garanție',
    description:
      'Magazin online de telefoane ne-recondiționate, verificate și cu garanție 12 luni. Cumpără sau vinde la cele mai bune prețuri.',
    url: '/',
    siteName: 'OviFone',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OviFone - Telefoane Verificate | Ne-recondiționate cu Garanție',
    description:
      'Magazin online de telefoane ne-recondiționate, verificate și cu garanție 12 luni.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "OviFone",
            "description": "Magazin de telefoane ne-recondiționate, verificate și testate, cu garanție 12 luni.",
            "url": "https://ovifone-next.vercel.app",
            "telephone": "+40 738 700 777",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Bulevardul Iuliu Maniu 73",
              "addressLocality": "București",
              "addressCountry": "RO"
            },
            "priceRange": "$$",
            "openingHours": "Mo-Fr 09:00-18:00",
            "sameAs": [
              "https://www.tiktok.com/@ovifone.ro",
              "https://www.instagram.com/ovifone.ro/",
              "https://www.facebook.com/p/OviFone-61570584362315/"
            ]
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "OviFone",
            "url": "https://ovifone-next.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ovifone-next.vercel.app/cautare?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }) }}
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}