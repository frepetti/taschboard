# Guía Maestra de Despliegue e Infraestructura

Este documento detalla el proceso completo para desplegar el Dashboard BTL SaaS en un entorno de producción (Vercel + Supabase) y cómo configurarlo en un servidor privado para pruebas.

---

## PARTE 1: Configuración del Base de Datos (Supabase)

Antes de tocar el código o Vercel, el backend debe estar listo.

### 1.1 Crear Proyecto
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) y crea un nuevo proyecto.
2. **Región:** Selecciona la región más cercana a tus usuarios (ej: `São Paulo` para Latam, `us-east-1` para general).
3. **Database Password:** Genera una contraseña segura y **guárdala**.

### 1.2 Inicializar Base de Datos
1. En el menú lateral de Supabase, ve a **SQL Editor**.
2. Pega todo el contenido del archivo `master_schema.sql` (ubicado en la raíz de este repositorio).
3. Haz clic en **RUN**.
   * *Resultado:* Esto creará todas las tablas (`btl_usuarios`, `btl_inspecciones`, etc.), políticas de seguridad (RLS) y triggers.

### 1.3 Configurar Autenticación (¡CRÍTICO!)
Para que el login funcione en producción, debes configurar las URLs permitidas.

1. Ve a **Authentication** > **URL Configuration**.
2. **Site URL:** Pon tu URL de producción (ej: `https://mi-dashboard-btl.vercel.app`).
3. **Redirect URLs:** Añade las siguientes:
   * `http://localhost:5173/**` (Para desarrollo local)
   * `https://mi-dashboard-btl.vercel.app/**` (Para producción - asegúrate de incluir `/**` al final)

### 1.4 Obtener Variables de Entorno
Ve a **Project Settings** > **API**. Copia estos dos valores:
* `Project URL`
* `anon` / `public` Key

---

## PARTE 2: Despliegue del Frontend (Vercel)

Vercel es la plataforma recomendada para este proyecto (React + Vite).

### 2.1 Preparar Repositorio
1. Sube este código a tu cuenta de GitHub/GitLab/Bitbucket.

### 2.2 Crear Proyecto en Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) > **Add New...** > **Project**.
2. Importa el repositorio de GitHub que acabas de subir.

### 2.3 Configurar Build (Framework Preset)
Vercel suele detectar **Vite** automáticamente. Si no, configura:
* **Framework Preset:** Vite
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

### 2.4 Variables de Entorno (Environment Variables)
En la pantalla de configuración de Vercel, añade las siguientes variables (usando los datos obtenidos en el paso 1.4):

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Tu Project URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Tu anon Key de Supabase |

> **Nota:** Es vital que las variables comiencen con `VITE_`, de lo contrario la aplicación no podrá leerlas.

### 2.5 Desplegar
Haz clic en **Deploy**. Espera unos minutos. Vercel te dará una URL (ej: `https://project-name.vercel.app`).

---

## PARTE 3: Configuración de Dominio (Opcional)

Si quieres usar `dashboard.tu-agencia.com`:

1. En tu proyecto de Vercel, ve a **Settings** > **Domains**.
2. Escribe tu dominio (ej: `dashboard.tu-agencia.com`).
3. Vercel te dará unos registros DNS para configurar en tu proveedor de dominio (GoDaddy, Namecheap, AWS, etc.):
   * **Tipo:** CNAME
   * **Nombre:** dashboard
   * **Valor:** cname.vercel-dns.com
4. Una vez configurado en tu proveedor, Vercel generará el certificado SSL automáticamente.

---

## PARTE 4: Edge Functions (Backend Logic)

Las Edge Functions (como `send-email`) contienen la lógica del servidor que no debe correr en el navegador. Estas **NO** se despliegan en Vercel, deben subirse a la red de Supabase usando su CLI.

### 4.1 Instalación de Supabase CLI
Tienes varias opciones para instalar la herramienta de línea de comandos:

