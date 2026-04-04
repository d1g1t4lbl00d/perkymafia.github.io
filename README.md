# ☠ PERKY MAFIA — Web Oficial

Web oficial del proyecto **PERKY MAFIA** en SoundCloud.

---

## 📁 Estructura del proyecto

```
perky-mafia-web/
├── index.html              ← La web (todo esta aqui)
├── assets/
│   ├── logo.png            ← Logo oficial (sin fondo)
│   ├── favicon.png         ← Icono de la pestaña
│   ├── foto-selfie.jpeg    ← Foto para fondos
│   ├── foto-evento.jpeg    ← Foto del evento para fondos
│   └── video-bg.mp4        ← Video de fondo
├── vercel.json             ← Config de Vercel (no tocar)
└── README.md               ← Este archivo
```

---

## 🚀 Subir a GitHub + Vercel (paso a paso)

### Paso 1 — Crear repositorio en GitHub

1. Ve a **[github.com/new](https://github.com/new)**
2. Nombre del repo: `perky-mafia-web`
3. Dejalo en **Public**
4. **NO** marques ninguna casilla (ni README ni .gitignore)
5. Click en **Create repository**

### Paso 2 — Subir archivos

#### Opcion A: Desde la web de GitHub (mas facil)

1. En la pagina del repo recien creado, click en **"uploading an existing file"**
2. Arrastra TODA la carpeta `perky-mafia-web` (o selecciona todos los archivos y la carpeta `assets/`)
3. Asegurate de que se vea asi:
   ```
   index.html
   vercel.json
   README.md
   assets/logo.png
   assets/favicon.png
   assets/foto-selfie.jpeg
   assets/foto-evento.jpeg
   assets/video-bg.mp4
   ```
4. En "Commit changes" escribe: `primera subida`
5. Click en **Commit changes**

#### Opcion B: Desde terminal (si tienes git instalado)

```bash
cd perky-mafia-web
git init
git add .
git commit -m "primera subida"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/perky-mafia-web.git
git push -u origin main
```

### Paso 3 — Conectar con Vercel

1. Ve a **[vercel.com](https://vercel.com)** y haz login con tu cuenta de GitHub
2. Click en **"Add New Project"**
3. Busca tu repo `perky-mafia-web` y click en **Import**
4. **NO cambies nada** en la configuracion, dejalo todo por defecto
5. Click en **Deploy**
6. Espera 30 segundos... ¡listo! 🎉

Tu web estara en: `https://perky-mafia-web.vercel.app` (o similar)

### Paso 4 — Dominio personalizado (opcional)

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Escribe tu dominio (ej: `perkymafia.com`) y sigue las instrucciones

---

## ✏️ Como editar la web

### Cambiar textos

Abre `index.html` y busca los comentarios `[EDITAR]`. Cada seccion editable esta marcada:

- **Titulo de la pestaña**: linea con `<title>`
- **Estadisticas** (58 tracks, 98 followers): busca `hero-stats`
- **Texto del about**: busca `about-text`
- **Texto del marquee**: busca `strip-item`

### Cambiar imagenes y video

Simplemente reemplaza los archivos en la carpeta `assets/`:

| Archivo | Donde se usa | Tamaño recomendado |
|---|---|---|
| `logo.png` | Nav, hero, loader, footer | Cualquiera (PNG sin fondo) |
| `favicon.png` | Icono pestaña navegador | 64x64 px |
| `foto-selfie.jpeg` | Fondo seccion tracks + about | Cualquiera |
| `foto-evento.jpeg` | Fondo del hero | Cualquiera |
| `video-bg.mp4` | Video fondo hero + seccion video | Max 5MB recomendado |

**Importante:** manten los mismos nombres de archivo. Si cambias el nombre, actualiza la ruta en `index.html`.

### Cambiar colores

Al principio del CSS en `index.html`, busca el bloque `:root`:

```css
:root {
  --bg:      #0a0a0a;   /* fondo principal */
  --green:   #39ff14;   /* verde neon */
  --pink:    #ff2a6d;   /* rosa */
  --yellow:  #ffe600;   /* amarillo */
  --cyan:    #05d9e8;   /* cian */
  --white:   #f0f0f0;   /* blanco */
  --red:     #ff0000;   /* rojo */
  --orange:  #ff6600;   /* naranja */
}
```

Cambia los valores hex y toda la web se actualiza.

### Cambiar cuenta de SoundCloud

En el JavaScript al final de `index.html`, busca `CONFIG`:

```javascript
const CONFIG = {
  soundcloudUser: 'perky-labs',       // ← tu usuario
  playerColor: 'ff2a6d',             // ← color del player
  featuredTracks: ['elean-musk'],     // ← tracks destacados
  loaderTime: 1400,                   // ← tiempo del loader (ms)
};
```

### Cambiar links de redes sociales

Busca `[LINK]` en el HTML para encontrar todos los enlaces a redes:
- SoundCloud: `https://soundcloud.com/perky-labs`
- Instagram: `https://www.instagram.com/francisconocorazon`

### Añadir mas tracks destacados

En `CONFIG.featuredTracks`, añade los slugs de tus tracks:

```javascript
featuredTracks: [
  'elean-musk',
  'otro-track',      // ← añade aqui
  'otro-mas',        // ← y aqui
],
```

El slug es lo que va despues de `soundcloud.com/perky-labs/` en la URL del track.

---

## 🔄 Actualizar la web

Cada vez que edites algo y hagas push a GitHub, **Vercel se actualiza automaticamente** en ~30 segundos. No tienes que hacer nada mas.

Desde GitHub web:
1. Click en el archivo que quieres editar
2. Click en el lapiz ✏️
3. Haz tus cambios
4. Click en **Commit changes**
5. Vercel se actualiza solo

---

## 🤝 Creditos

Web hecha para **PERKY MAFIA** · FOR PERKY PAKOS ☠
