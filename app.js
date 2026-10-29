(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const HOME = { lat: 41.3933921, lon: 2.0099830 };
  const WORK_QUERY = "Ernesto Ventos SA, Ctra. Reial 120B, 08960 Sant Just Desvern";
  const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${HOME.lat}&longitude=${HOME.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&forecast_days=2&timezone=Europe%2FMadrid`;
  const NOTES_KEY = "mi-dia-v6-notes";
  const RAIN_KEY = "mi-dia-rain-alerts-v1"; // Keep existing V5/V5.1 rain preference compatibility.
  const THEME_KEY = "mi-dia-v6-theme";
  const WX = {0:["Despejado","☀"],1:["Mayormente despejado","🌤"],2:["Parcialmente nuboso","⛅"],3:["Nublado","☁"],45:["Niebla","🌫"],48:["Niebla","🌫"],51:["Llovizna ligera","🌦"],53:["Llovizna","🌦"],55:["Llovizna intensa","🌧"],56:["Llovizna helada","🌧"],57:["Llovizna helada","🌧"],61:["Lluvia ligera","🌦"],63:["Lluvia moderada","🌧"],65:["Lluvia intensa","🌧"],66:["Lluvia helada","🌧"],67:["Lluvia helada","🌧"],71:["Nieve ligera","🌨"],73:["Nieve moderada","🌨"],75:["Nieve intensa","❄"],77:["Granos de nieve","🌨"],80:["Chubascos ligeros","🌦"],81:["Chubascos moderados","🌧"],82:["Chubascos fuertes","⛈"],85:["Chubascos de nieve","🌨"],86:["Chubascos de nieve fuertes","🌨"],95:["Tormenta","⛈"],96:["Tormenta con granizo","⛈"],99:["Tormenta fuerte con granizo","⛈"]};
  let toastTimer = null;
  let lastWeatherData = null;

  function safeJSON(value, fallback) { try { return JSON.parse(value); } catch (_) { return fallback; } }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function fmtNum(value, suffix = "") { return Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 10) / 10}${suffix}` : "—"; }
  function fmtDuration(seconds) { const mins = Math.round(seconds / 60); return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`; }
  function toast(message) { const el = $("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }
  function setStatus(message) { $("status").textContent = message; }
  function formatLongDate(date) { return new Intl.DateTimeFormat("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(date); }
  function initDate() {
    const now = new Date(), hour = now.getHours();
    $("today-chip").textContent = new Intl.DateTimeFormat("es-ES", {day:"numeric",month:"short"}).format(now);
    $("date-long").textContent = `${formatLongDate(now)} · Sant Vicenç dels Horts`;
    $("greeting").textContent = hour < 12 ? "Buenos días. Vamos a por el día." : hour < 19 ? "Buenas tardes. Ponemos el día en orden." : "Buenas noches. Todo bajo control.";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light") document.documentElement.dataset.theme = "light";
    $("theme-toggle").textContent = saved === "light" ? "☾" : "☼";
    $("theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      if (next === "light") document.documentElement.dataset.theme = "light";
      else delete document.documentElement.dataset.theme;
      localStorage.setItem(THEME_KEY, next);
      $("theme-toggle").textContent = next === "light" ? "☾" : "☼";
      $("theme-toggle").setAttribute("aria-label", next === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
    });
  }

  async function loadWeather() {
    const response = await fetch(WEATHER_URL, {cache:"no-store"});
    if (!response.ok) throw new Error("No se pudo consultar la previsión meteorológica.");
    const data = await response.json();
    if (!data.current || !data.daily || !data.hourly) throw new Error("La previsión recibida está incompleta.");
    lastWeatherData = data;
    const current = data.current, daily = data.daily;
    const wx = WX[current.weather_code] || ["Condiciones variables","☁"];
    $("weather-now").textContent = fmtNum(current.temperature_2m, "°C");
    $("weather-description").textContent = wx[0];
    $("weather-symbol").textContent = wx[1];
    $("feels-like").textContent = fmtNum(current.apparent_temperature, "°C");
    $("wind").textContent = `Viento: ${fmtNum(current.wind_speed_10m, " km/h")}`;
    $("max-temp").textContent = fmtNum(daily.temperature_2m_max[0], "°C");
    $("min-temp").textContent = fmtNum(daily.temperature_2m_min[0], "°C");
    $("rain-today").textContent = fmtNum(daily.precipitation_sum[0], " mm");
    $("rain-prob").textContent = fmtNum(daily.precipitation_probability_max[0], "%");
    $("summary-temp").textContent = fmtNum(current.temperature_2m, "°");
    $("summary-weather").textContent = wx[0];
    const start = Math.max(0, data.hourly.time.findIndex(t => t >= current.time));
    const times = data.hourly.time.slice(start, start + 8);
    $("hourly").innerHTML = times.map(time => {
      const i = data.hourly.time.indexOf(time), desc = WX[data.hourly.weather_code[i]] || ["Variable","☁"];
      return `<div class="hour-item"><strong>${time.slice(11,16)}</strong><span class="hour-symbol" aria-hidden="true">${desc[1]}</span><span class="hour-temp">${fmtNum(data.hourly.temperature_2m[i],"°")}</span><span class="hour-rain">☂ ${Math.round(Number(data.hourly.precipitation_probability[i] || 0))}%</span></div>`;
    }).join("") || '<div class="loading-line">No hay datos horarios disponibles.</div>';
    $("weather-updated").textContent = `Actualizado ${new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date())}`;
    inspectRainForecast(data, true);
  }

  function getRainPrefs() { return safeJSON(localStorage.getItem(RAIN_KEY), null); }
  function setRainStatus(message) { $("rain-alert-status").textContent = message; }
  function inspectRainForecast(data, mayNotify = false) {
    const prefs = getRainPrefs();
    if (!prefs || !prefs.enabled || !data?.hourly) return;
    const hourly = data.hourly;
    const found = hourly.time.findIndex(t => t >= data.current.time);
    const start = Math.max(0, found);
    const threshold = Number(prefs.threshold || 50);
    let candidate = null;
    for (let i = start; i < Math.min(hourly.time.length, start + 25); i++) {
      const probability = Number(hourly.precipitation_probability[i] || 0);
      const amount = Number(hourly.precipitation[i] || 0);
      if (probability >= threshold && amount >= 0.1) { candidate = {time:hourly.time[i],probability,amount}; break; }
    }
    if (!candidate) { setRainStatus(`Avisos activados · no se prevé lluvia por encima del ${threshold}% en las próximas 24 horas.`); return; }
    const when = new Intl.DateTimeFormat("es-ES",{weekday:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(candidate.time));
    setRainStatus(`Posible lluvia: ${when} · ${Math.round(candidate.probability)}% de probabilidad.`);
    if (!mayNotify || !("Notification" in window) || Notification.permission !== "granted") return;
    const alertKey = `${candidate.time}:${threshold}`;
    if (prefs.lastAlert === alertKey) return;
    try {
      new Notification("Mi Día · posible lluvia", {body:`Sant Vicenç dels Horts: lluvia prevista ${when} (${Math.round(candidate.probability)}%).`,icon:"./icon.svg",tag:`mi-dia-rain-${candidate.time}`});
      prefs.lastAlert = alertKey;
      localStorage.setItem(RAIN_KEY, JSON.stringify(prefs));
    } catch (_) { setRainStatus("El navegador no ha permitido mostrar la notificación."); }
  }
  async function enableRainAlerts() {
    if (!("Notification" in window)) { setRainStatus("Este navegador no admite notificaciones. Puedes seguir consultando la previsión."); return; }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setRainStatus("Permiso no concedido. Revisa los ajustes del navegador si quieres activar los avisos."); return; }
    const old = getRainPrefs() || {};
    localStorage.setItem(RAIN_KEY, JSON.stringify({enabled:true,threshold:Number($("rain-threshold").value),lastAlert:old.lastAlert || null}));
    setRainStatus("Avisos activados. Consultando la previsión…");
    try { await loadWeather(); } catch (_) { setRainStatus("Avisos activados, pero no se pudo actualizar la previsión."); }
  }
  function initRainAlerts() {
    const prefs = getRainPrefs();
    if (prefs?.enabled) { $("rain-threshold").value = String(prefs.threshold || 50); setRainStatus("Avisos activados · se revisará la previsión mientras Mi Día esté abierto."); }
    $("enable-rain-alerts").addEventListener("click", enableRainAlerts);
    $("disable-rain-alerts").addEventListener("click", () => { localStorage.removeItem(RAIN_KEY); setRainStatus("Avisos desactivados."); });
    window.setInterval(() => { if (document.visibilityState === "visible" && getRainPrefs()?.enabled) loadWeather().catch(() => {}); }, 30 * 60 * 1000);
  }

  async function geocodeWork() {
    const cached = safeJSON(localStorage.getItem("mi-dia-work-coords"), null);
    if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lon)) return cached;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(WORK_QUERY)}`;
    const response = await fetch(url, {headers:{"Accept":"application/json"}});
    if (!response.ok) throw new Error("No se pudo localizar la dirección del trabajo.");
    const items = await response.json();
    if (!items.length) throw new Error("No se encontró la dirección para calcular la ruta.");
    const coords = {lat:Number(items[0].lat),lon:Number(items[0].lon)};
    localStorage.setItem("mi-dia-work-coords", JSON.stringify(coords));
    return coords;
  }
  async function loadTraffic() {
    const work = await geocodeWork();
    const coords = `${HOME.lon},${HOME.lat};${work.lon},${work.lat}`;
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`, {cache:"no-store"});
    if (!response.ok) throw new Error("No se pudo consultar la ruta por carretera.");
    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No se encontró una ruta por carretera.");
    const route = data.routes[0];
    $("drive-time").textContent = fmtDuration(route.duration);
    $("drive-distance").textContent = `${(route.distance / 1000).toFixed(1)} km por carretera`;
    $("return-time").textContent = fmtDuration(route.duration);
    $("return-distance").textContent = `${(route.distance / 1000).toFixed(1)} km por carretera`;
    $("summary-route").textContent = fmtDuration(route.duration);
    $("summary-route-foot").textContent = `${(route.distance / 1000).toFixed(1)} km · sin retenciones`;
    $("traffic-status").textContent = "Ruta calculada con OSRM/OpenStreetMap. La vuelta usa la misma estimación base; no incluye tráfico en tiempo real.";
  }

  function loadNotes() { const value = safeJSON(localStorage.getItem(NOTES_KEY), null); if (Array.isArray(value)) return value; const old = safeJSON(localStorage.getItem("mi-dia-notes"), []); return Array.isArray(old) ? old.map((text, i) => ({id:`old-${Date.now()}-${i}`,text:String(text),done:false,created:Date.now()})) : []; }
  function saveNotes(notes) { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); renderNotes(); }
  function renderNotes() {
    const notes = loadNotes();
    $("summary-notes").textContent = String(notes.filter(n => !n.done).length);
    $("notes-count").textContent = `${notes.length} nota${notes.length === 1 ? "" : "s"} guardada${notes.length === 1 ? "" : "s"}`;
    if (!notes.length) { $("notes").innerHTML = '<p class="empty-state">Todavía no hay notas. Añade la primera y aparecerá aquí.</p>'; return; }
    $("notes").innerHTML = notes.map(note => `<div class="note-item ${note.done ? "done" : ""}" data-note-id="${escapeHTML(note.id)}"><input class="note-check" type="checkbox" aria-label="Marcar como completada" ${note.done ? "checked" : ""}><span class="note-text">${escapeHTML(note.text)}</span><button class="note-delete" type="button" aria-label="Eliminar nota">Eliminar</button></div>`).join("");
  }
  function initNotes() {
    // Migrate the old V5/V5.1 list once, keeping the original key untouched as a fallback.
    if (!localStorage.getItem(NOTES_KEY)) {
      const old = safeJSON(localStorage.getItem("mi-dia-notes"), []);
      if (Array.isArray(old) && old.length) localStorage.setItem(NOTES_KEY, JSON.stringify(old.map((text,i)=>({id:`migrated-${Date.now()}-${i}`,text:String(text),done:false,created:Date.now()}))));
    }
    $("note-form").addEventListener("submit", event => {
      event.preventDefault();
      const text = $("quick-note").value.trim();
      if (!text) { $("quick-note").focus(); return; }
      const notes = loadNotes();
      notes.unshift({id:`n-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,text,done:false,created:Date.now()});
      saveNotes(notes.slice(0,100));
      $("quick-note").value = "";
      toast("Nota guardada en este móvil.");
    });
    $("notes").addEventListener("change", event => {
      if (!event.target.matches(".note-check")) return;
      const item = event.target.closest("[data-note-id]"), id = item?.dataset.noteId;
      saveNotes(loadNotes().map(note => note.id === id ? {...note,done:event.target.checked} : note));
    });
    $("notes").addEventListener("click", event => {
      const button = event.target.closest(".note-delete");
      if (!button) return;
      const id = button.closest("[data-note-id]")?.dataset.noteId;
      saveNotes(loadNotes().filter(note => note.id !== id));
      toast("Nota eliminada.");
    });
    $("clear-notes").addEventListener("click", () => {
      const notes = loadNotes();
      if (!notes.length) { toast("No hay notas que borrar."); return; }
      if (confirm("¿Borrar todas las notas guardadas en este móvil?")) { saveNotes([]); toast("Notas borradas."); }
    });
    $("export-data").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({app:"Mi Día",version:6,exportedAt:new Date().toISOString(),notes:loadNotes()},null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = `mi-dia-copia-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
      toast("Copia de tus notas preparada.");
    });
    $("import-file").addEventListener("change", async event => {
      const file = event.target.files?.[0]; if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const imported = Array.isArray(parsed) ? parsed : parsed.notes;
        if (!Array.isArray(imported)) throw new Error("Formato");
        const normalized = imported.filter(n => n && typeof n.text === "string").map((n,i)=>({id:`imp-${Date.now()}-${i}`,text:n.text.slice(0,180),done:Boolean(n.done),created:Number(n.created)||Date.now()}));
        if (!normalized.length) throw new Error("Vacío");
        saveNotes([...normalized,...loadNotes()].slice(0,100));
        toast(`Importadas ${normalized.length} notas.`);
      } catch (_) { toast("No se pudo importar. Usa una copia JSON de Mi Día."); }
      event.target.value = "";
    });
    renderNotes();
  }


  async function loadClubSchedule(teamId, targetId, label) {
    const target = $(targetId);
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/${teamId}/schedule?region=es&lang=es`;
    try {
      const response = await fetch(url, {cache:"no-store"});
      if (!response.ok) throw new Error("Calendario externo no disponible");
      const data = await response.json();
      const events = Array.isArray(data.events) ? data.events : [];
      const now = Date.now();
      const upcoming = events.filter(e => e.date && new Date(e.date).getTime() >= now).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
      const results = events.filter(e => e.date && new Date(e.date).getTime() < now && e.competitions?.[0]?.status?.type?.completed).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,1);
      if (!upcoming.length && !results.length) throw new Error("No hay calendario legible");
      const dateText = date => new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(date));
      const eventLine = (event, isResult=false) => {
        const competition = event.competitions?.[0] || {};
        const competitors = competition.competitors || [];
        const home = competitors.find(c=>c.homeAway === "home") || competitors[0];
        const away = competitors.find(c=>c.homeAway === "away") || competitors[1];
        if (!home || !away) return "";
        const homeName = home.team?.displayName || home.team?.name || "Local";
        const awayName = away.team?.displayName || away.team?.name || "Visitante";
        const status = competition.status?.type?.detail || competition.status?.type?.shortDetail || "";
        const score = isResult && home.score != null && away.score != null ? `<span class="fixture-mini-result">${escapeHTML(home.score)}–${escapeHTML(away.score)}</span>` : "";
        return `<div class="fixture-mini"><div class="fixture-mini-date">${escapeHTML(dateText(event.date))}</div><div class="fixture-mini-info"><strong>${escapeHTML(homeName)} – ${escapeHTML(awayName)}</strong><span>${escapeHTML(event.name || label)}${status ? " · " + escapeHTML(status) : ""}</span>${score}</div></div>`;
      };
      target.innerHTML = upcoming.map(e=>eventLine(e,false)).join("") || '<p class="sports-copy">No se han encontrado próximos partidos en la fuente automática.</p>';
      if (results.length) target.insertAdjacentHTML("beforeend", `<div class="small-status">Último resultado: ${eventLine(results[0],true)}</div>`);
    } catch (_) {
      target.innerHTML = `<p class="sports-copy">No se ha podido cargar el calendario automáticamente ahora mismo. Usa los enlaces oficiales de abajo.</p>`;
    }
  }

  function loadFootball() {
    // Public ESPN schedule endpoints: if unavailable, the official club calendar links remain visible.
    loadClubSchedule("86", "madrid-fixtures", "Real Madrid · LaLiga");
    loadClubSchedule("80", "espanyol-fixtures", "RCD Espanyol · LaLiga");
  }

  async function loadAll() {
    $("refresh").disabled = true;
    $("refresh").classList.add("is-loading");
    setStatus("Actualizando meteorología y ruta…");
    const results = await Promise.allSettled([loadWeather(),loadTraffic()]);
    const errors = results.filter(r => r.status === "rejected").map(r => r.reason?.message || "Error desconocido");
    const stamp = new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    setStatus(errors.length ? `Actualización ${stamp}. ${errors.join(" ")}` : `Todo actualizado a las ${stamp}.`);
    if (errors.length) $("traffic-status").textContent = errors.join(" ");
    $("refresh").disabled = false;
    $("refresh").classList.remove("is-loading");
  }

  $("refresh").addEventListener("click", loadAll);
  $("back-to-top").addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));
  initDate();
  initTheme();
  initRainAlerts();
  initNotes();
  loadFootball();
  loadAll();
  $("summary-football").textContent = "FCF";
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();