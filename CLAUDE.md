# JROB — Sitio web de Joaquín Reiris (Preparador Físico)

Sitio profesional estático: **HTML + CSS + JS plano, sin framework ni build step.**
Se abre directamente en el navegador / se despliega en cualquier hosting estático
(Netlify, Vercel, GitHub Pages). El blog usa `fetch('posts.json')`, así que para
probar en local hace falta servirlo por HTTP (`python3 -m http.server` o similar),
no abrir el archivo con `file://`.

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

- **Los datos son reales y vienen del CV** (UY/IT pasaporte, base Phnom Penh, 9 clubes).
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

## Traducciones (ES / EN / PT)

Las cadenas viven en el objeto `translations` dentro de `main.js` (claves `data-i18n`).
Hay un comentario-guía al inicio de ese objeto con las claves pendientes de sincronizar
contra el CV. El ES refleja el copy actual; EN y PT pueden tener texto antiguo —
al actualizarlos, reflejar los valores del ES.

## Contacto / datos clave del CV

- Email: reiris.joaquin@gmail.com · Tel/WhatsApp: +971 50 150 5371
- Base actual: Phnom Penh, Camboya · Pasaporte: Uruguay / Italia
- Club actual: MOI Kompong Dewa FC (Premier League de Camboya), 2025–26
