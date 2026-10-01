# Guía Maestra de Despliegue e Infraestructura (v1.8.3)

Este documento detalla el proceso completo para desplegar el Dashboard BTL SaaS en un entorno de producción (Vercel + Supabase) y cómo configurarlo en un servidor privado para pruebas.

---

## PARTE 1: Configuración de la Base de Datos (Supabase)

Antes de tocar el código o Vercel, el backend de Supabase debe estar preparado y configurado.

### 1.1 Crear Proyecto
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) y crea un nuevo proyecto.
2. **Región:** Selecciona la región más cercana a tus usuarios (ej: `São Paulo` para Latam, `us-east-1` para general).
3. **Database Password:** Genera una contraseña segura y **guárdala en un gestor seguro**.

### 1.2 Inicializar Esquema de Base de Datos
1. En el menú lateral de Supabase, ve a **SQL Editor**.
2. Pega todo el contenido del archivo `master_schema.sql` (ubicado en la raíz de este repositorio).
3. Haz clic en **RUN**.
   * *Resultado:* Esto creará todas las tablas operativas (`btl_usuarios`, `btl_inspecciones`, `btl_puntos_venta`, `btl_productos`, `btl_cliente_productos`, `btl_temas`, etc.), funciones auxiliares (`is_admin()`, etc.), políticas de seguridad RLS y triggers de consistencia (actualización automática de `global_score`, timestamps).
   * *Semillas Idempotentes:* El script inicializa automáticamente los temas base del sistema (`default`, `heineken`).

### 1.3 Configurar Autenticación (¡CRÍTICO!)
Para que el flujo de autenticación y restablecimiento de contraseña funcione en producción, debes configurar las URLs autorizadas:

1. Ve a **Authentication** > **URL Configuration**.
2. **Site URL:** Pon tu URL de producción (ej: `https://mi-dashboard-btl.vercel.app`).
3. **Redirect URLs:** Añade las siguientes:
   * `http://localhost:5173/**` (Para desarrollo local)
   * `https://mi-dashboard-btl.vercel.app/**` (Para producción - asegúrate de incluir `/**` al final)

### 1.4 Obtener Credenciales y API Keys
Ve a **Project Settings** > **API**. Copia estos valores:
* `Project URL`
* `anon` / `public` Key

---

## PARTE 2: Despliegue del Frontend (Vercel)

Vercel es la plataforma recomendada y optimizada para este proyecto (React 18 + Vite 7).

### 2.1 Flujo de Ramas y CI/CD
El flujo de entrega continua estándar del proyecto se estructura de la siguiente manera:
1. **Rama `develop`:** Para desarrollo de nuevos sprints, pruebas funcionales y validación de compilación (`npm run build`).
2. **Rama `main`:** Rama de producción protegida. Al fusionar cambios aprobados mediante pull request o fast-forward, Vercel dispara automáticamente el pipeline de compilación y despliegue a producción.

### 2.2 Crear Proyecto en Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) > **Add New...** > **Project**.
2. Importa el repositorio de GitHub/GitLab.

### 2.3 Configurar Parámetros de Compilación
Vercel detecta **Vite** automáticamente. Verifica que contenga:
* **Framework Preset:** Vite
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

### 2.4 Variables de Entorno (Environment Variables)
En la configuración del proyecto en Vercel, define las siguientes variables de entorno:

| Variable | Descripción | Obligatoria |
|---|---|:---:|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (ej: `https://xyzcompany.supabase.co`) | Sí |
| `VITE_SUPABASE_ANON_KEY` | Llave pública anónima de Supabase | Sí |
| `VITE_CARTO_API_KEY` | API Key para renderizado de capas CARTO Positron sin marcas de agua | Opcional |

