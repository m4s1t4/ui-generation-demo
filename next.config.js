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
  },
  // Añade esta configuración para los source maps
  webpack: (config, { dev, isServer }) => {
    // Solo genera source maps en desarrollo
    if (!dev) {
      config.devtool = false
    } else {
      config.devtool = 'eval-source-map'
    }
    return config
  }
}

module.exports = nextConfig
