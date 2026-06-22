/* =========================================================
   DYNAMO — UI runtime (standalone, sin React)
   1) Sustituye los iconos de contenido (Lucide) por los del
      sistema de diseno del storybook.
   2) Convierte los desplegables muertos de Radix/shadcn (el JS
      de Next esta neutralizado, no abren) en <select> nativos
      funcionales con el aspecto .dyn-select del storybook.
   Corre despues de nav.js.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1) ICONOS DE CONTENIDO → SISTEMA DE DISEÑO ---------- */
  var ICONS = {
    "lucide-pencil": '<path d="M14 6l4 4L8 20H4v-4z"/><path d="M13 7l4 4"/>',
    "lucide-square-pen": '<path d="M14 6l4 4L8 20H4v-4z"/><path d="M13 7l4 4"/>',
    "lucide-pen": '<path d="M14 6l4 4L8 20H4v-4z"/><path d="M13 7l4 4"/>',
    "lucide-search": '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
    "lucide-calendar": '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4"/>',
    "lucide-clock": '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 3"/>',
    "lucide-x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "lucide-plus": '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    "lucide-check": '<path d="M4 12l5 6L20 5"/>',
    "lucide-check-check": '<path d="M4 12l5 6L20 5"/>',
    "lucide-trash": '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v6M14 11v6"/>',
    "lucide-trash-2": '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v6M14 11v6"/>',
    "lucide-list": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "lucide-lightbulb": '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/>',
    "lucide-users": '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0112 0"/><path d="M16 5.5a3 3 0 010 5.5"/><path d="M16.5 14.2A6 6 0 0121 19"/>',
    "lucide-users-round": '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6.5 7.2L11 16.5M17.5 7.2L13 16.5M7 6h10"/>',
    "lucide-user": '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>',
    "lucide-house": '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>',
    "lucide-clipboard-list": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 16h6"/>',
    "lucide-info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.7"/>',
    "lucide-menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "lucide-chevron-down": '<path d="M6 9l6 6 6-6"/>',
    "lucide-chevron-up": '<path d="M18 15l-6-6-6 6"/>',
    "lucide-chevron-right": '<path d="M9 6l6 6-6 6"/>',
    "lucide-chevron-left": '<path d="M15 6l-6 6 6 6"/>'
  };

  function swapIcons(root) {
    var svgs = (root || document).querySelectorAll('svg[class*="lucide-"]');
    Array.prototype.forEach.call(svgs, function (svg) {
      var cls = svg.getAttribute("class") || "";
      var m = cls.match(/lucide-[a-z0-9-]+/g);
      if (!m) return;
      for (var i = 0; i < m.length; i++) {
        var paths = ICONS[m[i]];
        if (paths) {
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "1.6");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");
          svg.innerHTML = paths;
          return;
        }
      }
    });
  }

  /* ---------- 2) DESPLEGABLES → <select> NATIVO FUNCIONAL ---------- */
  function norm(s) {
    return (s || "").toLowerCase().trim();
  }
  function labelFor(t) {
    var id = t.id;
    if (id) {
      var l = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
      if (l) return l.textContent;
    }
    if (t.getAttribute("aria-label")) return t.getAttribute("aria-label");
    return id || "";
  }
  function optionsFor(key, current) {
    var k = norm(key), c = norm(current);
    var ROL = ["Usuario", "Administrador"];
    var EST = ["Activo", "Inactivo", "Borrador"];
    var IDEA = ["Todas", "Pendientes", "Preaprobadas", "Aprobadas", "Rechazadas"];
    var base = null;
    if (k.indexOf("rol") >= 0 || k.indexOf("role") >= 0) base = ROL;
    else if (k.indexOf("estado") >= 0 || k.indexOf("status") >= 0) base = EST;
    else if (["usuario", "administrador"].indexOf(c) >= 0) base = ROL;
    else if (["activo", "inactivo", "borrador"].indexOf(c) >= 0) base = EST;
    else if (IDEA.map(norm).indexOf(c) >= 0) base = IDEA;
    if (!base) return null; // no es un select de enum (p.ej. fecha) → no convertir
    var opts = [], seen = {};
    function push(v) {
      var n = norm(v);
      if (v && !seen[n]) { seen[n] = 1; opts.push(v); }
    }
    push(current); // valor visible actual queda como seleccionado
    base.forEach(push);
    return opts;
  }
  function makeSelect(t) {
    var current = (t.textContent || "").replace(/\s+/g, " ").trim();
    var opts = optionsFor(labelFor(t), current);
    if (!opts) return null;
    var sel = document.createElement("select");
    sel.className = "dyn-native-select";
    if (t.id) sel.id = t.id;
    if (t.getAttribute("aria-label")) sel.setAttribute("aria-label", t.getAttribute("aria-label"));
    opts.forEach(function (o) {
      var op = document.createElement("option");
      op.value = o;
      op.textContent = o;
      if (norm(o) === norm(current)) op.selected = true;
      sel.appendChild(op);
    });
    return sel;
  }
  function fixDropdowns() {
    var triggers = document.querySelectorAll('[role="combobox"],[data-slot="select-trigger"]');
    Array.prototype.forEach.call(triggers, function (t) {
      var sel = makeSelect(t);
      if (sel && t.parentNode) t.parentNode.replaceChild(sel, t);
    });
    // limpia los paneles abiertos / portales de Radix que quedaron estaticos
    document
      .querySelectorAll(
        '[data-radix-popper-content-wrapper],[data-slot="popover-content"],[data-slot="command"],[role="listbox"]'
      )
      .forEach(function (el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
  }

  /* ---------- 3) DATE PICKERS → <input type="date"> FUNCIONAL ---------- */
  var MESES = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7,
    agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
  };
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function parseFecha(txt) {
    var m = (txt || "").match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
    if (!m) {
      var iso = (txt || "").match(/(\d{4})-(\d{2})-(\d{2})/);
      return iso ? iso[0] : "";
    }
    var mon = MESES[m[2].toLowerCase()];
    if (!mon) return "";
    return m[3] + "-" + pad2(mon) + "-" + pad2(parseInt(m[1], 10));
  }
  function findLabel(el) {
    var p = el, hops = 0;
    while (p && hops < 5) {
      var l = p.querySelector && p.querySelector("label");
      if (l) return l;
      p = p.parentElement;
      hops++;
    }
    return null;
  }
  var MES_LONG = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var MES_SHORT = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  function iso(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function fmtShort(d) { return d.getDate() + " " + MES_SHORT[d.getMonth()] + " " + d.getFullYear(); }

  // Calendario personalizado con estilos del storybook (HUD navy + neon)
  function makeDatePicker(initial, fieldId) {
    var wrap = document.createElement("div");
    wrap.className = "dyn-datepicker";

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.className = "dyn-datepicker__value";
    if (fieldId) hidden.id = fieldId;

    var field = document.createElement("button");
    field.type = "button";
    field.className = "dyn-datepicker__field";

    var pop = document.createElement("div");
    pop.className = "dyn-datepicker__pop";
    pop.hidden = true;

    var ICON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="dyn-datepicker__ico" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>';

    var selected = initial ? new Date(initial.getFullYear(), initial.getMonth(), initial.getDate()) : null;
    var view = new Date((selected || new Date()).getTime());
    view.setDate(1);

    function renderField() {
      field.innerHTML =
        '<span class="dyn-datepicker__txt' + (selected ? "" : " is-placeholder") + '">' +
        (selected ? fmtShort(selected) : "Seleccionar fecha") + "</span>" + ICON;
      hidden.value = selected ? iso(selected) : "";
    }
    function renderPop() {
      var y = view.getFullYear(), m = view.getMonth();
      var startDow = (new Date(y, m, 1).getDay() + 6) % 7; // lunes = 0
      var days = new Date(y, m + 1, 0).getDate();
      var h =
        '<div class="dyn-datepicker__head">' +
        '<button type="button" class="dyn-datepicker__nav" data-prev aria-label="Mes anterior">&#8249;</button>' +
        '<span class="dyn-datepicker__title">' + MES_LONG[m] + " " + y + "</span>" +
        '<button type="button" class="dyn-datepicker__nav" data-next aria-label="Mes siguiente">&#8250;</button></div>';
      h += '<div class="dyn-datepicker__grid">';
      ["L", "M", "X", "J", "V", "S", "D"].forEach(function (d) {
        h += '<span class="dyn-datepicker__dow">' + d + "</span>";
      });
      for (var i = 0; i < startDow; i++) h += "<span></span>";
      for (var dd = 1; dd <= days; dd++) {
        var sel = selected && selected.getFullYear() === y && selected.getMonth() === m && selected.getDate() === dd;
        h += '<button type="button" class="dyn-datepicker__day' + (sel ? " is-selected" : "") + '" data-day="' + dd + '">' + dd + "</button>";
      }
      h += "</div>";
      pop.innerHTML = h;
    }
    // El calendario se monta en <body> (portal) y se posiciona en fixed:
    // asi escapa al clip-path/overflow de las cards del storybook.
    pop.style.position = "fixed";
    function place() {
      var r = field.getBoundingClientRect();
      pop.style.left = r.left + "px";
      pop.style.top = r.bottom + 6 + "px";
    }
    field.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (pop.hidden) { renderPop(); place(); pop.hidden = false; } else { pop.hidden = true; }
    });
    pop.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      if (b.hasAttribute("data-prev")) { view.setMonth(view.getMonth() - 1); renderPop(); return; }
      if (b.hasAttribute("data-next")) { view.setMonth(view.getMonth() + 1); renderPop(); return; }
      if (b.hasAttribute("data-day")) {
        selected = new Date(view.getFullYear(), view.getMonth(), parseInt(b.getAttribute("data-day"), 10));
        renderField();
        pop.hidden = true;
      }
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target) && !pop.contains(e.target)) pop.hidden = true;
    });

    wrap.appendChild(hidden);
    wrap.appendChild(field);
    document.body.appendChild(pop);
    renderField();
    return wrap;
  }

  function fixDatePickers() {
    var trigs = document.querySelectorAll('[data-slot="popover-trigger"]:not([role="combobox"])');
    Array.prototype.forEach.call(trigs, function (t) {
      var label = findLabel(t);
      var isDate =
        (label && /fecha|date/i.test(label.textContent)) ||
        t.querySelector('svg[class*="calendar"]');
      if (!isDate) return;
      var val = parseFecha((t.textContent || "").trim());
      var initial = val ? new Date(val + "T00:00:00") : null;
      var widget = makeDatePicker(initial, label && label.getAttribute("for"));
      if (t.parentNode) t.parentNode.replaceChild(widget, t);
    });
  }

  /* ---------- 4) MENU DE USUARIO (combina usuario + cerrar sesion) ---------- */
  function buildUserMenu() {
    var header = document.querySelector("header");
    if (!header) return;
    var avatar = header.querySelector('.rounded-full');
    if (!avatar) return;
    var logout = Array.prototype.slice
      .call(header.querySelectorAll('[data-slot="button"], button'))
      .filter(function (b) { return /cerrar sesi/i.test(b.textContent || ""); })[0];
    if (!logout) return;
    var userBlock = avatar.parentElement;       // avatar + nombre
    var cluster = userBlock.parentElement;       // contenedor derecho del header
    if (!userBlock || !cluster) return;

    var menu = document.createElement("div");
    menu.className = "dyn-usermenu";

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "dyn-usermenu__trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.appendChild(userBlock); // reubica avatar + nombre dentro del trigger
    var chev = document.createElement("span");
    chev.className = "dyn-usermenu__chev";
    chev.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    trigger.appendChild(chev);

    var panel = document.createElement("div");
    panel.className = "dyn-usermenu__panel";
    panel.hidden = true;
    logout.classList.add("dyn-usermenu__item");
    panel.appendChild(logout); // mueve "Cerrar Sesion" al panel

    menu.appendChild(trigger);
    menu.appendChild(panel);
    cluster.appendChild(menu);

    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      trigger.classList.toggle("is-open", open);
    }
    trigger.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      setOpen(panel.hidden);
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target)) setOpen(false);
    });
  }

  function init() {
    try { swapIcons(document); } catch (e) {}
    try { fixDropdowns(); } catch (e) {}
    try { fixDatePickers(); } catch (e) {}
    try { buildUserMenu(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
