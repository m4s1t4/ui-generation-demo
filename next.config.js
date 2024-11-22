/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'files.merca20.com',
      'as-rama.com',
      'i.ytimg.com',
      'centroi.org',
      'www.google.com'
    ],
    // Opcionalmente, puedes configurar un proxy de imágenes
    unoptimized: true
  }
}

module.exports = nextConfig
