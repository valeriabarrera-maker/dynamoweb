/* =========================================================
   DYNAMO — Tema fijo (oscuro)
   El tema oscuro (navy HUD) es el unico tema. Se fuerza el
   atributo data-theme="dark" y se limpia cualquier preferencia
   guardada. No se inyecta ningun boton de conmutacion.
   ========================================================= */
(function () {
  "use strict";

  var KEY = "dynamo-theme";
  document.documentElement.setAttribute("data-theme", "dark");
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
})();
