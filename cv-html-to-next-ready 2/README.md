# CV José Luis Acevedo - Next.js 14 + SQLite

Proyecto Next.js 14 con TypeScript y App Router que muestra un CV profesional y registra eventos de tracking en una base de datos SQLite embebida (offline-first).

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar base de datos con datos demo
npm run seed

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el CV.
Abre [http://localhost:3000/dashboard](http://localhost:3000/dashboard) para ver las métricas.

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run seed` - Inserta datos demo en la base de datos (20 eventos + 2 contactos)
- `npm run db:reset` - Elimina la base de datos y vuelve a crear con datos demo

## Estructura del proyecto

```
cv-html-to-next-ready 2/
├── app/
│   ├── api/
│   │   ├── track/route.ts       # POST - registra eventos (pageview, cta_click, lead)
│   │   ├── metrics/route.ts     # GET - retorna KPIs agregados
│   │   └── contact/route.ts     # POST - guarda contactos
│   ├── dashboard/page.tsx       # Dashboard con métricas
│   ├── layout.tsx
│   └── page.tsx                 # Página principal del CV
├── components/
│   └── TrackClient.tsx          # Client Component para tracking
├── db/
│   ├── init.ts                  # Inicialización de SQLite y tablas
│   └── seed.ts                  # Script de seed
├── data/
│   └── app.db                   # Base de datos SQLite (generado)
├── public/
│   ├── assets/
│   │   ├── foto.jpg
│   │   └── user-behavior.js
│   └── static/
│       └── content.html         # HTML del CV
├── styles/
│   └── royal-sapphire.css       # Estilos del CV
└── package.json
```

## Características

### Tracking automático
- **Pageview**: Se registra automáticamente al cargar la página principal
- **CTA clicks**: Se registran clics en los 3 botones de llamado a la acción (email, WhatsApp, agendar)
- **Contactos**: Formulario de contacto (preparado, pero no visible en el CV actual)

### Dashboard de métricas
Muestra:
- **Totales**: Visitas, Clics CTA, Leads, Conversión
- **Últimos 7 días**: Tabla con actividad diaria
- **Top CTAs**: Ranking de botones más clickeados

### Base de datos
Tablas SQLite:
- `events` - Eventos de tracking (pageview, cta_click, lead)
- `contacts` - Formularios de contacto enviados

Campos capturados:
- `type` - Tipo de evento
- `label` - Etiqueta (ej: "email", "wsp", "agenda")
- `ua` - User-Agent del navegador
- `ip` - Dirección IP (de x-forwarded-for o 127.0.0.1)
- `created_at` - Timestamp automático

## Migración a Postgres/Supabase

Para migrar a una base de datos en la nube:

### Opción 1: Postgres
1. Instalar `pg` en lugar de `better-sqlite3`:
   ```bash
   npm uninstall better-sqlite3
   npm install pg
   ```

2. Crear un adaptador en `db/init.ts`:
   ```typescript
   import { Pool } from 'pg';

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });

   export function getDb() {
     return pool;
   }
   ```

3. Convertir queries:
   - Parámetros posicionales: `?` → `$1, $2, $3`
   - `DATE('now', '-7 days')` → `NOW() - INTERVAL '7 days'`
   - Usar `pool.query()` en lugar de `db.prepare().run()`

### Opción 2: Supabase
1. Instalar cliente:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Crear adaptador:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

3. Convertir queries a métodos de Supabase:
   ```typescript
   // Antes (SQLite)
   db.prepare('INSERT INTO events...').run(...)

   // Después (Supabase)
   await supabase.from('events').insert({...})
   ```

## Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **better-sqlite3** - Base de datos SQLite embebida (síncrona)
- **Royal Sapphire** - Tema visual con gradientes azules

## Notas

- Funciona completamente offline (no requiere variables de entorno)
- La base de datos se crea automáticamente en `data/app.db` al ejecutar cualquier ruta API
- El CV mantiene el diseño y layout original del HTML
- Los estilos inline se migraron a `styles/royal-sapphire.css` sin márgenes blancos