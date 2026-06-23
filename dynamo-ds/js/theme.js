/* =========================================================
   DYNAMO — Conmutador de tema (claro / oscuro)
   El tema oscuro (navy HUD) es el predeterminado. Este script
   inyecta un boton en el header (o flotante en vistas sin header,
   como login) para alternar al tema claro, que reutiliza los
   MISMOS estilos via tokens. La preferencia se guarda en
   localStorage y se aplica antes del pintado por un snippet inline
   en el <head> (evita el parpadeo / FOUC).
   ========================================================= */
(function () {
  "use strict";

  var KEY = "dynamo-theme";
  var root = document.documentElement;
  var btn = null;

  // Iconos (mismo trazo fino que el sistema de diseno)
  var SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';

  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function paint(theme) {
    if (!btn) return;
    var toLight = theme === "dark"; // accion: pasar a claro
    btn.innerHTML = toLight ? SUN : MOON;
    var label = toLight ? "Activar modo claro" : "Activar modo oscuro";
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    paint(theme);
  }

  function build() {
    // Asegura un valor de tema aunque falte el snippet inline del head
    if (root.getAttribute("data-theme") !== "light" &&
        root.getAttribute("data-theme") !== "dark") {
      var saved = "dark";
      try {
        saved = localStorage.getItem(KEY) || "dark";
      } catch (e) {}
      root.setAttribute("data-theme", saved);
    }

    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dyn-theme-toggle";
    btn.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
    });

    var header = document.querySelector("header");
    if (header) {
      // Cluster de acciones a la derecha del header (ultimo <div> directo)
      var divs = header.querySelectorAll(":scope > div");
      var cluster = divs.length ? divs[divs.length - 1] : header;
      cluster.insertBefore(btn, cluster.firstChild);
    } else {
      // Vistas sin header (login): boton flotante
      btn.classList.add("dyn-theme-toggle--float");
      document.body.appendChild(btn);
    }

    paint(current());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
