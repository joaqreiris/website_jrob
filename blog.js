/* =========================================================
   blog.js — Renderiza el blog desde posts.json
   ---------------------------------------------------------
   Para publicar una entrada nueva: añade un objeto a posts.json
   No hace falta tocar HTML ni este archivo.
   ========================================================= */
(function () {
  "use strict";

  const grid = document.querySelector(".blog-grid");
  if (!grid) return; // No estamos en la página con blog

  const modal = document.getElementById("blog-modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.querySelector(".close-modal");

  // ---- Render de tarjetas ----
  function renderCards(posts) {
    grid.innerHTML = posts.map((post, i) => `
      <article class="blog-card" data-aos="fade-up"${i ? ' data-aos-delay="' + (i * 100) + '"' : ''}>
        <div class="blog-img duotone subtle">
          <img src="${post.image}" alt="${escapeAttr(post.title)}">
        </div>
        <div class="blog-info">
          <span class="blog-date">${escapeHtml(post.date)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <a href="#" class="read-more" data-post="${escapeAttr(post.id)}">
            <span>Leer artículo</span> <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join("");

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
    modalBody.innerHTML = `
      <span class="modal-date">${escapeHtml(post.date)}</span>
      <h2 class="modal-title">${escapeHtml(post.title)}</h2>
      ${post.body.map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function hideModal() {
    if (!modal) return;
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", hideModal);
  window.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") hideModal(); });

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
    .then(renderCards)
    .catch(err => {
      console.warn("[blog] No se pudo cargar posts.json:", err.message);
      // Si el grid ya trae tarjetas estáticas de respaldo, se quedan; si no, queda vacío.
    });
})();
