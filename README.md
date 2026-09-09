# PERKY MAFIA

Web oficial del sello. Sitio estático: HTML, CSS y JavaScript a pelo, sin build ni
dependencias que instalar.

## Qué hay

```
index.html            La web entera (hero 3D, artistas, temas, mafia)
css/perky.css         Estilos. Los colores y las tipografías salen de :root
js/pills3d.js         El hero: nube de pastillas en 3D con three.js
js/perky.js           Menú, artistas desplegables, animaciones de scroll, el secreto
js/vendor/three.min.js three.js r128, servido desde el repo (sin CDN)
assets/               Logo, fotos, vídeos, QR y las tipografías en woff2
```

## Verlo en local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Hace falta servirlo por HTTP: abrir `index.html` con doble click no carga bien
las tipografías ni el 3D.

## Tocar cosas

- **Colores y tipos**: variables al principio de `css/perky.css`.
- **Artistas**: cada `<li class="artist">` de `index.html` lleva o `data-spotify`
  con el id de artista de Spotify, o `data-soundcloud` con el nombre de usuario de
  SoundCloud. El reproductor solo se carga cuando alguien le da al botón.
- **Hero 3D**: número de pastillas, colores y fuerzas, arriba del todo en `js/pills3d.js`.
  Si el navegador no tiene WebGL, sale la imagen de `assets/hero-pill.png` en su lugar.

Se respeta `prefers-reduced-motion`: quien lo tenga activado no ve animaciones ni
la nube en movimiento.
