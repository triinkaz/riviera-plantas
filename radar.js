(() => {
  "use strict";

  // IDs de categoria e assunto são compartilhados com o serviço de relatos.
  const catalog = [
    { id: "unidade", label: "Meu apartamento", topics: [
      { id: "agua", label: "Água e esgoto", details: [["vazamento", "Vazamento ou infiltração"], ["falta_agua", "Falta ou baixa pressão de água"], ["ralo", "Ralo ou escoamento"], ["esgoto", "Cheiro ou retorno de esgoto"], ["outros", "Outros"]] },
      { id: "pisos", label: "Pisos e revestimentos", details: [["desnivel", "Piso desnivelado"], ["caimento", "Caimento inadequado"], ["oco", "Peça oca ou solta"], ["trinca", "Trinca ou quebra"], ["rejunte", "Rejunte ou acabamento"], ["outros", "Outros"]] },
      { id: "portas_janelas", label: "Portas e janelas", details: [["porta", "Porta não fecha ou raspa"], ["janela", "Janela não fecha ou veda"], ["vidro", "Vidro ou esquadria danificada"], ["fechadura", "Fechadura ou maçaneta"], ["outros", "Outros"]] },
      { id: "eletrica", label: "Elétrica", details: [["tomada", "Tomada sem funcionamento"], ["interruptor", "Interruptor ou iluminação"], ["disjuntor", "Disjuntor desarma"], ["chuveiro", "Ponto do chuveiro"], ["interfone", "Interfone"], ["outros", "Outros"]] },
      { id: "paredes_teto", label: "Paredes e teto", details: [["fissura", "Fissura ou trinca"], ["umidade", "Umidade ou mofo"], ["pintura", "Pintura ou acabamento"], ["forro", "Forro ou teto"], ["outros", "Outros"]] },
      { id: "ar_gas", label: "Ar, gás e ventilação", details: [["ponto_ar", "Ponto do ar-condicionado"], ["dreno_ar", "Dreno do ar-condicionado"], ["condensadora", "Local ou ventilação da condensadora"], ["gas", "Ponto de gás"], ["exaustao", "Ventilação ou exaustão"], ["outros", "Outros"]] },
      { id: "outros", label: "Outros", details: [["outros", "Descrever outro problema"]] }
    ] },
    { id: "areas_comuns", label: "Áreas comuns", topics: [
      { id: "seguranca", label: "Segurança e acesso", details: [["portaria", "Portaria ou controle de acesso"], ["portao", "Portão ou entrada"], ["camera", "Câmera ou monitoramento"], ["outros", "Outros"]] },
      { id: "infraestrutura", label: "Infraestrutura", details: [["elevador", "Elevador"], ["agua", "Abastecimento de água"], ["energia", "Energia ou iluminação"], ["limpeza", "Limpeza ou conservação"], ["infiltracao", "Infiltração"], ["outros", "Outros"]] },
      { id: "garagem", label: "Garagem", details: [["vaga", "Vaga ou demarcação"], ["acesso", "Acesso ou circulação"], ["drenagem", "Drenagem ou alagamento"], ["outros", "Outros"]] },
      { id: "outros", label: "Outros", details: [["outros", "Descrever outro problema"]] }
    ] },
    { id: "atendimento", label: "Vistoria e atendimento", topics: [
      { id: "vistoria", label: "Vistoria", details: [["agendamento", "Agendamento"], ["pendencia", "Pendência registrada"], ["divergencia", "Divergência no relatório"], ["outros", "Outros"]] },
      { id: "chamado", label: "Chamado ou assistência", details: [["abrir", "Não consigo abrir chamado"], ["sem_resposta", "Sem resposta"], ["prazo", "Prazo não cumprido"], ["reincidente", "Problema voltou"], ["incompleto", "Serviço incompleto"], ["outros", "Outros"]] },
      { id: "chaves_documentos", label: "Chaves e documentos", details: [["chaves", "Entrega ou acesso às chaves"], ["manual", "Manual ou plantas"], ["documentacao", "Documentação da unidade"], ["outros", "Outros"]] },
      { id: "outros", label: "Outros", details: [["outros", "Descrever outro problema"]] }
    ] },
    { id: "assembleia", label: "Assunto para assembleia", topics: [
      { id: "envidracamento", label: "Envidraçamento", details: [["sacada", "Envidraçamento da varanda"], ["outros", "Outros"]] },
      { id: "portas_sacada", label: "Portas da sacada", details: [["padrao", "Padrão das portas"], ["outros", "Outros"]] },
      { id: "condensadora", label: "Condensadoras", details: [["fechamento", "Fechamento ou proteção"], ["ventilacao", "Ventilação e acesso de manutenção"], ["outros", "Outros"]] },
      { id: "fechaduras_fachada", label: "Fechaduras e fachada", details: [["fechadura", "Fechadura digital"], ["fachada", "Padrão da fachada"], ["outros", "Outros"]] },
      { id: "reforma", label: "Reformas", details: [["regras", "Regras ou horários de obra"], ["art", "ART, RRT ou documentação"], ["outros", "Outros"]] },
      { id: "seguranca", label: "Segurança", details: [["acesso", "Acesso e portaria"], ["monitoramento", "Monitoramento"], ["outros", "Outros"]] },
      { id: "vaga_prestador", label: "Prestadores e vagas", details: [["acesso", "Acesso de prestadores"], ["vaga", "Vaga de carga e descarga"], ["outros", "Outros"]] },
      { id: "outros", label: "Outros", details: [["outros", "Descrever outro assunto"]] }
    ] },
    { id: "outros", label: "Outros", topics: [
      { id: "outros", label: "Outro assunto", details: [["outros", "Descrever o problema"]] }
    ] }
  ];

  const $ = id => document.getElementById(id);
  const apiBase = normalizeApiBase(window.RIVIERA_RADAR_API_URL);
  const siteKey = typeof window.RIVIERA_RADAR_TURNSTILE_SITEKEY === "string" ? window.RIVIERA_RADAR_TURNSTILE_SITEKEY.trim() : "";
  const canSend = Boolean(apiBase);
  const selectedIssues = [];
  const widgets = new Map();
  let summaryItems = [];
  let mediaItems = [];
  let summaryLoaded = false;
  let mediaLoaded = false;
  let activeInteraction = null;

  function normalizeApiBase(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return "";
      return url.href.replace(/\/+$/, "");
    } catch { return ""; }
  }

  function status(element, message, kind = "") {
    element.textContent = message;
    element.classList.toggle("is-error", kind === "error");
    element.classList.toggle("is-success", kind === "success");
  }

  function submissionError(error, fallback) {
    const message = typeof error?.message === "string" ? error.message.trim() : "";
    return message && message.length <= 180 && !/failed to fetch|abort|networkerror/i.test(message) ? message : fallback;
  }

  function option(select, value, label) { select.add(new Option(label, value)); }
  function resetSelect(select, label) { select.replaceChildren(); option(select, "", label); select.value = ""; }
  function category(id) { return catalog.find(item => item.id === id); }
  function topic(categoryId, topicId) { return category(categoryId)?.topics.find(item => item.id === topicId); }
  function detailLabel(categoryId, topicId, detailId) { return topic(categoryId, topicId)?.details.find(item => item[0] === detailId)?.[1] || "Outro problema"; }
  function categoryLabel(id) { return category(id)?.label || "Outro assunto"; }
  function topicLabel(categoryId, topicId) { return topic(categoryId, topicId)?.label || "Outro assunto"; }
  function normalizeUnit(raw) { return String(raw || "").trim().toUpperCase().replace(/\s+/g, ""); }
  function validUnit(unit) { return /^\d{3,4}[A-D]$/.test(unit); }
  function maskUnit(raw) {
    const value = String(raw || "").trim().toUpperCase();
    const full = /^\d{3,4}([A-D])$/.exec(value);
    const masked = /^[•*]{2,4}\d?([A-D])$/.exec(value);
    const tower = full?.[1] || masked?.[1];
    return tower ? "•••" + tower : "Unidade não exibida";
  }
  function firstName(raw) {
    const first = String(raw || "").trim().split(/\s+/)[0] || "Morador";
    return first.slice(0, 30);
  }
  function dateLabel(raw) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  }
  function safeMediaUrl(raw) {
    try {
      const url = new URL(raw, apiBase || location.href);
      const expected = new URL(apiBase || location.href);
      return url.origin === expected.origin && url.pathname.startsWith("/api/radar/media/") ? url.href : "";
    } catch { return ""; }
  }

  function setupTheme() {
    const button = $("theme-toggle");
    function reflect() {
      const dark = document.documentElement.dataset.theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Ativar tema claro" : "Ativar tema escuro");
      button.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
      button.querySelector(".theme-label").textContent = dark ? "Tema claro" : "Tema escuro";
      $("browser-theme-color").content = dark ? "#0b0b0a" : "#f6f2e9";
    }
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("riviera-theme", next); } catch { /* preferência opcional */ }
      $("radar-map-frame")?.contentWindow?.postMessage({ type: "riviera-theme", theme: next }, location.origin);
      reflect();
    });
    reflect();
  }

  function setupTaxonomy() {
    for (const id of ["report-category", "media-category", "summary-filter", "media-filter"]) {
      const select = $(id);
      if (!select) continue;
      for (const item of catalog) option(select, item.id, item.label);
    }
    $("report-category")?.addEventListener("change", () => {
      const select = $("report-topic");
      resetSelect(select, "Escolha o assunto");
      resetSelect($("report-detail"), "Escolha primeiro o assunto");
      const chosen = category($("report-category").value);
      select.disabled = !chosen;
      $("report-detail").disabled = true;
      chosen?.topics.forEach(item => option(select, item.id, item.label));
    });
    $("report-topic")?.addEventListener("change", () => {
      const select = $("report-detail");
      resetSelect(select, "Escolha o problema");
      const chosen = topic($("report-category").value, $("report-topic").value);
      select.disabled = !chosen;
      chosen?.details.forEach(([id, label]) => option(select, id, label));
    });
    $("media-category")?.addEventListener("change", () => {
      const select = $("media-detail");
      resetSelect(select, "Escolha o problema");
      const chosen = category($("media-category").value);
      select.disabled = !chosen;
      if (!chosen) return;
      for (const item of chosen.topics) {
        const group = document.createElement("optgroup");
        group.label = item.label;
        for (const [id, label] of item.details) group.append(new Option(label, item.id + ":" + id));
        select.append(group);
      }
    });
    $("summary-filter")?.addEventListener("change", renderSummary);
    $("summary-order")?.addEventListener("change", renderSummary);
    $("media-filter")?.addEventListener("change", renderMedia);
  }

  function showEmergency() {
    $("radar-emergency").hidden = !($("report-active").checked || $("report-risk").checked || $("report-blocks").checked);
  }

  function issueFromForm() {
    const categoryId = $("report-category").value;
    const topicId = $("report-topic").value;
    const detailId = $("report-detail").value;
    if (!topic(categoryId, topicId)?.details.some(([id]) => id === detailId)) return null;
    const description = $("report-description").value.trim();
    if ([categoryId, topicId, detailId].includes("outros") && !description) {
      status($("add-issue-feedback"), "Em ‘Outros’, descreva o problema para que possamos entendê-lo.", "error");
      $("report-description").focus();
      return null;
    }
    return {
      category: categoryId,
      topic: topicId,
      detail: detailId,
      room: $("report-room").value.trim(),
      description,
      activeNow: $("report-active").checked,
      risk: $("report-risk").checked,
      blocks: $("report-blocks").checked,
      protocol: $("report-protocol").value.trim()
    };
  }

  function renderSelected() {
    const list = $("selected-issues");
    list.replaceChildren();
    if (!selectedIssues.length) {
      const empty = document.createElement("li"); empty.className = "radar-empty"; empty.textContent = "Nenhum selecionado ainda."; list.append(empty); return;
    }
    selectedIssues.forEach((issue, index) => {
      const row = document.createElement("li");
      const copy = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = detailLabel(issue.category, issue.topic, issue.detail);
      const small = document.createElement("small"); small.textContent = [categoryLabel(issue.category), topicLabel(issue.category, issue.topic), issue.room].filter(Boolean).join(" · ");
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remover"; remove.setAttribute("aria-label", "Remover " + title.textContent); remove.addEventListener("click", () => { selectedIssues.splice(index, 1); renderSelected(); });
      copy.append(title, small); row.append(copy, remove); list.append(row);
    });
  }

  function addIssue() {
    status($("add-issue-feedback"), "");
    const issue = issueFromForm();
    if (!issue) {
      if (!$("add-issue-feedback").textContent) status($("add-issue-feedback"), "Escolha área, assunto e problema.", "error");
      return false;
    }
    if (selectedIssues.length >= 10) { status($("add-issue-feedback"), "Envie estes 10 problemas antes de acrescentar outros.", "error"); return false; }
    const key = [issue.category, issue.topic, issue.detail, issue.room.toLowerCase()].join("|");
    if (selectedIssues.some(item => [item.category, item.topic, item.detail, item.room.toLowerCase()].join("|") === key)) {
      status($("add-issue-feedback"), "Este problema já está na lista.", "error"); return false;
    }
    selectedIssues.push(issue);
    renderSelected();
    status($("add-issue-feedback"), "Problema adicionado. Você pode escolher outro ou enviar a lista.", "success");
    for (const id of ["report-room", "report-description", "report-protocol"]) $(id).value = "";
    for (const id of ["report-active", "report-risk", "report-blocks"]) $(id).checked = false;
    $("report-category").value = "";
    $("report-category").dispatchEvent(new Event("change"));
    showEmergency();
    return true;
  }

  async function request(path, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(apiBase + path, { ...options, signal: controller.signal, credentials: "omit", cache: "no-store" });
      let body = null;
      try { body = await response.json(); } catch { /* resposta vazia ou inválida */ }
      if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "Não foi possível concluir. Tente novamente.");
      return body;
    } finally { clearTimeout(timer); }
  }

  function priorityRank(value) { return ({ high: 3, urgent: 3, alta: 3, medium: 2, media: 2, low: 1, baixa: 1 })[String(value || "").toLowerCase()] || 0; }
  function priorityLabel(value) { return ({ 3: "Atenção agora", 2: "Acompanhar", 1: "Sem urgência indicada" })[priorityRank(value)] || "Sem prioridade definida"; }
  function countValue(raw) { const n = Number(raw); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0; }

  function renderSummary() {
    const list = $("radar-issue-list"); list.replaceChildren();
    const filter = $("summary-filter").value;
    const data = summaryItems.filter(item => filter === "all" || item.category === filter || item.id === filter);
    const sort = $("summary-order").value;
    data.sort((a, b) => sort === "count" ? countValue(b.count) - countValue(a.count) : priorityRank(b.priority) - priorityRank(a.priority) || countValue(b.count) - countValue(a.count));
    if (!data.length) { const p = document.createElement("p"); p.className = "radar-empty"; p.textContent = summaryLoaded ? "Ainda não há relatos publicados para este filtro." : "O painel ainda não pode ser consultado."; list.append(p); return; }
    for (const item of data) {
      const card = document.createElement("article"); card.className = "radar-issue";
      const lead = document.createElement("div");
      const title = document.createElement("h3"); title.textContent = String(item.label || categoryLabel(item.category || item.id)).slice(0, 120);
      const type = document.createElement("small"); type.textContent = categoryLabel(item.category || item.id);
      lead.append(title, type);
      const count = document.createElement("div"); count.className = "radar-issue-count"; count.append(document.createTextNode(String(countValue(item.count))));
      const countCaption = document.createElement("span"); countCaption.textContent = "relatos"; count.append(countCaption);
      const meta = document.createElement("div"); meta.className = "radar-issue-meta";
      const badge = document.createElement("span"); badge.className = "radar-badge"; badge.dataset.priority = priorityRank(item.priority) === 3 ? "high" : priorityRank(item.priority) === 2 ? "medium" : "low"; badge.textContent = priorityLabel(item.priority); meta.append(badge);
      if (item.status) { const state = document.createElement("span"); state.className = "radar-badge"; state.textContent = String(item.status).slice(0, 60); meta.append(state); }
      if (Number.isFinite(Number(item.open))) { const open = document.createElement("span"); open.className = "radar-badge"; open.textContent = countValue(item.open) + " em aberto"; meta.append(open); }
      card.append(lead, count, meta); list.append(card);
    }
  }

  async function loadSummary() {
    if (!apiBase) {
      status($("radar-summary-status"), "Painel ainda não disponível. Os números aparecerão quando os relatos estiverem conectados.");
      $("radar-issue-list").replaceChildren(); renderSummary(); return;
    }
    try {
      const data = await request("/api/radar/summary");
      if (!data || !Array.isArray(data.categories) || !data.totals) throw new Error("Resposta incompleta do painel.");
      summaryItems = data.categories.filter(item => item && typeof item === "object" && countValue(item.count) > 0);
      summaryLoaded = true;
      $("stat-units").textContent = String(countValue(data.totals.units));
      $("stat-reports").textContent = String(countValue(data.totals.reports));
      $("stat-urgent").textContent = String(countValue(data.totals.urgent));
      status($("radar-summary-status"), countValue(data.totals.reports) > 0 ? "Dados enviados pelos moradores, agrupados por problema." : "Ainda não há relatos publicados.");
      $("radar-updated").textContent = data.updatedAt ? "Atualizado em " + dateLabel(data.updatedAt) : "";
      renderSummary();
    } catch {
      status($("radar-summary-status"), "Não foi possível carregar o painel agora. Tente novamente mais tarde.", "error");
      $("radar-issue-list").replaceChildren(); renderSummary();
    }
  }

  function renderMedia() {
    const list = $("radar-media-list"); list.replaceChildren();
    const filter = $("media-filter").value;
    const shown = mediaItems.filter(item => filter === "all" || item.category === filter);
    if (!shown.length) { const p = document.createElement("p"); p.className = "radar-empty"; p.textContent = mediaLoaded ? "Ainda não há fotos ou vídeos publicados para este filtro." : "O mural ainda não pode ser consultado."; list.append(p); return; }
    for (const item of shown) {
      const card = document.createElement("article"); card.className = "radar-media-card";
      const url = safeMediaUrl(item.mediaUrl || item.url);
      if (url) {
        const isVideo = String(item.mediaType || "").startsWith("video/");
        const view = document.createElement(isVideo ? "video" : "img");
        view.className = "radar-media-view";
        view.src = url;
        if (isVideo) { view.controls = true; view.preload = "none"; view.setAttribute("playsinline", ""); }
        else { view.loading = "lazy"; view.alt = "Registro enviado por morador: " + String(item.room || "problema no condomínio").slice(0, 80); }
        card.append(view);
      }
      const copy = document.createElement("div"); copy.className = "radar-media-copy";
      const title = document.createElement("h3"); title.textContent = String(item.problem || item.label || categoryLabel(item.category)).slice(0, 120);
      const byline = document.createElement("div"); byline.className = "radar-media-byline"; byline.textContent = [item.room, maskUnit(item.unitLabel || item.unitId), dateLabel(item.createdAt)].filter(Boolean).join(" · ");
      copy.append(title, byline);
      if (item.description) { const p = document.createElement("p"); p.textContent = String(item.description).slice(0, 500); copy.append(p); }
      const actions = document.createElement("div"); actions.className = "radar-media-actions";
      const comment = document.createElement("button"); comment.type = "button"; comment.textContent = "Comentar"; comment.disabled = !canSend; comment.addEventListener("click", () => openInteraction("comment", item));
      const same = document.createElement("button"); same.type = "button"; same.textContent = "Acontece comigo também" + (countValue(item.sameCount) ? " · " + countValue(item.sameCount) : ""); same.disabled = !canSend; same.addEventListener("click", () => openInteraction("same", item));
      actions.append(comment, same); copy.append(actions);
      const comments = Array.isArray(item.comments) ? item.comments : [];
      if (comments.length) {
        const details = document.createElement("details"); details.className = "radar-comments";
        const summary = document.createElement("summary"); summary.textContent = "Ver " + comments.length + (comments.length === 1 ? " comentário" : " comentários"); details.append(summary);
        for (const entry of comments) {
          const row = document.createElement("div"); row.className = "radar-comment";
          const name = document.createElement("strong"); name.textContent = firstName(entry.firstName || entry.displayName || entry.name);
          const unit = document.createElement("small"); unit.textContent = maskUnit(entry.unitLabel || entry.unitId);
          const content = document.createElement("p"); content.textContent = String(entry.text || "").slice(0, 500);
          row.append(name, unit, content); details.append(row);
        }
        copy.append(details);
      }
      card.append(copy); list.append(card);
    }
  }

  async function loadMedia() {
    if (!apiBase) { status($("radar-media-status"), "Mural ainda não disponível. As mídias aparecerão após a conexão e a revisão dos envios."); renderMedia(); return; }
    try {
      const data = await request("/api/radar/media");
      if (!data || !Array.isArray(data.items)) throw new Error("Resposta incompleta do mural.");
      mediaItems = data.items.filter(item => item && typeof item === "object" && item.id);
      mediaLoaded = true;
      status($("radar-media-status"), mediaItems.length ? "Fotos, vídeos e comentários publicados após revisão." : "Ainda não há mídias publicadas.");
      renderMedia();
    } catch { status($("radar-media-status"), "Não foi possível carregar as mídias agora. Tente novamente mais tarde.", "error"); renderMedia(); }
  }

  function tokenFor(id) {
    if (!window.turnstile || !widgets.has(id)) return "";
    return window.turnstile.getResponse(widgets.get(id)) || "";
  }
  function resetToken(id) { if (window.turnstile && widgets.has(id)) window.turnstile.reset(widgets.get(id)); }

  async function setupTurnstile() {
    if (!canSend) {
      const message = "Envios ainda não disponíveis. O serviço de recebimento está sendo preparado.";
      $("radar-availability").hidden = false;
      $("radar-availability").textContent = message;
      for (const id of ["submit-report", "submit-media", "interaction-submit", "submit-privacy"]) if ($(id)) $(id).disabled = true;
      if ($("report-feedback")) status($("report-feedback"), message);
      if ($("media-feedback")) status($("media-feedback"), message);
      status($("privacy-feedback"), message);
      return;
    }
    // O piloto usa a limitação de envios do servidor até a chave de verificação ser configurada.
    if (!siteKey) return;
    try {
      await new Promise((resolve, reject) => {
        if (window.turnstile) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
      if (!window.turnstile) throw new Error("Turnstile indisponível");
      for (const id of ["report-turnstile", "media-turnstile", "interaction-turnstile", "privacy-turnstile"]) {
        if ($(id)) widgets.set(id, window.turnstile.render($(id), { sitekey: siteKey, theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light" }));
      }
    } catch {
      for (const id of ["submit-report", "submit-media", "interaction-submit", "submit-privacy"]) if ($(id)) $(id).disabled = true;
      if ($("report-feedback")) status($("report-feedback"), "Não foi possível preparar o envio seguro. Atualize a página e tente novamente.", "error");
      if ($("media-feedback")) status($("media-feedback"), "Não foi possível preparar o envio seguro. Atualize a página e tente novamente.", "error");
      status($("privacy-feedback"), "Não foi possível preparar o envio seguro. Atualize a página e tente novamente.", "error");
    }
  }

  function setupReports() {
    if (!$('radar-report-form')) return;
    $("add-issue").addEventListener("click", addIssue);
    for (const id of ["report-active", "report-risk", "report-blocks"]) $(id).addEventListener("change", showEmergency);
    $("radar-report-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!canSend) return;
      if (!selectedIssues.length && !addIssue()) { $("report-category").focus(); return; }
      const unitId = normalizeUnit($("report-unit").value);
      if (!validUnit(unitId)) { status($("report-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("report-unit").focus(); return; }
      if (!$("report-consent").checked) { status($("report-feedback"), "Marque a autorização para enviar o relato.", "error"); $("report-consent").focus(); return; }
      const token = tokenFor("report-turnstile");
      if (siteKey && !token) { status($("report-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const button = $("submit-report"); button.disabled = true;
      status($("report-feedback"), "Enviando seus problemas…");
      try {
        await request("/api/radar/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unitId, name: $("report-name").value.trim(), contact: $("report-contact").value.trim(), issues: selectedIssues, consent: true, turnstileToken: token, website: $("report-website").value }) });
        selectedIssues.length = 0; renderSelected();
        $("radar-report-form").reset(); $("report-category").dispatchEvent(new Event("change")); showEmergency();
        status($("report-feedback"), "Relato recebido para revisão. Ele aparecerá no painel após ser aprovado.", "success");
      } catch (error) { status($("report-feedback"), submissionError(error, "Não foi possível enviar. Seus dados continuam nesta página; tente novamente."), "error"); }
      finally { resetToken("report-turnstile"); button.disabled = false; }
    });
  }

  function setupMediaForm() {
    if (!$('radar-media-form')) return;
    $("radar-media-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!canSend) return;
      const unitId = normalizeUnit($("media-unit").value);
      if (!validUnit(unitId)) { status($("media-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("media-unit").focus(); return; }
      const room = $("media-room").value.trim();
      if (!room) { status($("media-feedback"), "Informe o cômodo ou local da mídia.", "error"); $("media-room").focus(); return; }
      const categoryId = $("media-category").value;
      const [topicId, detailId] = $("media-detail").value.split(":");
      if (!topic(categoryId, topicId)?.details.some(([id]) => id === detailId)) { status($("media-feedback"), "Escolha o assunto e o problema.", "error"); $("media-category").focus(); return; }
      const file = $("media-file").files?.[0];
      const max = file?.type.startsWith("image/") ? 8 * 1024 * 1024 : 25 * 1024 * 1024;
      if (!file || !["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(file.type) || file.size > max) { status($("media-feedback"), "Use uma foto JPG, PNG ou WebP de até 8 MB, ou vídeo MP4/WebM de até 25 MB.", "error"); return; }
      const description = $("media-description").value.trim();
      if ([categoryId, topicId, detailId].includes("outros") && !description) { status($("media-feedback"), "Em ‘Outros’, acrescente uma descrição.", "error"); $("media-description").focus(); return; }
      if (!$("media-consent").checked) { status($("media-feedback"), "Marque a autorização de publicação após revisão.", "error"); return; }
      const token = tokenFor("media-turnstile");
      if (siteKey && !token) { status($("media-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const body = new FormData();
      for (const [key, value] of Object.entries({ unitId, category: categoryId, topic: topicId, detail: detailId, room, description, consent: "true", turnstileToken: token, website: $("media-website").value })) body.append(key, value);
      body.append("media", file, file.name);
      const button = $("submit-media"); button.disabled = true;
      status($("media-feedback"), "Enviando a mídia…");
      try {
        await request("/api/radar/media", { method: "POST", body }, 120000);
        $("radar-media-form").reset(); $("media-category").dispatchEvent(new Event("change"));
        status($("media-feedback"), "Mídia recebida para revisão. Ela só aparecerá no mural depois de aprovada.", "success");
      } catch (error) { status($("media-feedback"), submissionError(error, "Não foi possível enviar a mídia. Tente novamente."), "error"); }
      finally { resetToken("media-turnstile"); button.disabled = false; }
    });
  }

  function openInteraction(type, item) {
    activeInteraction = { type, mediaId: String(item.id) };
    const same = type === "same";
    $("interaction-kicker").textContent = same ? "MESMO PROBLEMA" : "COMENTÁRIO";
    $("interaction-title").textContent = same ? "Acontece comigo também" : "Comentar";
    $("interaction-context").textContent = String(item.problem || item.label || categoryLabel(item.category));
    $("interaction-text-wrap").hidden = same;
    $("interaction-text").required = !same;
    $("interaction-submit").textContent = same ? "Confirmar" : "Enviar para revisão";
    $("radar-interaction-form").reset(); status($("interaction-feedback"), "");
    $("radar-interaction-dialog").showModal();
    $("interaction-name").focus();
  }

  function setupInteraction() {
    const dialog = $("radar-interaction-dialog");
    const close = () => { dialog.close(); activeInteraction = null; };
    $("interaction-close").addEventListener("click", close);
    $("interaction-cancel").addEventListener("click", close);
    dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
    $("radar-interaction-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!activeInteraction || !canSend) return;
      const name = $("interaction-name").value.trim();
      const unitId = normalizeUnit($("interaction-unit").value);
      const text = $("interaction-text").value.trim();
      if (!name) { status($("interaction-feedback"), "Informe seu nome.", "error"); $("interaction-name").focus(); return; }
      if (!validUnit(unitId)) { status($("interaction-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("interaction-unit").focus(); return; }
      if (activeInteraction.type === "comment" && !text) { status($("interaction-feedback"), "Escreva seu comentário.", "error"); $("interaction-text").focus(); return; }
      const token = tokenFor("interaction-turnstile");
      if (siteKey && !token) { status($("interaction-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const button = $("interaction-submit"); button.disabled = true;
      status($("interaction-feedback"), "Enviando…");
      try {
        const same = activeInteraction.type === "same";
        const path = "/api/radar/media/" + encodeURIComponent(activeInteraction.mediaId) + (same ? "/same" : "/comments");
        await request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, unitId, ...(same ? {} : { text }), turnstileToken: token, website: $("interaction-website").value }) });
        status($("interaction-feedback"), same ? "Recebido. Sua confirmação será contabilizada após a revisão." : "Comentário recebido para revisão.", "success");
      } catch (error) { status($("interaction-feedback"), submissionError(error, "Não foi possível enviar. Confira os dados e tente novamente."), "error"); }
      finally { resetToken("interaction-turnstile"); button.disabled = false; }
    });
  }

  function setupPrivacy() {
    $("radar-privacy-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!canSend) return;
      const requestType = $("privacy-type").value;
      const unitId = normalizeUnit($("privacy-unit").value);
      const contact = $("privacy-contact").value.trim();
      if (!["correcao", "remocao"].includes(requestType)) { status($("privacy-feedback"), "Escolha correção ou remoção.", "error"); return; }
      if (!validUnit(unitId)) { status($("privacy-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("privacy-unit").focus(); return; }
      if (!contact) { status($("privacy-feedback"), "Informe um contato para receber a resposta.", "error"); $("privacy-contact").focus(); return; }
      const token = tokenFor("privacy-turnstile");
      if (siteKey && !token) { status($("privacy-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const button = $("submit-privacy"); button.disabled = true;
      status($("privacy-feedback"), "Enviando pedido…");
      try {
        await request("/api/radar/privacy-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unitId, contact, requestType, detail: $("privacy-detail").value.trim(), turnstileToken: token, website: $("privacy-website").value }) });
        $("radar-privacy-form").reset();
        status($("privacy-feedback"), "Pedido recebido para análise. Usaremos o contato informado para responder.", "success");
      } catch (error) { status($("privacy-feedback"), submissionError(error, "Não foi possível enviar o pedido. Tente novamente."), "error"); }
      finally { resetToken("privacy-turnstile"); button.disabled = false; }
    });
  }

  function setupMapFrame() {
    const frame = $("radar-map-frame");
    if (!frame) return;
    window.addEventListener("message", event => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== "riviera-heatmap-height") return;
      const height = Number(event.data.height);
      if (Number.isFinite(height) && height >= 350 && height <= 2400) frame.style.height = Math.ceil(height) + "px";
    });
    frame.addEventListener("load", () => frame.contentWindow?.postMessage({ type: "riviera-theme", theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light" }, location.origin));
  }

  setupTheme();
  setupMapFrame();
  setupTaxonomy();
  setupReports();
  setupMediaForm();
  setupInteraction();
  setupPrivacy();
  setupTurnstile();
  loadSummary();
  loadMedia();
})();