**Opción A: Vía NPM (Recomendada para este proyecto)**
Ejecuta en tu terminal:
```bash
npm install -g supabase
```

**Opción B: MacOS (Homebrew)**
```bash
brew install supabase/tap/supabase
```

**Opción C: Windows (Scoop)**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 4.2 Login y Vinculación
1. Inicia sesión en la CLI (te pedirá un token de acceso que puedes generar en el dashboard):
   ```bash
   npx supabase login
   ```
2. Vincula tu código local con tu proyecto remoto de Supabase:
   ```bash
   npx supabase link --project-ref tu-project-id
   ```
   > **¿Dónde está mi project-id?** Mira la URL de tu dashboard: `https://supabase.com/dashboard/project/abc-def-ghi`. El ID es `abc-def-ghi` (la parte después de /project/).
   > Te pedirá la contraseña de base de datos que creaste en el paso 1.1.

### 4.3 Configuración de Secretos (¡CRÍTICO!)
Tu función `send-email` necesita la API Key de Resend para enviar correos. Si no configuras esto, la función fallará.

1. Consigue tu API Key en [Resend.com](https://resend.com).
2. Sube la clave a los secretos de Supabase:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_123456789
   ```
3. Verifica que se haya guardado:
   ```bash
   npx supabase secrets list
   ```

### 4.4 Configuración de Seguridad
Al desplegar, asegúrate de que la opción **"Verify JWT with legacy secret"** esté **DESACTIVADA (OFF)** en el dashboard de Supabase para estas funciones.

### 4.5 Despliegue (Deploy)
Sube tus funciones a producción:

```bash
npx supabase functions deploy
```
*Si tienes múltiples funciones y solo quieres subir una:*
```bash
npx supabase functions deploy send-email
```

### 4.6 Troubleshooting Común
*   **Docker:** Para probar localmente (`supabase start` o `functions serve`), necesitas Docker Desktop corriendo. Para hacer `deploy` a producción, **NO** necesitas Docker corriendo en tu máquina.
*   **Permisos:** Si recibes errores de permisos al ejecutar la función, revisa los logs en el Dashboard > Edge Functions > Logs.

---

## PARTE 5: Bootstrap del Primer Administrador

Como el sistema no permite registro libre, nadie podrá entrar al principio. Debes crear el primer Admin manualmente.

1. Ve a **Supabase Dashboard** > **Authentication** > **Users**.
2. **Add User** > Create New User.
   * Email: `admin@tumarca.com`
   * Password: (Una contraseña fuerte)
   * Marca "Auto Confirm User".
3. Ve al **SQL Editor** y corre esto para darle permisos de Admin:

```sql
INSERT INTO public.btl_usuarios (auth_user_id, email, nombre, rol, estado_aprobacion)
SELECT id, email, 'Super Admin', 'admin', 'approved'
FROM auth.users
WHERE email = 'admin@tumarca.com'
ON CONFLICT (email) DO UPDATE 
SET rol = 'admin', estado_aprobacion = 'approved';
```

---

## PARTE 6: Despliegue en Servidor Privado (VPS / Local)

Si prefieres usar un servidor propio (Ubuntu/Debian) en lugar de Vercel.

### 6.1 Construir la Aplicación
En tu máquina local:
1. Crea un archivo `.env.production` con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Ejecuta:
   ```bash
   npm run build
   ```
3. Esto generará una carpeta `/dist`. Sube esta carpeta a tu servidor (usando FTP o SCP).

### 6.2 Configurar Nginx (Servidor Web)
Instala Nginx en el servidor (`sudo apt install nginx`).
Crea una configuración en `/etc/nginx/sites-available/dashboard-btl`:

```nginx
server {
    listen 80;
    server_name dashboard.tu-dominio.com;
    root /var/www/dashboard-btl/dist; # Ruta donde subiste la carpeta dist
    index index.html;

    # IMPORTANTE: Configuración para Single Page Application (SPA)
    # Redirige todas las rutas al index.html para que React Router funcione
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Activa el sitio y reinicia Nginx.
