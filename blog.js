/* =========================================================
   blog.js — Renderiza el blog desde posts.json (multiidioma)
   ---------------------------------------------------------
   Para publicar una entrada nueva: añade un objeto a posts.json.
   Cada campo traducible (date, title, excerpt, body) es un objeto
   { "es": ..., "en": ..., "pt": ... }. Si falta un idioma, usa "es".
   No hace falta tocar HTML ni este archivo.
   ========================================================= */
(function () {
  "use strict";

  const grid = document.querySelector(".blog-grid");
  if (!grid) return; // No estamos en la página con blog

  const modal = document.getElementById("blog-modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.querySelector(".close-modal");

  let posts = [];          // datos crudos de posts.json
  let openPostId = null;   // post abierto en el modal (para re-render al cambiar idioma)

  // "Leer artículo" por idioma
  const readMoreLabel = { es: "Leer artículo", en: "Read article", pt: "Ler artigo" };

  function currentLang() {
    const l = document.documentElement.lang || "es";
    return ["es", "en", "pt"].indexOf(l) !== -1 ? l : "es";
  }

  // Devuelve el valor del campo en el idioma actual, con fallback a es / valor plano
  function pick(field, lang) {
    if (field && typeof field === "object" && !Array.isArray(field)) {
      return field[lang] || field.es || Object.values(field)[0] || "";
    }
    return field; // compat: campo plano (string o array)
  }

  // ---- Render de tarjetas ----
  function renderCards() {
    const lang = currentLang();
    grid.innerHTML = posts.map((post, i) => {
      const title = pick(post.title, lang);
      const date = pick(post.date, lang);
      const excerpt = pick(post.excerpt, lang);
      return `
      <article class="blog-card" data-aos="fade-up"${i ? ' data-aos-delay="' + (i * 100) + '"' : ''}>
        <div class="blog-img duotone subtle">
          <img src="${post.image}" alt="${escapeAttr(title)}">
        </div>
        <div class="blog-info">
          <span class="blog-date">${escapeHtml(date)}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(excerpt)}</p>
          <a href="#" class="read-more" data-post="${escapeAttr(post.id)}">
            <span>${escapeHtml(readMoreLabel[lang])}</span> <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </article>`;
    }).join("");

    // Re-evaluar animaciones AOS sobre las nuevas tarjetas
    if (window.AOS && typeof window.AOS.refresh === "function") window.AOS.refresh();

    // Vincular "Leer artículo"
    grid.querySelectorAll(".read-more").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const post = posts.find(p => p.id === link.getAttribute("data-post"));
        if (post) openModal(post);
      });
    });
  }

  // ---- Modal ----
  function openModal(post) {
    if (!modal || !modalBody) return;
    openPostId = post.id;
    const lang = currentLang();
    const title = pick(post.title, lang);
    const date = pick(post.date, lang);
    const body = pick(post.body, lang) || [];
    modalBody.innerHTML = `
      <span class="modal-date">${escapeHtml(date)}</span>
      <h2 class="modal-title">${escapeHtml(title)}</h2>
      ${body.map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function hideModal() {
    if (!modal) return;
    openPostId = null;
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", hideModal);
  window.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") hideModal(); });

  // Re-renderizar cuando el usuario cambia de idioma
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!posts.length) return;
      renderCards();
      // Si hay un artículo abierto, refrescar su contenido al nuevo idioma
      if (openPostId) {
        const post = posts.find(p => p.id === openPostId);
        if (post) openModal(post);
      }
    });
  });

  // ---- Helpers de seguridad ----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---- Carga ----
  fetch("posts.json")
    .then(r => { if (!r.ok) throw new Error("posts.json " + r.status); return r.json(); })
    .then(data => { posts = data; renderCards(); })
    .catch(err => {
      console.warn("[blog] No se pudo cargar posts.json:", err.message);
      // Si el grid ya trae tarjetas estáticas de respaldo, se quedan; si no, queda vacío.
    });
})();