> **Nota sobre CARTO Positron:** La aplicación utiliza mapas satelitales/urbanos CARTO Positron en `OpportunityMap` y `VenueLocationPicker`. Para remover la leyenda de evaluación en producción, regístrate de forma gratuita en [CARTO Basemaps](https://carto.com/basemaps/apikey) (nivel gratuito de hasta 5 millones de peticiones/mes) e ingresa tu clave en `VITE_CARTO_API_KEY`.

### 2.5 Desplegar
Haz clic en **Deploy**. Tras finalizar el build, Vercel asignará la URL pública de producción (ej: `https://taschboard.vercel.app`).

---

## PARTE 3: Configuración de Dominio Personalizado (Opcional)

Si deseas utilizar un dominio corporativo propio (ej: `dashboard.tu-agencia.com`):

1. En el proyecto de Vercel, ve a **Settings** > **Domains**.
2. Ingresa el subdominio o dominio deseado.
3. Configura el registro DNS en tu proveedor (GoDaddy, Cloudflare, AWS Route 53, etc.):
   * **Tipo:** CNAME
   * **Nombre:** `dashboard`
   * **Valor:** `cname.vercel-dns.com`
4. Vercel aprovisionará automáticamente el certificado SSL/TLS (HTTPS).

---

## PARTE 4: Edge Functions (Backend Serverless)

Las Edge Functions gestionan lógica privilegiada fuera del alcance del navegador cliente (ej. envío transaccional de correos o tareas de backend con service-role key).

### 4.1 Instalación de Supabase CLI
```bash
npm install -g supabase
```

### 4.2 Login y Vinculación del Proyecto
1. Inicia sesión en la CLI:
   ```bash
   npx supabase login
   ```
2. Vincula el directorio local con tu proyecto remoto:
   ```bash
   npx supabase link --project-ref <tu-project-id>
   ```

### 4.3 Configuración de Secretos de Servidor
Si utilizas el servicio de correos transaccionales Resend:
```bash
npx supabase secrets set RESEND_API_KEY=re_123456789
```

### 4.4 Despliegue de Funciones
```bash
npx supabase functions deploy server
```

---

## PARTE 5: Bootstrap del Administrador Inicial

Dado que el sistema requiere aprobación administrativa para cualquier usuario registrado (`estado_aprobacion = 'pending'`), el primer usuario administrador debe crearse manualmente:

1. Ve a **Supabase Dashboard** > **Authentication** > **Users**.
2. Haz clic en **Add User** > **Create New User**.
   * Email: `admin@tumarca.com`
   * Password: (Contraseña fuerte)
   * Marca la casilla **Auto Confirm User**.
3. Dirígete a **SQL Editor** y ejecuta el siguiente script para otorgarle permisos de administrador y configurar su pertenencia empresarial:

```sql
INSERT INTO public.btl_usuarios (
  auth_user_id,
  email,
  nombre,
  rol,
  estado_aprobacion,
  empresa
)
SELECT 
  id,
  email,
  'Super Admin',
  'admin',
  'approved',
  'Heineken' -- Asignar marca o dejar en NULL para tema 'default'
FROM auth.users
WHERE email = 'admin@tumarca.com'
ON CONFLICT (email) DO UPDATE 
SET 
  rol = 'admin',
  estado_aprobacion = 'approved',
  empresa = EXCLUDED.empresa;
```

---

## PARTE 6: Despliegue en Servidor Privado (VPS Linux / Nginx)

Si se opta por infraestructura propia (Ubuntu/Debian) en lugar de Vercel:

### 6.1 Compilación Local o CI
1. Asegúrate de contar con el archivo `.env.production` conteniendo las variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_CARTO_API_KEY`.
2. Genera el bundle optimizado:
   ```bash
   npm run build
   ```
3. Transfiere la carpeta generada `/dist` al servidor de producción vía SCP o rsync:
   ```bash
   scp -r dist/* usuario@tu-servidor:/var/www/dashboard-btl/
   ```

### 6.2 Configuración de Nginx
Crea o edita `/etc/nginx/sites-available/dashboard-btl`:

```nginx
server {
    listen 80;
    server_name dashboard.tu-agencia.com;
    root /var/www/dashboard-btl;
    index index.html;

    # Enrutamiento Single Page Application (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché estático optimizado para Vite assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Habilita el sitio y recarga Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/dashboard-btl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
