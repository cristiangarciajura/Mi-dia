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
    if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lon) && cached.lat > 41.2 && cached.lat < 41.6 && cached.lon > 1.7 && cached.lon < 2.4) return cached;
    const queries = [WORK_QUERY, "Ctra. Reial 120B, 08960 Sant Just Desvern, Barcelona, Spain", "Ernesto Ventos Sant Just Desvern"];
    let lastError = null;
    for (const query of queries) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {headers:{"Accept":"application/json"},cache:"no-store"});
        if (!response.ok) throw new Error("El servicio de mapas no ha respondido.");
        const items = await response.json();
        if (!items.length) continue;
        const coords = {lat:Number(items[0].lat),lon:Number(items[0].lon)};
        if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) continue;
        localStorage.setItem("mi-dia-work-coords", JSON.stringify(coords));
        return coords;
      } catch (error) { lastError = error; }
    }
    throw new Error(lastError?.message || "No se encontró la dirección exacta del trabajo. Revisa la dirección o abre Google Maps.");
  }
  async function getRoadRoute(from, to) {
    const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`, {cache:"no-store"});
    if (!response.ok) throw new Error("El servicio de rutas no ha respondido.");
    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No se encontró una ruta por carretera.");
    return data.routes[0];
  }
  async function loadTraffic() {
    const work = await geocodeWork();
    const [outbound, inbound] = await Promise.all([getRoadRoute(HOME, work), getRoadRoute(work, HOME)]);
    $("drive-time").textContent = fmtDuration(outbound.duration);
    $("drive-distance").textContent = `${(outbound.distance / 1000).toFixed(1)} km por carretera`;
    $("return-time").textContent = fmtDuration(inbound.duration);
    $("return-distance").textContent = `${(inbound.distance / 1000).toFixed(1)} km por carretera`;
    $("summary-route").textContent = fmtDuration(outbound.duration);
    $("summary-route-foot").textContent = `${(outbound.distance / 1000).toFixed(1)} km · sin retenciones`;
    const stamp = new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    $("traffic-status").textContent = `Ruta recalculada a las ${stamp} con OSRM/OpenStreetMap. Ida y vuelta se calculan por separado; no incluye tráfico en tiempo real.`;
    return {ok:true};
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


  function ymd(date) {
    return `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  }
  function clubMatch(event, clubKey) {
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const home = competitors.find(c => c.homeAway === "home") || competitors[0];
    const away = competitors.find(c => c.homeAway === "away") || competitors[1];
    if (!home || !away) return null;
    const homeName = home.team?.displayName || home.team?.name || "Local";
    const awayName = away.team?.displayName || away.team?.name || "Visitante";
    const names = `${homeName} ${awayName} ${event.name || ""}`.toLocaleLowerCase("es");
    const isMadrid = /real madrid/.test(names);
    const isEspanyol = /espanyol/.test(names);
    if (clubKey === "madrid" ? !isMadrid : !isEspanyol) return null;
    return {event, competition, home, away, homeName, awayName};
  }
  async function fetchScoreboard(league, from, to) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${from}-${to}&limit=1000&region=es&lang=es`;
    const response = await fetch(url, {cache:"no-store"});
    if (!response.ok) throw new Error(`Calendario ${league} no disponible (${response.status}).`);
    const data = await response.json();
    return Array.isArray(data.events) ? data.events : [];
  }
  async function loadClubSchedule(targetId, clubKey) {
    const target = $(targetId);
    target.innerHTML = '<p class="sports-copy">Actualizando calendario…</p>';
    const now = new Date();
    const future = new Date(now); future.setDate(future.getDate()+100);
    const from = ymd(now), to = ymd(future);
    try {
      const leagues = clubKey === "madrid" ? ["esp.1", "uefa.champions"] : ["esp.1"];
      const responses = await Promise.allSettled(leagues.map(league => fetchScoreboard(league, from, to)));
      const events = responses.filter(r=>r.status==="fulfilled").flatMap(r=>r.value);
      if (!events.length) throw new Error("No se han recibido calendarios de las fuentes deportivas.");
      const unique = new Map();
      events.forEach(e => { if (e.id) unique.set(e.id, e); });
      const allEvents = [...unique.values()];
      const upcoming = allEvents.filter(e => e.date && new Date(e.date).getTime() >= Date.now()-60*60*1000)
        .map(e => clubMatch(e, clubKey)).filter(Boolean)
        .sort((a,b)=>new Date(a.event.date)-new Date(b.event.date)).slice(0,2);
      const results = allEvents.filter(e=>e.date && new Date(e.date).getTime()<Date.now() && e.competitions?.[0]?.status?.type?.completed)
        .map(e=>clubMatch(e,clubKey)).filter(Boolean).sort((a,b)=>new Date(b.event.date)-new Date(a.event.date)).slice(0,1);
      if (!upcoming.length && !results.length) throw new Error("No encontramos partidos del equipo en el periodo consultado.");
      const dateText = date => new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(date));
      const render = (match, result=false) => {
        const {event,competition,home,away,homeName,awayName}=match;
        const compName = competition?.name || event.league?.name || "Fútbol";
        const score = result && home.score != null && away.score != null ? `<span class="fixture-mini-result">${escapeHTML(home.score)}–${escapeHTML(away.score)}</span>` : "";
        return `<div class="fixture-mini"><div class="fixture-mini-date">${escapeHTML(dateText(event.date))}</div><div class="fixture-mini-info"><strong>${escapeHTML(homeName)} – ${escapeHTML(awayName)}</strong><span>${escapeHTML(compName)}</span>${score}</div></div>`;
      };
      target.innerHTML = upcoming.length ? upcoming.map(m=>render(m)).join("") : '<p class="sports-copy">No aparecen más partidos futuros en el periodo consultado.</p>';
      if (results.length) target.insertAdjacentHTML("beforeend", `<div class="small-status">Último resultado: ${render(results[0],true)}</div>`);
      if (responses.some(r=>r.status==="rejected")) target.insertAdjacentHTML("beforeend", '<p class="small-status">Aviso: una competición no respondió; el calendario puede estar incompleto.</p>');
      return {ok:true, count:upcoming.length};
    } catch (error) {
      target.innerHTML = `<p class="sports-copy">No se ha podido actualizar automáticamente: ${escapeHTML(error.message || "error de conexión")}</p><p class="small-status">Consulta los calendarios oficiales enlazados debajo.</p>`;
      return {ok:false, error:error.message || "Error al consultar fútbol"};
    }
  }

  async function loadFootball() {
    const results = await Promise.all([loadClubSchedule("madrid-fixtures", "madrid"), loadClubSchedule("espanyol-fixtures", "espanyol")]);
    const ok = results.filter(r=>r.ok).length;
    return {ok:ok===2, message:`Fútbol: ${ok}/2 calendarios actualizados.`};
  }

  async function loadFCF() {
    const status = $("fcf-data-status");
    if (!status) return {ok:false, message:"FCF: panel no disponible."};
    status.textContent = "Consultando la competición FCF…";
    // The FCF competition page is the source of truth, but its public site does not
    // currently expose a browser-accessible JSON endpoint that can be verified here.
    // Never fabricate a fixture or table when the official data cannot be retrieved.
    status.textContent = "El enlace directo al Grup 14 está disponible abajo. La lectura automática de calendario y clasificación todavía no está conectada: la FCF no expone aquí una fuente de datos que hayamos podido verificar desde una web estática.";
    return {ok:false, message:"FCF: calendario y clasificación enlazados, pero aún no se pueden leer automáticamente dentro de la app."};
  }

  async function loadAll() {
    if ($("refresh").disabled) return;
    $("refresh").disabled = true;
    $("refresh").classList.add("is-loading");
    setStatus("Actualizando tiempo, ruta y fútbol…");
    const jobs = await Promise.allSettled([loadWeather(), loadTraffic(), loadFootball(), loadFCF()]);
    const names = ["Tiempo", "Ruta", "Fútbol", "FCF"];
    const failures = [];
    jobs.forEach((result, i) => {
      if (result.status === "rejected") failures.push(`${names[i]}: ${result.reason?.message || "error"}`);
      else if (result.value?.ok === false) failures.push(result.value.message || `${names[i]}: sin datos actualizados`);
    });
    const stamp = new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    setStatus(failures.length ? `Consulta finalizada a las ${stamp}. ${failures.join(" · ")}` : `Todo actualizado a las ${stamp}.`);
    if (jobs[1].status === "rejected") $("traffic-status").textContent = jobs[1].reason?.message || "No se pudo calcular la ruta.";
    if (jobs[1].status === "fulfilled" && jobs[1].value?.ok === false) $("traffic-status").textContent = jobs[1].value.message;
    $("refresh").disabled = false;
    $("refresh").classList.remove("is-loading");
  }

  $("refresh").addEventListener("click", loadAll);
  $("back-to-top").addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));
  initDate();
  initTheme();
  initRainAlerts();
  initNotes();
  loadAll();
  $("summary-football").textContent = "FCF";
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();