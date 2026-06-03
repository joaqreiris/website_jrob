/* =========================================================
   blog.js — Blog multiidioma desde posts.json
   ---------------------------------------------------------
   Dos vistas sobre la misma data:
     · Listado  → tarjetas en .blog-grid (cada una enlaza a
                  blog.html?post=<id>). Si .blog-grid tiene
                  data-limit="N", solo muestra las N más recientes
                  (adelanto de la home).
     · Artículo → #post-view, lectura completa con imagen, figuras
                  y referencias. Se activa con ?post=<id> en la URL.

   Publicar una entrada: añade un objeto a posts.json. Cada campo
   traducible (date, title, excerpt, body) es { es, en, pt }.
   Figuras opcionales: array "figures" con objetos
     { src, after, caption:{es,en,pt}, credit:{es,en,pt}, link }
   "after" = nº de párrafo del cuerpo tras el cual se inserta la
   figura (sin "after" válido → va al final, antes de referencias).
   ========================================================= */
(function () {
  "use strict";

  const grid = document.querySelector(".blog-grid");
  const postView = document.getElementById("post-view");
  const listHeader = document.querySelector(".blog-list-header");
  if (!grid && !postView) return; // No estamos en una página con blog

  let posts = [];

  // ---- Etiquetas de UI por idioma ----
  const readMoreLabel = { es: "Leer artículo", en: "Read article", pt: "Ler artigo" };
  const backLabel     = { es: "Volver al blog", en: "Back to the blog", pt: "Voltar ao blog" };
  const prevLabel     = { es: "Anterior", en: "Previous", pt: "Anterior" };
  const nextLabel     = { es: "Siguiente", en: "Next", pt: "Próximo" };
  const refsRegex     = /^\s*(referencias|references|referências)/i;

  function currentLang() {
    const l = document.documentElement.lang || "es";
    return ["es", "en", "pt"].indexOf(l) !== -1 ? l : "es";
  }

  // Valor del campo en el idioma actual, con fallback a es / valor plano
  function pick(field, lang) {
    if (field && typeof field === "object" && !Array.isArray(field)) {
      return field[lang] || field.es || Object.values(field)[0] || "";
    }
    return field; // compat: campo plano (string o array)
  }

  // Lee ?post= de la URL
  function getPostIdFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get("post");
    } catch (e) {
      const m = window.location.search.match(/[?&]post=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }
  }

  /* =========================================================
     LISTADO
     ========================================================= */
  function renderCards() {
    if (!grid) return;
    const lang = currentLang();
    const limit = parseInt(grid.getAttribute("data-limit"), 10);
    const list = (limit > 0) ? posts.slice(0, limit) : posts;

    grid.innerHTML = list.map((post, i) => {
      const title = pick(post.title, lang);
      const date = pick(post.date, lang);
      const excerpt = pick(post.excerpt, lang);
      const href = "blog.html?post=" + encodeURIComponent(post.id);
      return `
      <article class="blog-card" data-aos="fade-up"${i ? ' data-aos-delay="' + (i * 100) + '"' : ''}>
        <a class="blog-card-link" href="${escapeAttr(href)}">
          <div class="blog-img duotone subtle">
            <img src="${escapeAttr(post.image)}" alt="${escapeAttr(title)}">
          </div>
          <div class="blog-info">
            <span class="blog-date">${escapeHtml(date)}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(excerpt)}</p>
            <span class="read-more">
              <span>${escapeHtml(readMoreLabel[lang])}</span> <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </a>
      </article>`;
    }).join("");

    if (window.AOS && typeof window.AOS.refresh === "function") window.AOS.refresh();
  }

  /* =========================================================
     VISTA DE ARTÍCULO
     ========================================================= */
  function renderFigure(fig, lang) {
    if (!fig || !fig.src) return "";
    const caption = pick(fig.caption, lang);
    const credit = pick(fig.credit, lang);
    let creditHtml = "";
    if (credit) {
      creditHtml = fig.link
        ? `<span class="fig-credit"><a href="${escapeAttr(fig.link)}" target="_blank" rel="noopener">${escapeHtml(credit)}</a></span>`
        : `<span class="fig-credit">${escapeHtml(credit)}</span>`;
    }
    const captionHtml = caption ? `<span class="fig-caption">${escapeHtml(caption)}</span>` : "";
    return `
      <figure class="post-figure">
        <img src="${escapeAttr(fig.src)}" alt="${escapeAttr(caption)}">
        ${(captionHtml || creditHtml) ? `<figcaption>${captionHtml}${creditHtml}</figcaption>` : ""}
      </figure>`;
  }

  function renderPost(post) {
    if (!postView) return;
    const lang = currentLang();
    const title = pick(post.title, lang);
    const date = pick(post.date, lang);
    const body = (pick(post.body, lang) || []).slice();
    const figures = Array.isArray(post.figures) ? post.figures : [];

    // Separar cuerpo de referencias
    let refIdx = -1;
    for (let i = 0; i < body.length; i++) {
      if (refsRegex.test(body[i])) { refIdx = i; break; }
    }
    const mainParas = refIdx === -1 ? body : body.slice(0, refIdx);
    const refsTitle = refIdx === -1 ? null : body[refIdx];
    const refsItems = refIdx === -1 ? [] : body.slice(refIdx + 1);

    // Figuras por nº de párrafo (1-based, dentro de mainParas)
    const figsByPara = {};
    const trailingFigs = [];
    figures.forEach(fig => {
      const after = parseInt(fig.after, 10);
      if (after >= 1 && after <= mainParas.length) {
        (figsByPara[after] = figsByPara[after] || []).push(fig);
      } else {
        trailingFigs.push(fig);
      }
    });

    // Cuerpo + figuras intercaladas
    let bodyHtml = "";
    mainParas.forEach((p, j) => {
      bodyHtml += `<p>${escapeHtml(p)}</p>`;
      const num = j + 1;
      if (figsByPara[num]) figsByPara[num].forEach(f => { bodyHtml += renderFigure(f, lang); });
    });
    trailingFigs.forEach(f => { bodyHtml += renderFigure(f, lang); });

    // Referencias
    let refsHtml = "";
    if (refsTitle) {
      refsHtml = `<h2 class="post-refs-title">${escapeHtml(refsTitle)}</h2>`;
      if (refsItems.length) {
        refsHtml += `<ol class="post-refs">` +
          refsItems.map(r => `<li>${escapeHtml(r)}</li>`).join("") +
          `</ol>`;
      }
    }

    // Imagen destacada
    const imgHtml = post.image
      ? `<div class="post-cover duotone subtle"><img src="${escapeAttr(post.image)}" alt="${escapeAttr(title)}"></div>`
      : "";

    // Navegación anterior / siguiente
    const idx = posts.findIndex(p => p.id === post.id);
    const prev = idx > 0 ? posts[idx - 1] : null;
    const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;
    let navHtml = "";
    if (prev || next) {
      const prevHtml = prev
        ? `<a class="post-nav-link prev" href="blog.html?post=${encodeURIComponent(prev.id)}">
             <span class="post-nav-dir"><i class="fas fa-arrow-left"></i> ${escapeHtml(prevLabel[lang])}</span>
             <span class="post-nav-title">${escapeHtml(pick(prev.title, lang))}</span>
           </a>`
        : `<span class="post-nav-link empty"></span>`;
      const nextHtml = next
        ? `<a class="post-nav-link next" href="blog.html?post=${encodeURIComponent(next.id)}">
             <span class="post-nav-dir">${escapeHtml(nextLabel[lang])} <i class="fas fa-arrow-right"></i></span>
             <span class="post-nav-title">${escapeHtml(pick(next.title, lang))}</span>
           </a>`
        : `<span class="post-nav-link empty"></span>`;
      navHtml = `<nav class="post-nav">${prevHtml}${nextHtml}</nav>`;
    }

    postView.innerHTML = `
      <div class="post-inner">
        <a class="post-back" href="blog.html">
          <i class="fas fa-arrow-left"></i> <span>${escapeHtml(backLabel[lang])}</span>
        </a>
        <header class="post-header">
          <span class="post-date">${escapeHtml(date)}</span>
          <h1 class="post-title">${escapeHtml(title)}</h1>
        </header>
        ${imgHtml}
        <div class="post-body">
          ${bodyHtml}
          ${refsHtml}
        </div>
        ${navHtml}
      </div>`;

    // Título de pestaña / compartir
    document.title = title + " · Joaquín Reiris";
  }

  /* =========================================================
     ROUTING / TOGGLE DE VISTAS
     ========================================================= */
  let currentView = "list"; // "list" | "post"
  let currentPostId = null;

  function showList() {
    currentView = "list";
    currentPostId = null;
    if (postView) { postView.hidden = true; postView.innerHTML = ""; }
    if (grid) grid.style.display = "";
    if (listHeader) listHeader.style.display = "";
    renderCards();
  }

  function showPost(post) {
    currentView = "post";
    currentPostId = post.id;
    if (grid) grid.style.display = "none";
    if (listHeader) listHeader.style.display = "none";
    if (postView) postView.hidden = false;
    renderPost(post);
    window.scrollTo(0, 0);
  }

  function route() {
    const id = getPostIdFromUrl();
    const post = id ? posts.find(p => p.id === id) : null;
    if (post && postView) {
      showPost(post);
    } else {
      showList();
    }
  }

  // Re-render al cambiar de idioma (sin recargar)
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!posts.length) return;
      if (currentView === "post" && currentPostId) {
        const post = posts.find(p => p.id === currentPostId);
        if (post) renderPost(post);
      } else {
        renderCards();
      }
    });
  });

  // ---- Helpers de seguridad ----
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---- Carga ----
  fetch("posts.json")
    .then(r => { if (!r.ok) throw new Error("posts.json " + r.status); return r.json(); })
    .then(data => { posts = data.filter(p => !p.hidden); route(); })
    .catch(err => {
      console.warn("[blog] No se pudo cargar posts.json:", err.message);
    });
})();
