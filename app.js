(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const HOME_QUERY = "Travessera d'Aragó, Sant Vicenç dels Horts, Barcelona, Spain";
  const HOME_CACHE_KEY = "mi-dia-home-coords-travessera-arago-v1";
  const WORK_QUERY = "Ernesto Ventos SA, Ctra. Reial 120B, 08960 Sant Just Desvern, Barcelona, Spain";
  const FCF_URL = "https://www.fcf.cat/ca/competicio?temporadaId=22&disciplinaId=19308233&competicioId=58780268&grupId=60210831&jornada=5";
  const APP_VERSION = "7.0.0";
  const WEATHER_FIELDS = "current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&forecast_days=2&timezone=Europe%2FMadrid";
  const NOTES_KEY = "mi-dia-v6-notes";
  const RAIN_KEY = "mi-dia-rain-alerts-v1"; // Keep existing V5/V5.1 rain preference compatibility.
  const THEME_KEY = "mi-dia-v6-theme";
  const WX = {0:["Despejado","☀"],1:["Mayormente despejado","🌤"],2:["Parcialmente nuboso","⛅"],3:["Nublado","☁"],45:["Niebla","🌫"],48:["Niebla","🌫"],51:["Llovizna ligera","🌦"],53:["Llovizna","🌦"],55:["Llovizna intensa","🌧"],56:["Llovizna helada","🌧"],57:["Llovizna helada","🌧"],61:["Lluvia ligera","🌦"],63:["Lluvia moderada","🌧"],65:["Lluvia intensa","🌧"],66:["Lluvia helada","🌧"],67:["Lluvia helada","🌧"],71:["Nieve ligera","🌨"],73:["Nieve moderada","🌨"],75:["Nieve intensa","❄"],77:["Granos de nieve","🌨"],80:["Chubascos ligeros","🌦"],81:["Chubascos moderados","🌧"],82:["Chubascos fuertes","⛈"],85:["Chubascos de nieve","🌨"],86:["Chubascos de nieve fuertes","🌨"],95:["Tormenta","⛈"],96:["Tormenta con granizo","⛈"],99:["Tormenta fuerte con granizo","⛈"]};
  let toastTimer = null;
  let lastWeatherData = null;
  let homeGeocodePromise = null;
  let workGeocodePromise = null;

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

  async function fetchTimed(url, options = {}, timeoutMs = 14000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, {...options, signal:controller.signal, cache:"no-store"}); }
    finally { clearTimeout(timer); }
  }
  async function fetchRetry(url, options = {}, attempts = 2) {
    let lastError;
    for (let i=0;i<attempts;i++) {
      try { const response = await fetchTimed(url, options); if (!response.ok) throw new Error(`HTTP ${response.status}`); return response; }
      catch (error) { lastError = error; if (i+1<attempts) await new Promise(resolve=>setTimeout(resolve,500*(i+1))); }
    }
    throw lastError || new Error("No se pudo completar la consulta.");
  }
  async function loadWeather() {
    const home = await geocodeHome();
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${home.lat}&longitude=${home.lon}&${WEATHER_FIELDS}`;
    const response = await fetchRetry(weatherURL, {headers:{"Accept":"application/json"}}, 3);
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

  async function geocodeAddress(query, cacheKey, variants = []) {
    const cached = safeJSON(localStorage.getItem(cacheKey), null);
    if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lon) && cached.lat > 41.2 && cached.lat < 41.6 && cached.lon > 1.7 && cached.lon < 2.4) return cached;
    let lastError = null;
    for (const search of [query, ...variants]) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(search)}`;
        const response = await fetchRetry(url, {headers:{"Accept":"application/json"}}, 2);
        if (!response.ok) throw new Error("El servicio de mapas no ha respondido.");
        const items = await response.json();
        if (!items.length) continue;
        const coords = {lat:Number(items[0].lat),lon:Number(items[0].lon),label:items[0].display_name || search};
        if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) continue;
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      } catch (error) { lastError = error; }
    }
    throw new Error(lastError?.message || `No se encontró la dirección: ${query}`);
  }
  function geocodeHome() {
    if (!homeGeocodePromise) homeGeocodePromise = geocodeAddress(HOME_QUERY, HOME_CACHE_KEY, ["Travessera d'Aragó, Sant Vicenç dels Horts, Barcelona, Spain", "Travessera d'Aragó, Sant Vicenç dels Horts"]).catch(() => {
      // Approximate fallback at Sant Vicenç; never pretend it is the exact street/door.
      return {lat:41.3933921,lon:2.0099830,label:"Sant Vicenç dels Horts (punto aproximado; geocodificación no disponible)",approximate:true};
    });
    return homeGeocodePromise;
  }
  function geocodeWork() {
    if (!workGeocodePromise) workGeocodePromise = geocodeAddress(WORK_QUERY, "mi-dia-work-coords-v2", ["Ctra. Reial 120B, 08960 Sant Just Desvern, Barcelona, Spain", "Ernesto Ventos Sant Just Desvern"]);
    return workGeocodePromise;
  }
  async function getRoadRoute(from, to) {
    const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
    const response = await fetchRetry(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`, {headers:{"Accept":"application/json"}}, 3);
    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No se encontró una ruta por carretera.");
    return data.routes[0];
  }
  async function loadTraffic() {
    const [home, work] = await Promise.all([geocodeHome(), geocodeWork()]);
    const [outbound, inbound] = await Promise.all([getRoadRoute(home, work), getRoadRoute(work, home)]);
    $("drive-time").textContent = fmtDuration(outbound.duration);
    $("drive-distance").textContent = `${(outbound.distance / 1000).toFixed(1)} km por carretera`;
    $("return-time").textContent = fmtDuration(inbound.duration);
    $("return-distance").textContent = `${(inbound.distance / 1000).toFixed(1)} km por carretera`;
    $("summary-route").textContent = fmtDuration(outbound.duration);
    $("summary-route-foot").textContent = `${(outbound.distance / 1000).toFixed(1)} km · sin retenciones`;
    const stamp = new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    $("traffic-status").textContent = `Ruta recalculada a las ${stamp} desde ${home.label || HOME_QUERY}. Ida y vuelta por separado; sin tráfico en tiempo real.`;
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


  const SPORTS_DATA_URL = `./sports-data.json?v=${Date.now()}`;
  const SPORTS_CACHE_KEY = "mi-dia-sports-last-good-v1";
  const TEAM_LABELS = {madrid:"Real Madrid",espanyol:"RCD Espanyol"};
  function dateLabel(value, withTime=true) {
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return "Fecha por confirmar";
    return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",...(withTime?{hour:"2-digit",minute:"2-digit"}:{}),timeZone:"Europe/Madrid"}).format(d);
  }
  function readSportsCache(){ try{return JSON.parse(localStorage.getItem(SPORTS_CACHE_KEY)||"null");}catch(_){return null;} }
  function saveSportsCache(data){ try{localStorage.setItem(SPORTS_CACHE_KEY,JSON.stringify(data));}catch(_){} }
  async function readSportsData(){
    const response=await fetch(SPORTS_DATA_URL,{cache:"no-store",headers:{"Accept":"application/json"}});
    if(!response.ok) throw new Error(`sports-data.json: HTTP ${response.status}`);
    const data=await response.json();
    if(!data || !data.teams || !data.updatedAt) throw new Error("El archivo de resultados no tiene el formato esperado");
    saveSportsCache(data); return data;
  }
  function renderFixtures(target,fixtures,emptyText){
    if(!target)return;
    if(!Array.isArray(fixtures)||!fixtures.length){target.innerHTML=`<p class="sports-copy">${escapeHTML(emptyText||"No hay próximos partidos publicados.")}</p>`;return;}
    target.innerHTML=fixtures.slice(0,3).map(f=>{
      const score=f.homeScore!==null&&f.homeScore!==undefined&&f.awayScore!==null&&f.awayScore!==undefined?`<span class="fixture-mini-result">${escapeHTML(f.homeScore)}–${escapeHTML(f.awayScore)}</span>`:"";
      return `<div class="fixture-mini"><div class="fixture-mini-date">${escapeHTML(dateLabel(f.date))}</div><div class="fixture-mini-info"><strong>${escapeHTML(f.home||"Local")} – ${escapeHTML(f.away||"Visitante")}</strong><span>${escapeHTML(f.competition||"Fútbol")}</span>${score}</div></div>`;
    }).join("");
  }
  function showSportsData(data,fromCache=false){
    for(const key of ["madrid","espanyol"]){
      const entry=data.teams?.[key]||{};
      renderFixtures($(key==="madrid"?"madrid-fixtures":"espanyol-fixtures"),entry.fixtures,entry.message||"Todavía no hay partidos disponibles.");
    }
    const fcf=data.fcf||{};
    const feed=$("fcf-fixtures-feed"), status=$("fcf-data-status"), table=$("fcf-standings");
    if(feed){
      if(fcf.fixtures?.length){
        feed.innerHTML=fcf.fixtures.slice(0,3).map(f=>`<div class="fixture-mini"><div class="fixture-mini-date">${escapeHTML(dateLabel(f.date))}</div><div class="fixture-mini-info"><strong>${escapeHTML(f.display||`${f.home||"Local"} – ${f.away||"Visitante"}`)}</strong><span>Cadete S15 · Segona Divisió · Grup 14</span></div></div>`).join("");
      } else feed.innerHTML=`<p class="sports-copy">${escapeHTML(fcf.message||"No hay jornadas verificadas en la fuente automática.")} <a href="${FCF_URL}" target="_blank" rel="noopener">Abrir FCF ↗</a></p>`;
    }
    if(table){
      if(fcf.standings?.length){
        table.innerHTML=`<div class="fcf-table-wrap"><table class="fcf-table"><tbody>${fcf.standings.map((r,i)=>`<tr><td>${escapeHTML(r.position??i+1)}</td><td>${escapeHTML(r.team||"")}</td><td>${escapeHTML(r.points??"")}</td></tr>`).join("")}</tbody></table></div>`;
      }else table.innerHTML='<p class="small-status">Clasificación no disponible en la última consulta.</p>';
    }
    if(status){
      const stamp=data.updatedAt?new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"}).format(new Date(data.updatedAt)):"—";
      status.textContent=`${fromCache?"Últimos datos guardados":"Datos generados"}: ${stamp}. ${fcf.status||""}`;
    }
  }
  async function loadFootball(){
    try{
      const data=await readSportsData(); showSportsData(data,false);
      const good=["madrid","espanyol"].filter(k=>data.teams?.[k]?.fixtures?.length).length;
      return {ok:good===2,message:`Fútbol: ${good}/2 calendarios con datos.`};
    }catch(error){
      const cached=readSportsCache();
      if(cached){showSportsData(cached,true);return {ok:false,message:"Fútbol: se muestran los últimos datos guardados; no se pudo descargar la actualización."};}
      for(const id of ["madrid-fixtures","espanyol-fixtures"]){const el=$(id);if(el)el.innerHTML=`<p class="sports-copy">No se ha podido leer el archivo de partidos. ${escapeHTML(error.message)}</p><p class="small-status">Comprueba que GitHub Actions haya generado <code>sports-data.json</code>.</p>`;}
      return {ok:false,message:"Fútbol: falta sports-data.json o no se ha podido leer."};
    }
  }
  async function loadFCF(){
    try{
      const data=await readSportsData(); showSportsData(data,false);
      return {ok:Boolean(data.fcf?.fixtures?.length),message:data.fcf?.status||"FCF: sin jornadas verificadas."};
    }catch(error){
      const cached=readSportsCache();
      if(cached){showSportsData(cached,true);return {ok:false,message:"FCF: se muestran los últimos datos guardados."};}
      const status=$("fcf-data-status");if(status)status.textContent="No se pudo leer sports-data.json. Comprueba GitHub Actions.";
      return {ok:false,message:"FCF: no hay archivo de datos actualizado."};
    }
  }

  async function loadAll() {
    const button = $("refresh");
    if (button.disabled) return;
    button.disabled = true; button.classList.add("is-loading");
    setStatus("Actualizando cada servicio por separado…");
    const tasks = [
      ["Tiempo", () => loadWeather(), "weather-updated"],
      ["Ruta", () => loadTraffic(), "traffic-status"],
      ["Madrid y Espanyol", () => loadFootball(), null],
      ["FCF", () => loadFCF(), "fcf-data-status"]
    ];
    const outcomes = await Promise.all(tasks.map(async ([name, fn]) => {
      try { const value = await fn(); return {name, ok:value?.ok !== false, message:value?.message || ""}; }
      catch (error) { return {name, ok:false, message:error?.name === "AbortError" ? "tiempo de espera agotado" : (error?.message || "error de conexión")}; }
    }));
    const stamp = new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    const failed = outcomes.filter(x=>!x.ok);
    setStatus(failed.length ? `Actualización ${stamp}: ${outcomes.filter(x=>x.ok).length}/${outcomes.length} servicios correctos. ${failed.map(x=>`${x.name}: ${x.message}`).join(" · ")}` : `Todos los servicios respondieron correctamente a las ${stamp}.`);
    button.disabled = false; button.classList.remove("is-loading");
    return outcomes;
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
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", {updateViaCache:"none"});
        await registration.update();
      } catch (error) { console.warn("Mi Día: no se pudo comprobar la actualización de la app", error); }
    });
  }
})();