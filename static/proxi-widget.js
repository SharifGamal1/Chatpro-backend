(function () {
  /* ===== Proxi Widget (Chatpro-AI) — mobile keyboard + sticky button fixes ===== */

  // Backend & config
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME =
    "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";
  const SID_KEY = "proxi_session_id";

  // Assets
  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

  // Fonts
  (function injectFont(){
    if (!document.querySelector('link[href*="Plus+Jakarta+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap";
      document.head.appendChild(link);
    }
  })();

  // Avatar + dot
  const AVATAR_SVG = `
    <svg viewBox="0 0 64 64" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fff"/>
      <circle cx="32" cy="26" r="10" fill="#fde68a"/>
      <path d="M16 50a16 16 0 0 1 32 0" fill="#a78bfa"/>
    </svg>`;
  const DOT_SVG = `
    <svg viewBox="0 0 10 10" width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="5" r="5" fill="#22c55e"/>
    </svg>`;

  // Session id
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // Styles
  const css = `
    :root {
      --proxi-safe: env(safe-area-inset-bottom);
      --vh: 100%;
      --brand-from: #8b5cf6;
      --brand-to: #6366f1;
      --glass-bg: rgba(248,247,255,0.65);        /* subtiele paarse tint */
      --glass-border: rgba(255,255,255,0.25);
      --shadow: 0 12px 36px rgba(0,0,0,0.18);
      --text: #0f172a;
      --timestamp: #9aa4b2;
    }

    #proxi-root, #proxi-button, #proxi-popup {
      font-family: "Plus Jakarta Sans", -apple-system, system-ui, Segoe UI, Roboto, sans-serif;
    }

    /* ===== Widget button (blijft strak rechtsonder) ===== */
    #proxi-button {
      position: fixed; right: 28px; bottom: 28px;
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--brand-from), var(--brand-to));
      box-shadow: 0 10px 28px rgba(99,102,241,0.35);
      cursor: pointer; z-index: 999999;
      transition: transform .18s ease, box-shadow .18s ease;
      animation: glowPulse 3s ease-in-out infinite alternate;
      will-change: transform;
    }
    #proxi-button:hover { transform: translateY(-2px) scale(1.02); }
    #proxi-button img { width: 64px; height: 64px; border-radius: 50%; }
    #proxi-status-dot {
      position: absolute; bottom: 6px; right: 6px; width: 13px; height: 13px;
      background: #22c55e; border: 2px solid #fff; border-radius: 50%;
      box-shadow: 0 0 8px rgba(34,197,94,.7);
    }
    @keyframes glowPulse {
      0% { box-shadow: 0 10px 24px rgba(99,102,241,0.30); }
      100% { box-shadow: 0 14px 34px rgba(99,102,241,0.42); }
    }
    /* Zachte nudge na idle */
    #proxi-button.nudge {
      animation: nudge 1.8s ease-in-out infinite;
    }
    @keyframes nudge {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    /* ===== Welkom-popup ===== */
    #proxi-popup {
      position: fixed; right: 28px; bottom: 100px; z-index: 999998;
      max-width: 280px; padding: 12px 14px; border-radius: 14px;
      background: rgba(255,255,255,0.9);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow);
      display: none; font-size: 13.5px; color: var(--text);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      animation: fadeIn .35s ease;
    }
    @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }

    /* ===== Chat window ===== */
    #proxi-root {
      position: fixed; right: 28px; bottom: 100px;
      width: 340px; height: 470px;
      display: none; z-index: 999998;
      opacity: 0; transform: translateY(14px);
      transition: opacity .28s ease, transform .28s ease;
      will-change: transform;
    }
    #proxi-root.open { opacity: 1; transform: translateY(0); }

    #proxi-box {
      display: flex; flex-direction: column; height: 100%;
      overflow: hidden; border-radius: 18px;
      border: 1px solid var(--glass-border);
      background: var(--glass-bg);
      backdrop-filter: blur(22px) saturate(160%);
      -webkit-backdrop-filter: blur(22px) saturate(160%);
      box-shadow: var(--shadow);
    }

    /* Header (frosted) */
    #proxi-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; color: #1d1d1f;
      background: rgba(140, 90, 250, 0.18);
      border-bottom: 1px solid var(--glass-border);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }
    #proxi-head .left { display: flex; align-items: center; gap: 8px; }
    #proxi-head .title { font-weight: 600; font-size: 14px; letter-spacing: .2px; }
    #proxi-close { background: transparent; border: none; font-size: 20px; line-height: 1; color: #4b5563; cursor: pointer; display: none; }
    @media (max-width: 600px) { #proxi-close { display: block; } }

    /* Messages */
    #proxi-messages {
      flex: 1; padding: 12px; overflow: auto; -webkit-overflow-scrolling: touch;
    }
    .msg { max-width: 82%; padding: 9px 12px; border-radius: 12px; margin: 6px 0; font-size: 14px; line-height: 1.45; }
    .msg a { color: #2563eb; text-decoration: underline; word-break: break-word; }
    .bot { background: rgba(255,255,255,0.75); color: var(--text); border: 1px solid var(--glass-border); }
    .user { margin-left: auto; color: #fff; background: linear-gradient(135deg,#7c6bf8,#6366f1); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 6px 16px rgba(99,102,241,.22); }
    .timestamp { display: block; font-size: 10.5px; color: var(--timestamp); margin-top: 3px; text-align: right; }

    /* Chips */
    .chip {
      display: inline-block; margin: 4px 6px 0 0; padding: 7px 12px; font-size: 12.5px;
      border-radius: 999px; cursor: pointer; user-select: none;
      background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); color: #424b9b;
      transition: transform .15s ease, background .15s ease;
    }
    .chip:hover { transform: translateY(-1px); }

    /* Input (frosted) */
    #proxi-input {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px calc(10px + var(--proxi-safe));
      background: rgba(255,255,255,0.5);
      border-top: 1px solid var(--glass-border);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      position: sticky; bottom: 0;
    }
    #proxi-text {
      flex: 1; border: 1px solid rgba(0,0,0,0.08); padding: 11px 12px; border-radius: 12px;
      outline: none; font-size: 14px; background: rgba(255,255,255,0.8);
    }
    #proxi-send {
      border: none; padding: 11px 14px; border-radius: 12px; cursor: pointer;
      color: #fff; font-weight: 700; background: linear-gradient(135deg,var(--brand-from),var(--brand-to));
      box-shadow: 0 8px 16px rgba(99,102,241,0.22);
    }

    /* Footer badge */
    #proxi-foot {
      border-top: 1px solid var(--glass-border);
      padding: 6px 10px; font-size: 12px; color: rgba(31,41,55,0.6);
      display: flex; justify-content: center; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(10px);
    }
    #proxi-foot img { width: 14px; height: 14px; }

    /* Mobile: fullscreen + juiste 100vh */
    @media (max-width: 600px) {
      #proxi-root { right: 0; bottom: 0; width: 100vw; height: calc(var(--vh, 1vh) * 100); border-radius: 0; transform: translateY(0); }
      #proxi-box { border-radius: 0; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // 100vh fix (iOS)
  function fixMobileHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  fixMobileHeight();
  window.addEventListener("resize", fixMobileHeight);
  window.addEventListener("orientationchange", () => setTimeout(fixMobileHeight, 250));

  // Elements
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/><div id="proxi-status-dot"></div>`;
  document.body.appendChild(btn);

  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.textContent = WELCOME;
  document.body.appendChild(popup);

  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div class="left">
          <div class="face">${AVATAR_SVG}<span class="dot">${DOT_SVG}</span></div>
          <div class="title">Proxi</div>
        </div>
        <button id="proxi-close" title="Sluiten">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..." autocomplete="on" />
        <button id="proxi-send">Verstuur</button>
      </div>
      <div id="proxi-foot">
        <img src="${LOGO_URL}" alt="ChatPro-AI" />
        Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank" rel="noopener">ChatPro-AI</a>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs  = document.getElementById("proxi-messages");
  const $text  = document.getElementById("proxi-text");
  const $send  = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  // Helpers
  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    const time = new Date();
    const hh = String(time.getHours()).padStart(2,"0");
    const mm = String(time.getMinutes()).padStart(2,"0");
    div.innerHTML = `${text}<span class="timestamp">${hh}:${mm}</span>`;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function addChips(items) {
    items.forEach(x => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = x;
      chip.onclick = () => send(x);
      $msgs.appendChild(chip);
    });
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  // Typing indicator
  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    const wrap = document.createElement("div");
    wrap.className = "msg bot";
    wrap.style.background = "rgba(255,255,255,0.75)";
    wrap.style.border = "1px solid var(--glass-border)";
    typingEl = document.createElement("div");
    typingEl.style.display = "inline-flex";
    typingEl.style.gap = "4px";
    typingEl.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    Object.assign(typingEl.style,{
      alignItems:"center", padding:"2px 0"
    });
    const styleDots = document.createElement("style");
    styleDots.textContent = `
      .dot { width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:pulse 1s infinite ease-in-out; }
      .dot:nth-child(2){ animation-delay:.15s } .dot:nth-child(3){ animation-delay:.30s }
      @keyframes pulse { 0%,80%,100%{opacity:.2; transform:translateY(0)} 40%{opacity:1; transform:translateY(-2px)} }
    `;
    document.head.appendChild(styleDots);
    wrap.appendChild(typingEl);
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function hideTyping() {
    if (!typingEl) return;
    const wrap = typingEl.parentElement;
    wrap && wrap.remove();
    typingEl = null;
  }

  // Send
  async function send(text) {
    const val = typeof text === "string" ? text : $text.value.trim();
    if (!val) return;
    popup.style.display = "none";
    addMsg(val, "user");
    $text.value = "";

    showTyping();
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: val, bot_id: BOT_ID, session_id: sid() }),
      });
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || "...", "bot");
      if (Array.isArray(data.suggestions) && data.suggestions.length) addChips(data.suggestions);
    } catch (e) {
      hideTyping();
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  // Open / Close
  let chatVisible = false;
  const isMobile = () => window.innerWidth <= 600;

  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) addMsg(WELCOME, "bot");
    resetIdle();
    setTimeout(()=> $text.focus(), 50);
  }
  function closeChat() {
    root.classList.remove("open");
    setTimeout(() => (root.style.display = "none"), 240);
    chatVisible = false;
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  $close.onclick = closeChat;
  popup.onclick = openChat;

  // Input events
  $send.onclick = send;
  $text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); send(); }
    resetIdle();
  });

  // ===== iOS/Android keyboard & sticky fixes using visualViewport =====
  const vv = window.visualViewport;

  function applyViewportFixes() {
    if (!vv) return;

    // 1) Hou chat-venster en popup netjes rechtsonder (compenseer URL/toolbar)
    const offset = vv.offsetTop || 0;
    // iOS: als je naar beneden scrolt en de URL-bar verdwijnt, verhoog bottom posities licht
    root.style.bottom  = isMobile() ? `0px` : `${100 + offset}px`;
    popup.style.bottom = `${100 + offset}px`;
    btn.style.bottom   = `${28 + offset}px`;

    // 2) Keyboard-lift: schuif chat omhoog zodat input volledig zichtbaar blijft
    const keyboard = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
    if (keyboard > 0 && isMobile() && chatVisible) {
      // Til het hele venster op met exact keyboard-hoogte
      root.style.transform = `translateY(-${keyboard}px)`;
    } else if (chatVisible) {
      root.style.transform = `translateY(0)`;
    }
  }

  if (vv) {
    vv.addEventListener("resize", applyViewportFixes);
    vv.addEventListener("scroll", applyViewportFixes);
  }
  window.addEventListener("scroll", applyViewportFixes, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(applyViewportFixes, 250));
  applyViewportFixes();

  // Welkom popup
  setTimeout(() => (popup.style.display = "block"), 2000);

  // Idle nudge (zacht)
  let idleTimer = null;
  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    btn.classList.remove("nudge");
    idleTimer = setTimeout(() => {
      if (!chatVisible) btn.classList.add("nudge");
    }, 45000);
  }
  ["click","keydown","mousemove","touchstart"].forEach(evt => {
    window.addEventListener(evt, resetIdle, { passive: true });
  });
  resetIdle();
})();
