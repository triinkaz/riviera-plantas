(() => {
  "use strict";

  // Mesma classificação usada no Radar. IDs também são validados pelo serviço.
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
  const page = document.body.dataset.formPage;
  const apiBase = normalizeApiBase(window.RIVIERA_RADAR_API_URL);
  const siteKey = typeof window.RIVIERA_RADAR_TURNSTILE_SITEKEY === "string" ? window.RIVIERA_RADAR_TURNSTILE_SITEKEY.trim() : "";
  const canSend = Boolean(apiBase);
  const selectedIssues = [];
  let widgetId = null;
  let submitting = false;

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
  function validUnit(unit) {
    const match = /^(\d{3,4})[A-D]$/.exec(unit);
    const floor = match ? Math.floor(Number(match[1]) / 100) : 0;
    return floor >= 1 && floor <= 30;
  }
  function validFile(file) {
    const max = file?.type.startsWith("image/") ? 8_000_000 : 25_000_000;
    return Boolean(file && ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(file.type) && file.size > 0 && file.size <= max);
  }
  function fileError() { return "Use fotos JPG, PNG ou WebP de até 8 MB cada, ou vídeos MP4/WebM de até 25 MB cada."; }
  async function request(path, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(apiBase + path, { ...options, signal: controller.signal, credentials: "omit", cache: "no-store" });
      let body = null;
      try { body = await response.json(); } catch { /* erro ou resposta sem JSON */ }
      if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "Não foi possível concluir. Tente novamente.");
      return body;
    } finally { clearTimeout(timer); }
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
      reflect();
    });
    reflect();
  }
  function setupTaxonomy() {
    const categorySelect = $(page === "report" ? "report-category" : "media-category");
    for (const item of catalog) option(categorySelect, item.id, item.label);
    if (page === "report") {
      $("report-category").addEventListener("change", () => {
        const select = $("report-topic");
        resetSelect(select, "Escolha o assunto");
        resetSelect($("report-detail"), "Escolha primeiro o assunto");
        const chosen = category($("report-category").value);
        select.disabled = !chosen;
        $("report-detail").disabled = true;
        chosen?.topics.forEach(item => option(select, item.id, item.label));
      });
      $("report-topic").addEventListener("change", () => {
        const select = $("report-detail");
        resetSelect(select, "Escolha o problema");
        const chosen = topic($("report-category").value, $("report-topic").value);
        select.disabled = !chosen;
        chosen?.details.forEach(([id, label]) => option(select, id, label));
      });
    } else {
      $("media-category").addEventListener("change", () => {
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
    }
  }
  function tokenFor() { return window.turnstile && widgetId !== null ? window.turnstile.getResponse(widgetId) || "" : ""; }
  function resetToken() { if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId); }
  async function setupTurnstile() {
    if (!canSend) {
      const message = "Envios ainda não disponíveis. Tente novamente mais tarde.";
      $("radar-availability").hidden = false;
      $("radar-availability").textContent = message;
      $(page === "report" ? "submit-report" : "submit-media").disabled = true;
      status($(page === "report" ? "report-feedback" : "media-feedback"), message, "error");
      return;
    }
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
      if (!window.turnstile) throw new Error("Verificação indisponível");
      widgetId = window.turnstile.render($(page === "report" ? "report-turnstile" : "media-turnstile"), { sitekey: siteKey, theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light" });
    } catch {
      $(page === "report" ? "submit-report" : "submit-media").disabled = true;
      status($(page === "report" ? "report-feedback" : "media-feedback"), "Não foi possível preparar o envio seguro. Atualize a página e tente novamente.", "error");
    }
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
    return { category: categoryId, topic: topicId, detail: detailId, room: $("report-room").value.trim(), description, activeNow: $("report-active").checked, risk: $("report-risk").checked, blocks: $("report-blocks").checked, protocol: $("report-protocol").value.trim() };
  }
  function selectedFiles() { return selectedIssues.flatMap(entry => entry.files); }
  function reflectMediaConsent() {
    const hasFiles = selectedFiles().length > 0;
    $("media-consent-wrap").hidden = !hasFiles;
    if (!hasFiles) $("report-media-consent").checked = false;
  }
  function renderSelected() {
    const list = $("selected-issues");
    list.replaceChildren();
    if (!selectedIssues.length) {
      const empty = document.createElement("li"); empty.className = "radar-empty"; empty.textContent = "Nenhum selecionado ainda."; list.append(empty); reflectMediaConsent(); return;
    }
    selectedIssues.forEach((entry, index) => {
      const issue = entry.issue;
      const row = document.createElement("li");
      const copy = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = detailLabel(issue.category, issue.topic, issue.detail);
      const small = document.createElement("small"); small.textContent = [categoryLabel(issue.category), topicLabel(issue.category, issue.topic), issue.room].filter(Boolean).join(" · ");
      copy.append(title, small);
      if (entry.files.length) { const media = document.createElement("small"); media.className = "radar-attachment-list"; media.textContent = entry.files.length + (entry.files.length === 1 ? " arquivo: " : " arquivos: ") + entry.files.map(file => file.name).join(", "); copy.append(media); }
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remover"; remove.setAttribute("aria-label", "Remover " + title.textContent); remove.addEventListener("click", () => { selectedIssues.splice(index, 1); renderSelected(); });
      row.append(copy, remove); list.append(row);
    });
    reflectMediaConsent();
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
    if (selectedIssues.some(entry => [entry.issue.category, entry.issue.topic, entry.issue.detail, entry.issue.room.toLowerCase()].join("|") === key)) { status($("add-issue-feedback"), "Este problema já está na lista.", "error"); return false; }
    const files = Array.from($("report-files").files || []);
    if (files.some(file => !validFile(file))) { status($("add-issue-feedback"), fileError(), "error"); $("report-files").focus(); return false; }
    const allFiles = selectedFiles().concat(files);
    if (allFiles.length > 4) { status($("add-issue-feedback"), "O limite é de 4 arquivos no mesmo envio.", "error"); $("report-files").focus(); return false; }
    if (allFiles.reduce((sum, file) => sum + file.size, 0) > 26_000_000) { status($("add-issue-feedback"), "Os arquivos somados devem ter até 26 MB. Envie os demais separadamente.", "error"); $("report-files").focus(); return false; }
    selectedIssues.push({ issue, files });
    renderSelected();
    status($("add-issue-feedback"), "Problema adicionado. Você pode escolher outro ou enviar a lista.", "success");
    for (const id of ["report-room", "report-description", "report-protocol", "report-files"]) $(id).value = "";
    for (const id of ["report-active", "report-risk", "report-blocks"]) $(id).checked = false;
    $("report-category").value = "";
    $("report-category").dispatchEvent(new Event("change"));
    showEmergency();
    return true;
  }
  function setupReports() {
    $("add-issue").addEventListener("click", addIssue);
    for (const id of ["report-active", "report-risk", "report-blocks"]) $(id).addEventListener("change", showEmergency);
    $("radar-report-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!canSend || submitting) return;
      // Inclui automaticamente o problema em edição, evitando que o morador o esqueça.
      if ($( "report-category" ).value || !selectedIssues.length) {
        if (!addIssue()) { $("report-category").focus(); return; }
      }
      const unitId = normalizeUnit($("report-unit").value);
      if (!validUnit(unitId)) { status($("report-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("report-unit").focus(); return; }
      if (!$("report-consent").checked) { status($("report-feedback"), "Marque a autorização para enviar o relato.", "error"); $("report-consent").focus(); return; }
      const files = selectedFiles();
      if (files.length && !$("report-media-consent").checked) { status($("report-feedback"), "Marque também a autorização para enviar as mídias ao mural.", "error"); $("report-media-consent").focus(); return; }
      const token = tokenFor();
      if (siteKey && !token) { status($("report-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const body = new FormData();
      body.append("payload", JSON.stringify({ unitId, name: $("report-name").value.trim(), contact: $("report-contact").value.trim(), issues: selectedIssues.map(entry => entry.issue), consent: true, mediaConsent: files.length > 0, turnstileToken: token, website: $("report-website").value }));
      selectedIssues.forEach((entry, index) => entry.files.forEach(file => body.append("media_" + index, file, file.name)));
      const button = $("submit-report"); button.disabled = true; submitting = true;
      status($("report-feedback"), files.length ? "Enviando seus problemas e mídias…" : "Enviando seus problemas…");
      try {
        const result = await request("/api/radar/reports-with-media", { method: "POST", body }, 120000);
        const received = Number.isInteger(result?.received) && result.received >= 0 ? result.received : 0;
        const mediaReceived = Number.isInteger(result?.mediaReceived) && result.mediaReceived >= 0 ? result.mediaReceived : 0;
        if (!received && !mediaReceived) {
          status($("report-feedback"), typeof result?.message === "string" && result.message.trim() ? result.message.trim() : "Nenhum registro novo foi recebido. Confira os problemas e tente novamente.", "error");
          return;
        }
        selectedIssues.length = 0; renderSelected();
        $("radar-report-form").reset(); $("report-category").dispatchEvent(new Event("change")); showEmergency();
        status($("add-issue-feedback"), "");
        const reportPart = received ? received + (received === 1 ? " problema recebido" : " problemas recebidos") : "";
        const mediaPart = mediaReceived ? mediaReceived + (mediaReceived === 1 ? " mídia recebida" : " mídias recebidas") : "";
        const visibility = received && mediaReceived ? "Os relatos aprovados entrarão no painel e as mídias aprovadas aparecerão no mural." : received ? "Os relatos aprovados entrarão no painel." : "As mídias aprovadas aparecerão no mural.";
        status($("report-feedback"), [reportPart, mediaPart].filter(Boolean).join(" e ") + " para revisão. " + visibility, "success");
      } catch (error) { status($("report-feedback"), submissionError(error, "Não foi possível enviar. Seus dados continuam nesta página; tente novamente."), "error"); }
      finally { resetToken(); button.disabled = false; submitting = false; }
    });
  }
  function setupMediaForm() {
    $("radar-media-form").addEventListener("submit", async event => {
      event.preventDefault();
      if (!canSend || submitting) return;
      const unitId = normalizeUnit($("media-unit").value);
      if (!validUnit(unitId)) { status($("media-feedback"), "Informe o ID da unidade, como 804A.", "error"); $("media-unit").focus(); return; }
      const room = $("media-room").value.trim();
      if (!room) { status($("media-feedback"), "Informe o cômodo ou local da mídia.", "error"); $("media-room").focus(); return; }
      const categoryId = $("media-category").value;
      const [topicId, detailId] = $("media-detail").value.split(":");
      if (!topic(categoryId, topicId)?.details.some(([id]) => id === detailId)) { status($("media-feedback"), "Escolha o assunto e o problema.", "error"); $("media-category").focus(); return; }
      const file = $("media-file").files?.[0];
      if (!validFile(file)) { status($("media-feedback"), fileError(), "error"); $("media-file").focus(); return; }
      const description = $("media-description").value.trim();
      if ([categoryId, topicId, detailId].includes("outros") && !description) { status($("media-feedback"), "Em ‘Outros’, acrescente uma descrição.", "error"); $("media-description").focus(); return; }
      if (!$("media-consent").checked) { status($("media-feedback"), "Marque a autorização de publicação após revisão.", "error"); $("media-consent").focus(); return; }
      const token = tokenFor();
      if (siteKey && !token) { status($("media-feedback"), "Conclua a verificação antes de enviar.", "error"); return; }
      const body = new FormData();
      for (const [key, value] of Object.entries({ unitId, category: categoryId, topic: topicId, detail: detailId, room, description, consent: "true", turnstileToken: token, website: $("media-website").value })) body.append(key, value);
      body.append("media", file, file.name);
      const button = $("submit-media"); button.disabled = true; submitting = true;
      status($("media-feedback"), "Enviando a mídia…");
      try {
        await request("/api/radar/media", { method: "POST", body }, 120000);
        $("radar-media-form").reset(); $("media-category").dispatchEvent(new Event("change"));
        status($("media-feedback"), "Mídia recebida para revisão. Ela só aparecerá no mural depois de aprovada.", "success");
      } catch (error) { status($("media-feedback"), submissionError(error, "Não foi possível enviar a mídia. Tente novamente."), "error"); }
      finally { resetToken(); button.disabled = false; submitting = false; }
    });
  }

  if (!["report", "media"].includes(page)) return;
  setupTheme();
  setupTaxonomy();
  if (page === "report") setupReports(); else setupMediaForm();
  setupTurnstile();
})();
