(function () {
/* ==========================
   Proxi Widget — Sleek Chat
   ========================== */

  // 🔗 Backend & settings
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME =
    "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";
  const BRAND_FROM = "#8b5cf6";
  const BRAND_TO = "#6366f1";
  const SID_KEY = "proxi_session_id";

  // Fonts: Plus Jakarta Sans
  (function injectFont(){
    if (!document.querySelector('link[href*="Plus+Jakarta+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  })();

  // Assets
  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;

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

  // Session
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // CSS (strak)
  const css = `
    :root {
      --proxi-safe: env(safe-area-inset-bottom);
      --vh: 100%;
      --brand-from: ${BRAND_FROM};
      --brand-to: ${BRAND_TO};
      --bg: #ffffff;
      --panel: #ffffff;
      --border: #e5e7eb;
      --text: #111827;
      --chip-bg: #f3f4f6;
      --chip-brd: #e5e7eb;
      --user: #7c6bf8;
      --user2: #6366f1;
      --timestamp: #9ca3af;
      --shadow: 0 8px 28px rgba(0,0,0,0.12);
    }

    * { box-sizing: border-box; }
    #proxi-root, #proxi-button, #proxi-popup { font-family: "Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }

    /* Widget button */
    #proxi-button {
      position: fixed; bottom: 24px; right: 28px; z-index: 999999;
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; background: linear-gradient(135deg, var(--brand-from), var(--brand-to));
      box-shadow: 0 12px 26px rgba(99,102,241,0.35);
      transition: transform .18s ease, box-shadow .18s ease;
    }
    #proxi-button:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 16px 36px rgba(99,102,241,0.42); }
    #proxi-button img { width: 64px; height: 64px; border-radius: 50%; }
    #proxi-status-dot {
      position: absolute; bottom: 6px; right: 6px; width: 13px; height: 13px;
      background: #22c55e; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(34,197,94,0.7);
    }

    /* Welcome balloon */
    #proxi-popup {
      position: fixed; bottom: 100px; right: 28px; max-width: 280px;
      padding: 12px 14px; border-radius: 12px; background: #fff; color: var(--text);
      border: 1px solid var(--border); box-shadow: var(--shadow);
      display: none; z-index: 999998; font-size: 13px; line-height: 1.35;
      animation: proxiFadeIn .35s ease;
    }
    @keyframes proxiFadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

    /* Window */
    #proxi-root {
      position: fixed; right: 28px; bottom: 100px; width: 360px; height: 520px;
      display: none; z-index: 999998; opacity: 0; transform: translateY(14px);
      transition: opacity .28s ease, transform .28s ease;
    }
    #proxi-root.open { opacity: 1; transform: translateY(0); }
    #proxi-box {
      display: flex; flex-direction: column; height: 100%; overflow: hidden;
      border-radius: 16px; background: var(--panel); border: 1px solid var(--border); box-shadow: var(--shadow);
    }

    /* Header */
    #proxi-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #fafafa; border-bottom: 1px solid var(--border); color: var(--text);
    }
    #proxi-head .left { display: flex; align-items: center; gap: 10px; }
    #proxi-head .title { font-weight: 700; font-size: 14px; letter-spacing: .2px; }
    #proxi-close { background: transparent; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--text); }
    @media (min-width: 601px) { #proxi-close { display: none; } }

    /* Messages */
    #proxi-messages { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; padding: 12px 12px 6px 12px; }
    .msg { max-width: 82%; padding: 9px 12px; border-radius: 12px; margin: 6px 0; font-size: 14px; line-height: 1.45; }
    .msg a { color: #2563eb; text-decoration: underline; word-break: break-word; }
    .bot { background: #ffffff; border: 1px solid var(--border); color: var(--text); }
    .user { margin-left: auto; color: #fff; background: linear-gradient(135deg, var(--user), var(--user2)); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 6px 16px rgba(99,102,241,0.22); }
    .timestamp { display: block; font-size: 10.5px; color: var(--timestamp); margin-top: 3px; text-align: right; }

    /* Input */
    #proxi-input { display: flex; align-items: center; gap: 8px; background: #fff; border-top: 1px solid var(--border); padding: 8px 10px calc(10px + var(--proxi-safe)); position: sticky; bottom: 0; }
    #proxi-text { flex: 1; border: 1px solid var(--border); padding: 11px 12px; border-radius: 10px; outline: none; font-size: 14px; background: #fff; }
    #proxi-send { border: none; cursor: pointer; font-weight: 700; border-radius: 10px; padding: 11px 14px; color: #fff; background: linear-gradient(135deg, var(--brand-from), var(--brand-to)); box-shadow: 0 8px 16px rgba(99,102,241,0.22); }

    /* Chips */
    #proxi-chips { margin-top: 2px; }
    .chip { display: inline-block; margin: 4px 6px 0 0; padding: 7px 12px; font-size: 12.5px; border-radius: 999px; cursor: pointer; background: var(--chip-bg); border: 1px solid var(--chip-brd); color: #374151; transition: transform .15s ease, background .15s ease; user-select: none; }
    .chip:hover { transform: translateY(-1px); }

    /* Typing */
    .typing { display: inline-flex; align-items: center; gap: 4px; padding: 9px 12px; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
    .dot { width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: pulse 1s infinite ease-in-out; }
    .dot:nth-child(2){ animation-delay: .15s; } .dot:nth-child(3){ animation-delay: .30s; }
    @keyframes pulse { 0%, 80%, 100% { opacity: .2; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

    /* Mobile */
    @media (max-width: 600px) {
      #proxi-root { right: 0; bottom: 0; width: 100vw; height: calc(var(--vh, 1vh) * 100); }
      #proxi-box { border-radius: 0; }
      #proxi-button.nudging { animation: nudge 1s ease-in-out infinite; }
    }
    @keyframes nudge { 0% { transform: translate(0,0); } 20% { transform: translate(-2px,0); } 40% { transform: translate(2px,0); } 60% { transform: translate(-2px,0); } 80% { transform: translate(2px,0); } 100% { transform: translate(0,0); } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // 100vh fix
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
      <div id="proxi-chips"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..."/>
        <button id="proxi-send">Verstuur</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs  = document.getElementById("proxi-messages");
  const $chips = document.getElementById("proxi-chips");
  const $text  = document.getElementById("proxi-text");
  const $send  = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  function nowTime() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2,"0");
    const m = String(d.getMinutes()).padStart(2,"0");
    return `${h}:${m}`;
  }
  function addMsg(text, who="bot") {
    const wrap = document.createElement("div");
    wrap.className = "msg " + who;
    wrap.innerHTML = `${text}<span class="timestamp">${nowTime()}</span>`;
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function clearChips(){ $chips.innerHTML = ""; }
  function addChips(items){
    clearChips();
    items.forEach(x=>{
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = x;
      chip.onclick = ()=>{ send(x); clearChips(); };
      $chips.appendChild(chip);
    });
  }

  // Typing
  let typingEl = null;
  function showTyping(){
    if (typingEl) return;
    typingEl = document.createElement("div");
    typingEl.className = "typing bot";
    typingEl.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    const row = document.createElement("div");
    row.className = "msg bot";
    row.style.background = "transparent";
    row.style.border = "none";
    row.appendChild(typingEl);
    $msgs.appendChild(row);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function hideTyping(){
    if (!typingEl) return;
    typingEl.parentElement?.parentElement?.remove();
    typingEl = null;
  }

  async function send(text){
    if (!text) return;
    popup.style.display = "none";
    clearChips();
    addMsg(escapeHtml(text), "user");
    $text.value = "";

    showTyping();
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID, session_id: sid() }),
      });
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || "...", "bot");
      if (Array.isArray(data.suggestions) && data.suggestions.length) addChips(data.suggestions);
    } catch(e){
      hideTyping();
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }

  // Open / close
  let chatVisible = false;
  const isMobile = () => window.innerWidth <= 600;

  function openChat(){
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(()=> root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) addMsg(WELCOME, "bot");
    resetIdle();
    setTimeout(()=> $text.focus(), 50);
  }
  function closeChat(){
    root.classList.remove("open");
    setTimeout(()=> (root.style.display = "none"), 240);
    chatVisible = false;
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = ()=> (chatVisible ? closeChat() : openChat());
  popup.onclick = openChat;
  $close.onclick = closeChat;

  $send.onclick = ()=> send($text.value.trim());
  $text.addEventListener("keydown", (e)=>{
    if (e.key === "Enter"){ e.preventDefault(); send($text.value.trim()); }
    if ($chips.childElementCount) clearChips();
    resetIdle();
  });

  // Keyboard lift
  const vv = window.visualViewport;
  function liftWithKeyboard(){
    if (!vv) return;
    const keyboard = (window.innerHeight - (vv.height + vv.offsetTop));
    if (keyboard > 0 && isMobile() && chatVisible) {
      root.style.transform = `translateY(-${keyboard}px)`;
    } else {
      root.style.transform = "translateY(0)";
    }
  }
  vv && vv.addEventListener("resize", liftWithKeyboard);
  vv && vv.addEventListener("scroll", liftWithKeyboard);
  window.addEventListener("orientationchange", ()=> setTimeout(liftWithKeyboard, 250));

  // Welcome popup (2s)
  setTimeout(()=> (popup.style.display = "block"), 2000);

  // Idle nudge (45s)
  let idleTimer = null;
  function resetIdle(){
    if (idleTimer) clearTimeout(idleTimer);
    btn.classList.remove("nudging");
    idleTimer = setTimeout(()=>{
      if (!chatVisible) btn.classList.add("nudging");
    }, 45000);
  }
  ["click","keydown","mousemove","touchstart"].forEach(evt=>{
    window.addEventListener(evt, resetIdle, { passive: true });
  });
  resetIdle();

})();
