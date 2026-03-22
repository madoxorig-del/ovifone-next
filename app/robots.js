export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/cos', '/checkout', '/plata', '/cont'],
      },
    ],
    sitemap: 'https://ovifone-next.vercel.app/sitemap.xml',
  }
}
