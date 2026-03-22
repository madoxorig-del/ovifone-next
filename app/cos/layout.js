export const metadata = {
  title: 'Coșul Meu',
  description:
    'Vizualizează produsele din coșul tău de cumpărături OviFone.',
  openGraph: {
    title: 'Coșul Meu | OviFone',
    description:
      'Vizualizează produsele din coșul tău de cumpărături OviFone.',
    url: '/cos',
  },
  alternates: {
    canonical: '/cos',
  },
};

export default function CosLayout({ children }) {
  return children;
}
