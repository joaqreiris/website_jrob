# JROB — Sitio web de Joaquín Reiris (Preparador Físico)

Sitio profesional estático: **HTML + CSS + JS plano, sin framework ni build step.**
Se abre directamente en el navegador / se despliega en cualquier hosting estático
(Netlify, Vercel, GitHub Pages). El blog usa `fetch('posts.json')`, así que para
probar en local hace falta servirlo por HTTP (`python3 -m http.server` o similar),
no abrir el archivo con `file://`.

## Git — REGLA OBLIGATORIA: commit + push

**Todo cambio se cierra SIEMPRE con `git commit` Y `git push` a `origin/main`.**
No dejar commits locales sin subir: si se committea, se pushea en la misma tanda.
El sitio se publica desde el repo, así que sin push no hay deploy. (Trabajo en `main`.)

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Home. Hero, About, Formación, Modelo holístico, Experiencia (mapa + escudos), Casos, Blog, CV, Contacto |
| `sobre-mi.html` | Página "Sobre Mí": manifiesto en 3 actos, trayectoria, avales, toolset |
| `metodologia.html` | Página de principios de metodología |
| `redesign.css` | Hoja de estilos principal (sistema de diseño completo) |
| `sobre-mi.css` | Estilos específicos de la página Sobre Mí |
| `main.js` | Idiomas (i18n), mapa mundial de experiencia, nodos del modelo holístico |
| `blog.js` | Renderiza el blog desde `posts.json` y gestiona el modal |
| `posts.json` | **Entradas del blog** (editar aquí para publicar) |
| `assets/` | Imágenes: `assets/fotos/` (retratos) y `assets/squads/` (escudos) |
| `Joaquin Reiris - Redesign.html` | Copia de respaldo del index (no se sirve; se puede borrar) |

## Sistema de diseño — NO romper

- **Paleta**: definida en `:root` de `redesign.css`. Acento = **coral quemado `#FF5C3A`**
  (variable `--primary`). Fondos casi-negros (`--bg #08090C`, `--surface`). Hairlines 1px (`--line`).
- **Tipografías**: `Inter Tight` (display/títulos), `Inter` (cuerpo),
  `Instrument Serif` italic (acentos editoriales, palabras destacadas en `<em>`),
  `JetBrains Mono` (etiquetas, datos, kickers). Cargadas desde Google Fonts.
- **Geometría**: radios pequeños (4–8px), mucho whitespace, bordes hairline, sin glows.
- **Fotos**: tratamiento `.duotone` (escala de grises + tinte coral). Mantenerlo para cohesión.
- **No** añadir frameworks (React, Tailwind, jQuery…), **no** añadir gradientes llamativos,
  **no** introducir colores nuevos fuera de la paleta, **no** usar emojis salvo los ya existentes.

## Reglas de contenido

- **Los datos son reales y vienen del CV** (UY/IT pasaporte, base Camboya, 9 clubes).
  NO inventar métricas, fechas, porcentajes ni logros. Si falta un dato, preguntar.
- **Trayectoria/clubes** (sobre-mi.html) son HTML estático. Al cambiar de club:
  actualizar `sobre-mi.html` (lista + marquee), los Casos de `index.html`,
  y el `experienceData` del mapa en `main.js`.
- **Escudos**: van en `assets/squads/`. El de United FC es negro puro → necesita la
  clase `white-logo` para verse sobre el fondo oscuro (se invierte a blanco).

## Cómo publicar una entrada de blog

Editar **`posts.json`** y añadir un objeto al array:

```json
{
  "id": "slug-unico",
  "date": "Mar 2026",
  "title": "Título del artículo",
  "image": "assets/fotos/mi-imagen.jpg",
  "excerpt": "Resumen de 1–2 frases que aparece en la tarjeta.",
  "body": [
    "Primer párrafo del artículo completo (se ve en el modal).",
    "Segundo párrafo.",
    "Tantos párrafos como haga falta."
  ]
}
```

`blog.js` genera la tarjeta y el modal automáticamente. No hace falta tocar HTML ni JS.

## Traducciones (ES / EN / PT) — REGLA OBLIGATORIA

**Todo cambio de contenido se hace en los TRES idiomas (ES, EN, PT), siempre.**
Nunca dejar una cadena nueva o editada solo en español. Si se agrega o cambia
cualquier texto visible, hay que entregarlo traducido a los tres idiomas en la
misma tanda. Si no se conoce la traducción exacta de un dato real, preguntar —
no dejarlo a medias ni con texto de otro idioma como relleno.

Cómo se aplica en la práctica:

- **Texto en `index.html`**: todo nodo de texto traducible lleva `data-i18n="clave"`
  (o `data-i18n-ph="clave"` para placeholders de inputs), y la `clave` debe existir
  en los bloques `es`, `en` y `pt` del objeto `translations` de `main.js`.
- **`changeLanguage` (main.js)** ya soporta HTML en los valores: si la traducción
  contiene `<` (p. ej. `<em>` o `<span>`), se inyecta con `innerHTML` y se preserva
  el estilo; si no, usa `textContent`. Mantener los `<em>`/`<span>` en las 3 versiones.
- **Blog**: en `posts.json` los campos `date`, `title`, `excerpt` y `body` son objetos
  `{ "es": ..., "en": ..., "pt": ... }`. Una entrada nueva se publica completa en los
  tres idiomas. `blog.js` re-renderiza al cambiar de idioma.
- **Otras páginas** (`sobre-mi.html`, `metodologia.html`) siguen la misma regla con
  sus propias cadenas.
- **Verificar antes de cerrar**: cada `data-i18n` del HTML tiene que tener clave en
  los tres bloques de idioma (ES/EN/PT). No dejar claves huérfanas.

El ES es la fuente de verdad del copy; EN y PT reflejan fielmente el ES.

## Contacto / datos clave del CV

- Email: reiris.joaquin@gmail.com · Tel/WhatsApp: +971 50 150 5371
- Base actual: Camboya · Pasaporte: Uruguay / Italia
  (la ciudad —Phnom Penh— se quitó del sitio a pedido; no volver a mostrarla)
- Club actual: MOI Kompong Dewa FC (Premier League de Camboya), 2025–26
