/* =========================================================
   DYNAMO — Navegacion lateral (standalone, sin React)
   Los snapshots estaticos tienen el JS de Next neutralizado, asi
   que el desplegable original no funciona y en algunas paginas el
   submenu de "Usuarios" ni siquiera esta en el DOM (capturado
   colapsado). Este script reconstruye un menu consistente en TODAS
   las paginas: iconos del sistema de diseno, todos los submodulos
   presentes, toggle de expandir/colapsar funcional y estado activo
   segun la pagina actual.
   ========================================================= */
(function () {
  "use strict";

  // Iconos del sistema de diseno (mismas formas que el storybook)
  var I = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>',
    users:
      '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0112 0"/><path d="M16 5.5a3 3 0 010 5.5"/><path d="M16.5 14.2A6 6 0 0121 19"/>',
    conex:
      '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6.5 7.2L11 16.5M17.5 7.2L13 16.5M7 6h10"/>',
    spark: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/>',
    list: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    add: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    db: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/><path d="M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/>',
    check: '<path d="M4 12l5 6L20 5"/>'
  };

  // Modelo del menu (un solo origen de verdad para todas las paginas)
  var MODEL = {
    top: { text: "Inicio", href: "index.html", icon: I.home, match: ["index.html", ""] },
    groups: [
      {
        text: "Usuarios",
        icon: I.users,
        items: [
          { text: "Gestionar", href: "usuarios.html", icon: I.list, match: ["usuarios.html", "usuarios-editar"] },
          { text: "Crear", href: "usuarios-crear.html", icon: I.add, match: ["usuarios-crear"] }
        ]
      },
      {
        text: "Comités",
        icon: I.conex,
        items: [
          { text: "Ver Todos", href: "comites.html", icon: I.list, match: ["comites.html"] },
          { text: "Crear Nuevo", href: "comites-nuevo.html", icon: I.add, match: ["comites-nuevo"] }
        ]
      },
      {
        text: "Ideas",
        icon: I.spark,
        items: [
          { text: "Banco de ideas", href: "ideas-banco.html", icon: I.db, match: ["ideas-banco"] },
          { text: "Preaprobación", href: "ideas-preaprobar.html", icon: I.check, match: ["ideas-preaprobar"] }
        ]
      }
    ]
  };

  function ico(paths, size) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="h-' + size + " w-" + size + '" aria-hidden="true">' +
      paths +
      "</svg>"
    );
  }

  function currentFile() {
    var f = (location.pathname.split("/").pop() || "").toLowerCase();
    return f || "index.html";
  }

  function matches(file, list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m === "" ) { if (file === "index.html") return true; continue; }
      if (file === m || file.indexOf(m) === 0) return true;
    }
    return false;
  }

  var ACTIVE = "bg-dynamo-blue-dark text-white font-semibold";
  var IDLE = "text-neutral-700 hover:bg-neutral-100";

  function render(nav) {
    var file = currentFile();
    var topActive = matches(file, MODEL.top.match);
    var html = "";

    // Item superior: Inicio
    html +=
      '<a class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ' +
      (topActive ? ACTIVE : IDLE) +
      '" href="' + MODEL.top.href + '">' + ico(MODEL.top.icon, 5) + "<span>" + MODEL.top.text + "</span></a>";

    // Grupos con submenu
    MODEL.groups.forEach(function (g) {
      var activeItem = null;
      g.items.forEach(function (it) {
        if (!activeItem && matches(file, it.match)) activeItem = it;
      });
      var expanded = !!activeItem;

      html += '<div class="space-y-1">';
      html +=
        '<button type="button" data-dyn-group class="flex w-full cursor-pointer items-center gap-3 ' +
        'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors text-neutral-700 hover:bg-neutral-100">' +
        ico(g.icon, 5) +
        '<span class="flex-1 text-left font-semibold">' + g.text + "</span>" +
        '<svg class="dyn-chevron h-4 w-4" style="transition:transform .18s ease" fill="none" ' +
        'stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
        "</button>";

      html += '<div class="ml-4 space-y-1 border-l-2 border-neutral-200 pl-4" data-dyn-sub' + (expanded ? "" : " hidden") + ">";
      g.items.forEach(function (it) {
        var on = it === activeItem;
        html +=
          '<a class="flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors font-semibold ' +
          (on ? ACTIVE : IDLE) +
          '" href="' + it.href + '">' + ico(it.icon, 4) + "<span>" + it.text + "</span></a>";
      });
      html += "</div></div>";
    });

    nav.innerHTML = html;

    // Toggle expandir / colapsar (con rotacion del chevron)
    Array.prototype.forEach.call(nav.querySelectorAll("[data-dyn-group]"), function (btn) {
      var sub = btn.nextElementSibling;
      var chev = btn.querySelector(".dyn-chevron");
      function setOpen(open) {
        if (!sub) return;
        sub.hidden = !open;
        if (chev) chev.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
      }
      setOpen(sub && !sub.hidden);
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setOpen(sub && sub.hidden);
      });
    });
  }

  function init() {
    var nav = document.querySelector("aside nav");
    if (!nav) return; // login u otras vistas sin menu
    render(nav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
