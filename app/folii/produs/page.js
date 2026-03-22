import { createClient } from '@supabase/supabase-js';
import ProductClient from './ProductClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const id = params?.id;
  if (!id) {
    return {
      title: 'Produs',
      description: 'Vizualizare produs OviFone',
    };
  }

  try {
    const { data: produs } = await supabase
      .from('produse')
      .select('nume, brand, pret, descriere, imagine_url, stare, stocare')
      .eq('id', id)
      .single();

    if (!produs) {
      return {
        title: 'Produs negăsit',
        description: 'Produsul căutat nu a fost găsit pe OviFone.',
      };
    }

    const pretFormatat = produs.pret ? produs.pret.toLocaleString('ro-RO') : '';
    const stare = produs.stare || 'Nou';
    const descriereScurta = produs.descriere
      ? produs.descriere.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
      : `${produs.nume} - ${stare}, disponibil la OviFone cu garanție 12 luni. Preț: ${pretFormatat} lei.`;

    const categoryPath = 'folii';

    return {
      title: `${produs.nume} - ${pretFormatat} lei`,
      description: descriereScurta,
      openGraph: {
        title: `${produs.nume} | OviFone`,
        description: descriereScurta,
        url: `/${categoryPath}/produs?id=${id}`,
        images: produs.imagine_url ? [{ url: produs.imagine_url, width: 800, height: 800, alt: produs.nume }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${produs.nume} | OviFone`,
        description: descriereScurta,
        images: produs.imagine_url ? [produs.imagine_url] : [],
      },
      alternates: {
        canonical: `/${categoryPath}/produs?id=${id}`,
      },
    };
  } catch (e) {
    return {
      title: 'Produs | OviFone',
      description: 'Produse verificate și testate cu garanție 12 luni.',
    };
  }
}

export default function ProdusPage() {
  return <ProductClient />;
}
