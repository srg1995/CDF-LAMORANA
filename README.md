# CDF-LAMORAÑA

Sitio web de la Sociedad Deportiva de Pesca CDF-LAMORAÑA, construido con **Astro 5** + **React 19** + **Tailwind CSS v4**, usando **Bun** como gestor de paquetes. Backend basado en **PocketBase** desplegado en **Railway**.

## Tech Stack

- **Frontend**: Astro 5, React 19, Tailwind CSS v4
- **Gestor de paquetes**: Bun
- **Backend**: PocketBase ([srg1995/pocketbase-railway](https://github.com/srg1995/pocketbase-railway))
- **Hosting Backend**: Railway

## Comandos

Ejecuta estos comandos desde la raíz del proyecto:

| Comando          | Acción                                          |
| :--------------- | :---------------------------------------------- |
| `bun install`    | Instala las dependencias                        |
| `bun dev`        | Inicia el servidor de desarrollo en `localhost:4321` |
| `bun build`      | Compila el proyecto para producción en `./dist/` |
| `bun preview`    | Previsualiza la build localmente                |
| `bun astro check` | Verifica tipos de TypeScript y Astro           |

## Inicio rápido

```bash
cd CDF-LAMORAÑA
bun install
bun dev
```

El servidor estará disponible en `http://localhost:4321`

## Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con estas variables:

```env
PUBLIC_POCKETBASE_URL=https://your-railway-url.railway.app
PUBLIC_ADMIN_USER=tu_usuario_admin
PUBLIC_ADMIN_PASSWORD=tu_contraseña_admin
```

**Notas:**
- `PUBLIC_POCKETBASE_URL`: URL del servidor PocketBase desplegado en Railway (o `http://127.0.0.1:8090` para desarrollo local)
- Las credenciales de admin se configuran en PocketBase

### Backend PocketBase

El backend está alojado en: https://github.com/srg1995/pocketbase-railway

Para desarrollo local, puedes clonar ese repositorio y ejecutar PocketBase localmente, o usar la instancia desplegada en Railway actualizando `PUBLIC_POCKETBASE_URL` en `.env`.

**Collections disponibles:**
- `pescadores`: nombre, apellido1, apellido2, dni, num_federativa, num_licencia, anio_nacimiento

## Arquitectura

**Dos áreas distintas:**

1. **Sitio público** (`src/pages/`): Índice, clasificaciones, eventos, pescadores, servicios, contacto, sobre-nosotros, cookies, privacidad
2. **Área admin** (`src/pages/admin/`): Panel de administración protegido por autenticación (login, gestión de jornadas y pescadores)

El área admin utiliza autenticación por `sessionStorage` con credenciales de variables de entorno.
