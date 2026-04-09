# 🎣 CDF-LAMORAÑA

Sitio web oficial de la **Sociedad Deportiva de Pesca CDF-LAMORAÑA**.

[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&style=flat-square)](https://cdf-lamorana.vercel.app/)
[![Astro](https://img.shields.io/badge/Astro%205-FF5D01?logo=astro&logoColor=fff&style=flat-square)](https://astro.build/)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=000&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?logo=tailwindcss&logoColor=fff&style=flat-square)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-FFB900?logo=bun&logoColor=000&style=flat-square)](https://bun.sh/)

---

## 🚀 Tech Stack

| Componente | Tecnología | Detalles |
|:---|:---|:---|
| **Frontend** | Astro 5, React 19 | Rendimiento optimizado con SSR |
| **Estilos** | Tailwind CSS v4 | Responsive design moderno |
| **Gestor de paquetes** | Bun | Rápido y eficiente |
| **Backend** | PocketBase | Base de datos real-time |
| **Hosting Backend** | Railway | Desplegado en la nube |
| **Hosting Frontend** | Vercel | CI/CD automático |

---

## 📦 Inicio rápido

### Requisitos previos
- [Bun](https://bun.sh/) instalado (v1.0+)
- Node.js 18+ (opcional, para compatibilidad)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd CDF-LAMORAÑA

# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev
```

El servidor estará disponible en **http://localhost:4321** 🌐

---

## 🛠️ Comandos disponibles

```bash
bun install       # Instala las dependencias
bun dev           # Dev server en localhost:4321
bun build         # Type-check + build a ./dist/
bun preview       # Previsualiza la build de producción
bun astro check   # Verifica tipos de TypeScript y Astro
```

---

## ⚙️ Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend PocketBase (Railway o local)
PUBLIC_POCKETBASE_URL=https://your-railway-url.railway.app

# Credenciales de administrador
PUBLIC_ADMIN_USER=admin
PUBLIC_ADMIN_PASSWORD=tu_contraseña_segura
```

Para referencia, consulta [`.env.example`](./.env.example).

**Variables disponibles:**
- `PUBLIC_POCKETBASE_URL` — URL del servidor PocketBase en Railway (local: `http://127.0.0.1:8090`)
- `PUBLIC_ADMIN_USER` — Usuario para acceso al área de administración
- `PUBLIC_ADMIN_PASSWORD` — Contraseña de administrador

---

## 🗄️ Backend: PocketBase + Railway

El backend está basado en **PocketBase** y está desplegado en **Railway**.

📦 **Repositorio backend:** [srg1995/pocketbase-railway](https://github.com/srg1995/pocketbase-railway)

### Collections disponibles

| Colección | Campos |
|:---|:---|
| **pescadores** | `nombre`, `apellido1`, `apellido2`, `dni`, `num_federativa`, `num_licencia`, `anio_nacimiento` |

### Usar PocketBase localmente

Para desarrollo local, clona el repo del backend y ejecuta:

```bash
git clone https://github.com/srg1995/pocketbase-railway.git
cd pocketbase-railway
./pocketbase serve
```

Luego actualiza en `.env`:
```env
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

---

## 🏗️ Arquitectura

### Estructura del proyecto

```
src/
├── pages/
│   ├── index.astro              # Página principal
│   ├── clasificaciones.astro    # Clasificaciones
│   ├── eventos.astro            # Eventos
│   ├── pescadores.astro         # Listado de pescadores
│   ├── servicios.astro          # Servicios
│   ├── contacto.astro           # Contacto
│   ├── sobre-nosotros.astro     # Acerca de
│   ├── cookies.astro            # Política de cookies
│   ├── privacidad.astro         # Política de privacidad
│   └── admin/                   # Área administrativa
│       ├── login.astro          # Login
│       ├── index.astro          # Dashboard
│       └── jornadas.astro       # Gestión de jornadas
├── components/
│   ├── react/                   # Componentes React (client-side)
│   └── astro/                   # Componentes Astro (static)
├── layouts/
│   └── Layout.astro             # Layout principal
├── lib/
│   └── pocketbase.ts            # Cliente PocketBase
└── styles/
    └── global.css               # Estilos globales
```

### Dos áreas distintas

| Área | Propósito | Ruta | Características |
|:---|:---|:---|:---|
| **Público** | Sitio web de la sociedad | `/` | SEO optimizado, theme claro |
| **Admin** | Panel de administración | `/admin/` | Autenticado, tema oscuro, sin indexar |

---

## 🔐 Autenticación Admin

El área de administración está protegida por autenticación de cliente:

- **Método:** `sessionStorage` + variables de entorno
- **Credenciales:** Definidas en `PUBLIC_ADMIN_USER` y `PUBLIC_ADMIN_PASSWORD`
- **Meta tags:** `noindex, nofollow` en páginas admin

---

## 🚀 Despliegue

### Frontend (Vercel)

Este repositorio está conectado a **Vercel** con CI/CD automático:

- **URL en vivo:** https://cdf-lamorana.vercel.app/
- **Rama principal:** `master` → Deploy automático

Cada push a `master` dispara un nuevo deploy.

### Backend (Railway)

Consulta el repositorio [srg1995/pocketbase-railway](https://github.com/srg1995/pocketbase-railway) para instrucciones de despliegue en Railway.

---

## 📝 Convenciones de código

- ✅ **Path alias:** `@/` → `src/` (configurado en `tsconfig.json`)
- ✅ **Sin `any`:** TypeScript estricto en todos los archivos `.ts` y `.tsx`
- ✅ **React islands:** Componentes interactivos usan `client:load`
- ✅ **Tailwind v4:** Configuración inline sin archivo `tailwind.config`

---

## 📄 Licencia

Este proyecto pertenece a la Sociedad Deportiva de Pesca CDF-LAMORAÑA.

---

## 👤 Autor

Desarrollado por **Sergio Sacristán**

---

<div align="center">

**🎣 Hecha en Astro con ❤️ para CDF-LAMORAÑA**

</div>
