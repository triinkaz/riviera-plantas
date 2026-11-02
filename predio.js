(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const TOWERS = ["A", "B", "C", "D"];
  const BANDS = { 1: "3–4", 2: "5–9", 3: "10 ou mais" };
  const filter = document.getElementById("problem-filter");
  const grid = document.getElementById("tower-grid");
  const status = document.getElementById("map-status");
  const updated = document.getElementById("last-updated");
  const title = document.getElementById("details-title");
  const description = document.getElementById("selected-description");
  const ranking = document.getElementById("hotspots-list");
  let categories = [];
  let cells = [];
  let selected = null;
  let lastUpdated = null;
  let requestSequence = 0;

  function svgElement(tag, attributes, parent) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    parent.append(element);
    return element;
  }

  function textElement(parent, tag, content, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = content;
    parent.append(element);
    return element;
  }

  function selectedLabel() {
    if (filter.value === "all") return "todos os problemas";
    return categories.find(category => category.id === filter.value)?.label || "este tipo";
  }

  function bandFor(cell) {
    return BANDS[cell.level] || null;
  }

  function buildFilter() {
    const previous = filter.value;
    filter.replaceChildren(new Option("Todos os problemas", "all"));
    categories.forEach(category => filter.add(new Option(category.label, category.id)));
    filter.value = previous && [...filter.options].some(option => option.value === previous) ? previous : "all";
  }

  function renderSelected() {
    document.querySelectorAll(".heat-band.selected").forEach(element => element.classList.remove("selected"));
    document.querySelectorAll(".tower-card.active").forEach(element => element.classList.remove("active"));
    if (!selected) {
      title.textContent = "Toque em uma faixa colorida";
      description.textContent = "Você verá o bloco, o pavimento e a faixa de unidades com relatos para o filtro escolhido.";
      return;
    }
    const cell = cells.find(item => item.tower === selected.tower && item.floor === selected.floor);
    const bandLabel = cell ? bandFor(cell) : null;
    if (bandLabel === null) {
      selected = null;
      renderSelected();
      return;
    }
    title.textContent = `Bloco ${selected.tower} · pavimento ${selected.floor}`;
    description.textContent = `${bandLabel} unidades com relatos neste recorte. Filtro: ${selectedLabel()}. Os relatos ainda não constituem verificação técnica.`;
    const band = document.querySelector(`.heat-band[data-tower="${selected.tower}"][data-floor="${selected.floor}"]`);
    band?.classList.add("selected");
    document.querySelector(`.tower-card[data-tower="${selected.tower}"]`)?.classList.add("active");
  }

  function selectCell(tower, floor) {
    selected = { tower, floor };
    renderSelected();
    if (window.matchMedia("(max-width: 760px)").matches) document.getElementById("selected-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderTower(tower, maxFloor) {
    const card = document.createElement("article");
    card.className = "tower-card";
    card.dataset.tower = tower;
    card.id = `bloco-${tower.toLowerCase()}`;
    const heading = document.createElement("header");
    textElement(heading, "strong", `Bloco ${tower}`);
    const visible = cells.filter(cell => cell.tower === tower && bandFor(cell) !== null).length;
    textElement(heading, "small", visible ? `${visible} ${visible === 1 ? "pavimento com relatos" : "pavimentos com relatos"}` : "Aguardando dados publicáveis");
    card.append(heading);

    const scene = svgElement("svg", { viewBox: "0 0 210 400", role: "group", "aria-label": `Bloco ${tower}, visão 3D esquemática com faixas de relatos por pavimento` }, card);
    svgElement("ellipse", { class: "tower-shadow", cx: 113, cy: 367, rx: 88, ry: 15 }, scene);
    svgElement("path", { class: "ground", d: "M15 364 L166 364 L193 346 L45 346 Z" }, scene);
    svgElement("path", { class: "prism-side", d: "M166 80 L190 62 L190 351 L166 369 Z" }, scene);
    svgElement("rect", { class: "prism-front", x: 25, y: 80, width: 141, height: 289 }, scene);
    svgElement("path", { class: "prism-roof", d: "M25 80 L49 62 L190 62 L166 80 Z" }, scene);
    svgElement("rect", { class: "prism-gleam", x: 39, y: 92, width: 16, height: 264 }, scene);
    svgElement("rect", { class: "prism-gleam", x: 75, y: 92, width: 16, height: 264 }, scene);
    svgElement("rect", { class: "prism-gleam", x: 111, y: 92, width: 16, height: 264 }, scene);
    svgElement("line", { class: "prism-line", x1: 25, y1: 369, x2: 166, y2: 369 }, scene);
    const letter = svgElement("text", { class: "roof-letter", x: 106, y: 52 }, scene);
    letter.textContent = tower;

    if (maxFloor > 0) {
      const slot = 289 / maxFloor;
      cells.filter(cell => cell.tower === tower && bandFor(cell) !== null).sort((a, b) => a.floor - b.floor).forEach(cell => {
        const bandLabel = bandFor(cell);
        const top = 369 - cell.floor * slot;
        const bottom = top + slot;
        const intensity = cell.level === 3 ? "high" : cell.level === 2 ? "medium" : "low";
        const band = svgElement("g", {
          class: `heat-band ${intensity}`,
          role: "button", tabindex: 0,
          "aria-label": `Bloco ${tower}, pavimento ${cell.floor}, ${bandLabel} unidades com relatos, filtro ${selectedLabel()}`,
          "data-tower": tower, "data-floor": cell.floor
        }, scene);
        svgElement("path", { class: "band-side", d: `M166 ${top + 1} L190 ${top - 17} L190 ${bottom - 17} L166 ${bottom - 1} Z` }, band);
        svgElement("rect", { class: "band-front", x: 25, y: top + 1, width: 141, height: Math.max(1, slot - 2) }, band);
        if (slot >= 21) {
          const floorText = svgElement("text", { class: "band-label", x: 35, y: top + slot / 2 + 4 }, band);
          floorText.textContent = `${cell.floor}º`;
          const countText = svgElement("text", { class: "band-label", x: 151, y: top + slot / 2 + 4, "text-anchor": "end" }, band);
          countText.textContent = bandLabel;
        }
        band.addEventListener("click", () => selectCell(tower, cell.floor));
        band.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectCell(tower, cell.floor); }
        });
      });
    } else {
      const text = svgElement("text", { class: "no-data-label", x: 97, y: 229 }, scene);
      text.textContent = "Sem faixas públicas";
    }
    textElement(card, "footer", "Esquema ilustrativo · toque nas faixas coloridas");
    return card;
  }

  function renderRanking() {
    ranking.replaceChildren();
    const ranked = cells.filter(cell => bandFor(cell) !== null).sort((a, b) => b.level - a.level || a.tower.localeCompare(b.tower) || a.floor - b.floor).slice(0, 5);
    if (!ranked.length) {
      textElement(ranking, "li", "Ainda não há faixas publicáveis para este filtro.");
      return;
    }
    ranked.forEach(cell => {
      const row = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.append(document.createTextNode(`Bloco ${cell.tower} · ${cell.floor}º pavimento`));
      textElement(button, "strong", `${bandFor(cell)} unidades`);
      button.addEventListener("click", () => {
        document.getElementById(`bloco-${cell.tower.toLowerCase()}`).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        selectCell(cell.tower, cell.floor);
      });
      row.append(button);
      ranking.append(row);
    });
  }

  function render() {
    grid.setAttribute("aria-busy", "true");
    const filtered = cells.filter(cell => bandFor(cell) !== null);
    const maxFloor = cells.reduce((max, cell) => Math.max(max, cell.floor), 0);
    grid.replaceChildren(...TOWERS.map(tower => renderTower(tower, maxFloor)));
    grid.removeAttribute("aria-busy");
    renderRanking();
    renderSelected();
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      if (!Number.isNaN(date.getTime())) updated.textContent = `Atualizado em ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)}`;
    }
    if (filtered.length) status.textContent = `${filtered.length} ${filtered.length === 1 ? "pavimento tem" : "pavimentos têm"} dados publicáveis para ${selectedLabel()}. As cores indicam recorrência, não urgência.`;
    else if (cells.length) status.textContent = `Ainda não há dados suficientes para mostrar ${selectedLabel()} por bloco e pavimento.`;
    else status.textContent = "O mapa está pronto e aguarda relatos suficientes para mostrar concentrações por bloco e pavimento.";
  }

  function readHeatmap(raw) {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.floors)) throw new Error("Resposta inválida");
    if (!Number.isInteger(raw.min_cell_size) || raw.min_cell_size < 3) throw new Error("Limiar de privacidade inválido");
    const seen = new Set();
    if (Array.isArray(raw.filters)) {
      categories = raw.filters.map(item => ({
        id: String(item?.code || ""), label: String(item?.label || "").trim().slice(0, 70)
      })).filter(item => /^[a-z0-9_-]{1,50}$/.test(item.id) && item.id !== "all" && item.label && !seen.has(item.id) && seen.add(item.id));
      buildFilter();
    }
    const keyed = new Map();
    raw.floors.forEach(item => {
      const tower = String(item?.tower || "").toUpperCase();
      const floor = Number(item?.floor);
      const level = Number(item?.level);
      // Only the server's privacy-safe bands are accepted. Exact counts are never read.
      if (TOWERS.includes(tower) && Number.isInteger(floor) && floor >= 1 && floor <= 40 && [1, 2, 3].includes(level)) keyed.set(`${tower}:${floor}`, { tower, floor, level });
    });
    cells = [...keyed.values()];
    lastUpdated = raw.updated_at || null;
    render();
  }

  async function load(clearPrevious = false) {
    const sequence = ++requestSequence;
    if (clearPrevious) {
      cells = [];
      selected = null;
      lastUpdated = null;
      updated.textContent = "Aguardando dados";
      render();
      status.textContent = "Carregando este tipo de problema…";
    }
    const base = String(window.RIVIERA_RADAR_API_URL || "").trim();
    if (!base) {
      render();
      status.textContent = "O mapa ainda não está conectado aos dados do Radar.";
      return;
    }
    let url;
    try {
      url = new URL("/api/heatmap", base);
      url.searchParams.set("type", filter.value);
      if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("URL inválida");
    } catch {
      render();
      status.textContent = "O endereço dos dados do Radar precisa ser configurado.";
      return;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let response;
      try { response = await fetch(url.href, { cache: "no-store", credentials: "omit", signal: controller.signal }); }
      finally { clearTimeout(timer); }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (sequence === requestSequence) readHeatmap(result);
    } catch {
      if (sequence !== requestSequence) return;
      if (!cells.length) {
        render();
        status.textContent = "Não foi possível carregar as faixas agora. Tente novamente mais tarde.";
      } else status.textContent = "Exibindo as últimas faixas carregadas. A atualização falhou temporariamente.";
    }
  }

  filter.addEventListener("change", () => load(true));
  document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-jump]").forEach(item => item.removeAttribute("aria-current"));
    button.setAttribute("aria-current", "true");
    document.getElementById(`bloco-${button.dataset.jump.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }));
  const themeButton = document.getElementById("theme-toggle");
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "Ativar tema claro" : "Ativar tema escuro");
    themeButton.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
    themeButton.querySelector(".theme-label").textContent = dark ? "Tema claro" : "Tema escuro";
  }
  syncTheme();
  themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.getElementById("browser-theme-color").content = next === "dark" ? "#0b0b0a" : "#f6f2e9";
    try { localStorage.setItem("riviera-theme", next); } catch {}
    syncTheme();
  });

  buildFilter();
  render();
  load();
  setInterval(() => { if (document.visibilityState === "visible") load(); }, 60000);
})();
