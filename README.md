# PERKY MAFIA

Web oficial del sello. Sitio estático: HTML, CSS y JavaScript a pelo, sin build ni
dependencias que instalar.

## Qué hay

```
index.html            La web entera (hero 3D, artistas, temas, mafia)
css/perky.css         Estilos. Los colores y las tipografías salen de :root
js/hero3d.js          La portada 3D: logotipo cromado y nube de pastillas
js/perky.js           Menú, artistas desplegables, animaciones de scroll, el secreto
js/vendor/three.min.js three.js r128, servido desde el repo (sin CDN)
assets/               Logo, fotos, vídeos, QR, las tipografías en woff2 y
                      anton-3d.json, las letras de Anton para el logotipo 3D
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
- **Portada 3D**: número de pastillas, colores y fuerzas, arriba del todo en
  `js/hero3d.js`. El logotipo cromado se construye con `assets/fonts/anton-3d.json`,
  que son las letras de Anton exportadas al formato que entiende three.js. El cromo
  refleja una esfera con un degradado que solo ve la cámara de reflejos, nunca la
  principal; sin ella el metal sería un espejo de la nada, o sea negro.
  Si el navegador no tiene WebGL, sale el título normal y la imagen de
  `assets/hero-pill.png`.

Se respeta `prefers-reduced-motion`: quien lo tenga activado no ve animaciones ni
la nube en movimiento.
