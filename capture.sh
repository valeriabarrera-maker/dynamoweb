#!/usr/bin/env bash
# Captura fiel de cada ruta de comite-ideas.vercel.app a HTML estatico.
# Limpia: marcadores UNTRUSTED (sed 1d;$d) y nodos inyectados por gstack.
set -u
export PATH="$HOME/.bun/bin:$PATH"
B="$HOME/.claude/skills/gstack/browse/dist/browse"
OUT="$HOME/dynamo"
BASE="https://comite-ideas.vercel.app"
mkdir -p "$OUT"

# remove gstack-injected DOM before dumping
strip_gstack='document.querySelectorAll("#gstack-ctrl").forEach(e=>e.remove());Array.from(document.querySelectorAll("style")).forEach(s=>{if(s.textContent&&s.textContent.includes("gstack-shimmer"))s.remove()});"ok"'

capture () {
  local route="$1" file="$2"
  $B goto "${BASE}${route}" >/dev/null 2>&1
  $B wait --networkidle >/dev/null 2>&1
  sleep 2                                  # dar tiempo a render de charts/datos
  local url; url=$($B url 2>/dev/null | tail -1)
  $B js "$strip_gstack" >/dev/null 2>&1
  $B html 2>/dev/null | sed '1d;$d' > "${OUT}/${file}"
  local bytes; bytes=$(wc -c < "${OUT}/${file}" | tr -d ' ')
  printf "%-28s -> %-22s %8s bytes   (url: %s)\n" "$route" "$file" "$bytes" "$url"
}

echo "=== Capturando rutas ==="
capture "/"                          "index.html"
capture "/usuarios"                  "usuarios.html"
capture "/usuarios/crear"            "usuarios-crear.html"
capture "/comites"                   "comites.html"
capture "/comites/nuevo"             "comites-nuevo.html"
capture "/comites/ideas"             "ideas-banco.html"
capture "/comites/ideas/preaprobar"  "ideas-preaprobar.html"
capture "/login"                     "login.html"
echo "=== Listo. Archivos en $OUT ==="
ls -la "$OUT"/*.html
