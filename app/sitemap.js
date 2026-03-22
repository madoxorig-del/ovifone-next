import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const BASE_URL = 'https://ovifone-next.vercel.app'

const categoryMap = {
  telefoane: '/telefoane/produs',
  tablete: '/tablete/produs',
  casti: '/casti/produs',
  accesorii: '/accesorii/produs',
  huse: '/huse/produs',
  folii: '/folii/produs',
}

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/telefoane`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/tablete`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/casti`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/accesorii`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/huse`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/folii`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/vinde`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/toate`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/cautare`, changeFrequency: 'weekly', priority: 0.5 },
  ]

  // Legal pages
  const legalPages = [
    { url: `${BASE_URL}/politica`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/termeni-si-conditii`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic product pages from Supabase
  let productPages = []
  try {
    const { data: products, error } = await supabase
      .from('produse')
      .select('id, categorie, updated_at')

    if (!error && products) {
      productPages = products.map((product) => {
        const categorie = (product.categorie || '').toLowerCase()
        const basePath = categoryMap[categorie] || '/telefoane/produs'
        return {
          url: `${BASE_URL}${basePath}?id=${product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        }
      })
    }
  } catch (e) {
    // If Supabase fetch fails, return sitemap without products
    console.error('Sitemap: Failed to fetch products', e)
  }

  return [...staticPages, ...legalPages, ...productPages]
}
