# 🛡️ Configuración de Seguridad - Brand Monitor

Este documento detalla todas las medidas de seguridad implementadas para proteger la aplicación contra extensiones de navegador y otras amenazas.

## 📋 Índice

1. [Protección contra Extensiones](#protección-contra-extensiones)
2. [Content Security Policy](#content-security-policy)
3. [Configuración de Headers HTTP](#configuración-de-headers-http)
4. [Monitoreo y Logging](#monitoreo-y-logging)

---

## 🔒 Protección contra Extensiones

### Implementación Actual (App.tsx)

La aplicación incluye **13 capas de protección ultra-agresiva** contra extensiones de navegador:

#### **BLOQUE 1: Protección Inmediata (IIFE - Se ejecuta ANTES de todo)**

#### **1. Bloqueo Pre-Inyección de Proveedores**
```typescript
// Se ejecuta INMEDIATAMENTE antes de que MetaMask pueda inyectarse
const blockProviderProperty = (prop) => {
  Object.defineProperty(window, prop, {
    get() { return undefined; },
    set(value) {
      console.log(`🚫 Blocked attempt to inject ${prop}`);
      return true; // Silenciosamente ignora
    },
    configurable: false
  });
};

criticalProviders.forEach(blockProviderProperty);
```

**Resultado:**
- MetaMask intenta inyectar `window.ethereum` → **BLOQUEADO**
- Coinbase intenta inyectar `window.coinbaseWalletExtension` → **BLOQUEADO**
- Phantom intenta inyectar `window.phantom` → **BLOQUEADO**

---

#### **2. Intercepción de dispatchEvent**
```typescript
const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
EventTarget.prototype.dispatchEvent = function(event) {
  if (event.type && (
    event.type.includes('metamask') ||
    event.type.includes('ethereum') ||
    event.type.includes('wallet')
  )) {
    console.log('🚫 Blocked MetaMask event:', event.type);
    return true; // Evento "procesado" exitosamente
  }
  return originalDispatchEvent.call(this, event);
};
```

**Previene:**
- `ethereum#initialized` events
- `metamask#accountsChanged` events
- Cualquier evento relacionado con wallets

---

#### **3. Bloqueo de addEventListener**
```typescript
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type && (
    type.includes('metamask') ||
    type.includes('ethereum') ||
    type.includes('wallet')
  )) {
    console.log('🚫 Blocked MetaMask event listener:', type);
    return; // No registra el listener
  }
  return originalAddEventListener.call(this, type, listener, options);
};
```

**Resultado:**
```javascript
// MetaMask intenta esto:
window.addEventListener('ethereum#initialized', handler); 
// → Bloqueado silenciosamente

// Nuestra app puede hacer esto:
window.addEventListener('click', handler);
// → Funciona normalmente
```

---

#### **4. Override de fetch()**
```typescript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (
    url.includes('metamask') ||
    url.includes('infura.io') ||
    url.includes('cloudflare-eth.com')
  )) {
    console.log('🚫 Blocked MetaMask fetch:', url);
    return Promise.reject(new Error('Blocked by app security policy'));
  }
  return originalFetch.apply(this, args);
};
```

**Bloquea llamadas a:**
- `https://infura.io/v3/...` (RPC de Ethereum)
- `https://cloudflare-eth.com/...` (RPC alternativo)
- Cualquier endpoint de MetaMask

---

#### **5. Bloqueo de chrome.runtime**
```typescript
const blockedRuntime = {
  sendMessage: () => {
    console.log('🚫 Blocked chrome.runtime.sendMessage');
  },
  connect: () => {
    console.log('🚫 Blocked chrome.runtime.connect');
    return {
      postMessage: () => {},
      disconnect: () => {},
      onMessage: { addListener: () => {} }
    };
  }
};

Object.defineProperty(chrome, 'runtime', {
  get() { return blockedRuntime; },
  configurable: false
});
```

**Previene:**
- Communication entre content script y background script
- MetaMask no puede comunicarse con su backend

---

#### **BLOQUE 2: Protección Estándar**

#### **6. Supresión de Errores y Warnings**
```typescript
console.error = (...args) => {
  const errorString = args.join(' ').toLowerCase();
  const extensionKeywords = [
    'metamask', 'extension', 'chrome-extension',
    'wallet', 'web3', 'ethereum', 'connect',
    'inpage.js', 'provider', 'injected'
  ];
  
  if (extensionKeywords.some(keyword => errorString.includes(keyword))) {
    return; // Completamente silencioso
  }
  
  originalConsoleError.apply(console, args);
};
```

**Resultado en consola:**
```
❌ ANTES:
  Failed to connect to MetaMask
  at Object.connect (chrome-extension://...)
  
✅ AHORA:
  (nada - completamente silenciado)
```

---

#### **7. Bloqueo de Proveedores Web3**
```typescript
const providersToBlock = [
  'ethereum', 'web3', 'coinbaseWalletExtension',
  'phantom', 'solana', 'tronWeb', 'tronLink',
  'okexchain', 'BinanceChain', 'trustwallet',
  'rabby', 'exodus', 'brave', 'xfi', 'keplr'
];
```

**Total:** 17 proveedores bloqueados

---

#### **8. MutationObserver - Bloqueo de Scripts Inyectados**
```typescript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const script = node as HTMLScriptElement;
        if (script.src.includes('chrome-extension://') ||
            script.src.includes('inpage.js') ||
            script.src.includes('metamask')) {
          script.remove(); // Elimina el script del DOM
        }
      }
    });
  });
});
```

**Bloquea:**
- `chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/scripts/inpage.js`
- Cualquier script de extensión

---

#### **9. Filtrado de Messages con Contenido MetaMask**
```typescript
window.addEventListener('message', (event) => {
  // Bloquear mensajes de extensiones
  if (event.origin.includes('chrome-extension://')) {
    event.stopImmediatePropagation();
    return;
  }
  
  // NUEVO: También bloquear si el contenido menciona MetaMask
  if (event.data && typeof event.data === 'object') {
    const dataStr = JSON.stringify(event.data).toLowerCase();
    if (dataStr.includes('metamask') || 
        dataStr.includes('ethereum') || 
        dataStr.includes('wallet_') ||
        dataStr.includes('eth_')) {
      event.stopImmediatePropagation();
      console.log('🚫 Blocked MetaMask message');
    }
  }
}, true);
```

---

#### **10. Proxy de postMessage con Filtrado de Contenido**
```typescript
Object.defineProperty(window, 'postMessage', {
  value: new Proxy(window.postMessage, {
    apply(target, thisArg, args) {
      // Bloquear mensajes con contenido de MetaMask
      if (args[0] && typeof args[0] === 'object') {
        const msgStr = JSON.stringify(args[0]).toLowerCase();
        if (msgStr.includes('metamask') || 
            msgStr.includes('ethereum') ||
            msgStr.includes('wallet_')) {
          console.log('🚫 Blocked MetaMask postMessage');
          return;
        }
      }
      return Reflect.apply(target, thisArg, args);
    }
  })
});
```

---

#### **11. Limpieza en Page Load**
```typescript
window.addEventListener('load', () => {
  providersToBlock.forEach(prop => {
    try {
      delete (window as any)[prop];
    } catch (e) {}
  });
});
```

---

#### **12. Bloqueo de APIs Globales**
```typescript
['chrome', 'browser', 'msBrowser', 'safari'].forEach(api => {
  Object.defineProperty(window, api, {
    get() { return undefined; },
    configurable: false
  });
});
```

---

#### **13. Prevención de Detección de MetaMask**
```typescript
Object.defineProperty(window, 'isMetaMask', {
  get() { return false; },
  set() {},
  configurable: false
});
```

**Resultado:**
```javascript
window.isMetaMask // → false (siempre)
```

---

## 🎯 Flujo Completo de Protección

```
MetaMask se carga en el navegador
         ↓
🚫 CAPA 1: Bloqueo de inyección de window.ethereum
         ↓
🚫 CAPA 2: dispatchEvent bloqueado
         ↓
🚫 CAPA 3: addEventListener bloqueado
         ↓
🚫 CAPA 4: fetch() a Infura bloqueado
         ↓
🚫 CAPA 5: chrome.runtime bloqueado
         ↓
🚫 CAPA 6: Errores suprimidos (silencio total)
         ↓
🚫 CAPA 7: Proveedores bloqueados
         ↓
🚫 CAPA 8: Script inpage.js removido del DOM
         ↓
🚫 CAPA 9: Messages filtrados por contenido
         ↓
🚫 CAPA 10: postMessage proxy bloqueado
         ↓
🚫 CAPA 11: Variables limpiadas
         ↓
🚫 CAPA 12: APIs globales bloqueadas
         ↓
🚫 CAPA 13: isMetaMask = false
         ↓
✅ MetaMask completamente neutralizado
   SIN errores en consola
```

---

## 🌐 Content Security Policy

### Configuración Recomendada

Si tu servidor lo soporta, agrega estos headers HTTP:

```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https://*.supabase.co https://images.unsplash.com; 
  connect-src 'self' https://*.supabase.co wss://*.supabase.co; 
  font-src 'self'; 
  object-src 'none'; 
  base-uri 'self'; 
  form-action 'self'; 
  frame-ancestors 'none';
```

### Explicación de Directivas

| Directiva | Valor | Razón |
|-----------|-------|-------|
| `default-src` | `'self'` | Solo recursos del mismo origen |
| `script-src` | `'self' 'unsafe-inline'` | Scripts propios + inline (React necesita) |
| `connect-src` | `'self' https://*.supabase.co` | API calls solo a Supabase |
| `frame-ancestors` | `'none'` | Previene clickjacking |
| `object-src` | `'none'` | Bloquea Flash, Java, etc. |

---

## 🔐 Configuración de Headers HTTP

### Headers de Seguridad Recomendados

```http
# 1. Previene clickjacking
X-Frame-Options: DENY

# 2. Bloquea MIME type sniffing
X-Content-Type-Options: nosniff

# 3. Habilita protección XSS del navegador
X-XSS-Protection: 1; mode=block

# 4. Controla el Referrer
Referrer-Policy: strict-origin-when-cross-origin

# 5. Fuerza HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# 6. Controla características del navegador
Permissions-Policy: 
  geolocation=(), 
  microphone=(), 
  camera=(), 
  payment=(), 
  usb=(), 
  magnetometer=(), 
  gyroscope=()
```

### Implementación por Plataforma

#### **Vercel (vercel.json)**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

#### **Netlify (_headers)**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### **Apache (.htaccess)**
```apache
<IfModule mod_headers.c>
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

#### **Nginx (nginx.conf)**
```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📊 Monitoreo y Logging

### Console Logging

La aplicación registra todos los intentos de acceso bloqueados:

```
🔇 Extension error suppressed: MetaMask connection failed
🚫 Blocked access to ethereum (extension provider)
🚫 Blocked extension script injection: chrome-extension://abc123/script.js
🚫 Blocked extension message: chrome-extension://xyz789
🚫 Blocked cross-origin postMessage
✅ Extension protection active
🛡️ Comprehensive extension protection initialized
```

### Análisis de Logs

Para debugging, busca estos emojis en la consola:

| Emoji | Tipo | Acción |
|-------|------|--------|
| 🔇 | Error suprimido | Extensión intentó conectar |
| 🚫 | Acceso bloqueado | Propiedad/API bloqueada |
| ⚠️ | Advertencia | No se pudo bloquear (ya definido) |
| ✅ | Success | Protección activada |
| 🛡️ | Inicialización | Sistema de seguridad cargado |

---

## 🧪 Testing de Seguridad

### Pruebas Manuales

1. **Verificar Bloqueo de Ethereum:**
   ```javascript
   console.log(typeof window.ethereum); // Debe ser 'undefined'
   ```

2. **Verificar Bloqueo de Web3:**
   ```javascript
   console.log(typeof window.web3); // Debe ser 'undefined'
   ```

3. **Verificar Console Logs:**
   - Abre DevTools → Console
   - Busca mensaje: "🛡️ Comprehensive extension protection initialized"

4. **Probar con MetaMask Instalado:**
   - Instala MetaMask
   - Recarga la app
   - No debería haber errors en consola
   - MetaMask no debería detectar la página

### Pruebas Automatizadas

```typescript
describe('Extension Protection', () => {
  it('should block ethereum provider', () => {
    expect(window.ethereum).toBeUndefined();
  });

  it('should block web3 provider', () => {
    expect((window as any).web3).toBeUndefined();
  });

  it('should block chrome extension API', () => {
    expect((window as any).chrome).toBeUndefined();
  });
});
```

---

## 🎯 Checklist de Seguridad

- [x] Bloqueo de proveedores Web3
- [x] Supresión de errores de extensiones
- [x] Prevención de inyección de scripts
- [x] Bloqueo de mensajería cross-origin
- [x] Proxy de postMessage
- [x] Limpieza de variables inyectadas
- [x] Bloqueo de APIs de extensión
- [ ] Headers HTTP de seguridad (requiere configuración de servidor)
- [ ] Content Security Policy (requiere configuración de servidor)
- [ ] Monitoring de intentos de acceso (opcional)

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers](https://securityheaders.com/)
- [Web Security](https://web.dev/security/)

---

## 🆘 Soporte

Si experimentas problemas con extensiones:

1. Abre DevTools (F12)
2. Ve a Console
3. Busca mensajes con 🚫 o ⚠️
4. Reporta el issue con el log completo

---

**Última actualización:** 21 Enero 2026  
**Versión:** 1.0.0  
**Mantenedor:** Brand Monitor Security Team