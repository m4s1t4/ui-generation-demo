# UI Generation Demo 🎨 ✨

## Vista General 🌟

Este proyecto es una demostración de generación de interfaces de usuario utilizando tecnologías modernas. Construido con Next.js 14, aprovecha las últimas características y mejores prácticas en desarrollo web.

### Características Principales ⭐

- ⚡ **Rendimiento Optimizado**: Construido con Next.js 14 App Router
- 🎨 **UI Moderna**: Diseño responsive y atractivo
- 🔒 **Seguridad Integrada**: Implementación de mejores prácticas de seguridad
- 📱 **Experiencia Mobile-First**: Diseñado pensando en dispositivos móviles
- 🌐 **Internacionalización**: Soporte para múltiples idiomas

## Tecnologías Utilizadas 🛠️

- [Next.js 14](https://nextjs.org/) - Framework de React
- [React](https://reactjs.org/) - Biblioteca de UI
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Shadcn UI](https://ui.shadcn.com/) - Componentes de UI
- [Radix UI](https://www.radix-ui.com/) - Primitivos de UI accesibles

## Inicio Rápido 🚀

### Prerrequisitos 📋

- Node.js 18.x o superior
- npm, yarn, o pnpm

### Instalación 💻

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd ui-generation-demo
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. Configura las variables de entorno:

Crea un archivo `.env.local` en la raíz del proyecto y configura las siguientes variables:

```bash
# OpenAI API - https://platform.openai.com/account/api-keys
OPENAI_API_KEY=tu_api_key_de_openai

# XAI API
XAI_API_KEY=tu_xai_api_key

# Auth Secret - Genera uno en https://generate-secret.vercel.app/32
AUTH_SECRET=tu_auth_secret

# Supabase - https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
POSTGRES_URL=tu_postgres_url

# Tavily API - https://app.tavily.com/home
TAVILY_API_KEY=tu_tavily_api_key

# Serper API (para búsqueda de videos) - https://serper.dev/api-key
SERPER_API_KEY=tu_serper_api_key

# Variables Opcionales
# Descomenta y configura según necesites
# GOOGLE_GENERATIVE_AI_API_KEY=
# ANTHROPIC_API_KEY=
# GROQ_API_KEY=
# OLLAMA_BASE_URL=
# AZURE_API_KEY=
# AZURE_RESOURCE_NAME=
# ENABLE_SHARE=
# JINA_API_KEY=
```

> ⚠️ **IMPORTANTE**: Nunca compartas o subas tus claves API a repositorios públicos.

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Estructura del Proyecto 📁

```
ui-generation-demo/
├── app/              # Directorio principal de la aplicación
├── components/       # Componentes reutilizables
├── lib/             # Utilidades y configuraciones
├── public/          # Archivos estáticos
└── styles/          # Estilos globales
```

## Contribución 🤝

Las contribuciones son siempre bienvenidas. Por favor, lee nuestras guías de contribución antes de enviar un pull request.

## Licencia 📄

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte 💬

Si tienes alguna pregunta o necesitas ayuda:
- 📧 Abre un issue
- 💻 Revisa la documentación
- 🌟 Dale una estrella al proyecto si te ha sido útil

---

Desarrollado con ❤️ usando [Next.js](https://nextjs.org/) y desplegado en [Vercel](https://vercel.com/).
