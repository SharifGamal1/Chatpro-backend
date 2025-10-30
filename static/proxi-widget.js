(function () {
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;

  const WELCOME1 = "Welkom bij ChatPro-AI 👋, ik ben Proxi.";
  const WELCOME2 = "Laat me gerust weten als je ergens hulp bij nodig hebt.";

  const SUGGESTIONS = [
    "Wat kost ChatPro-AI en hoe snel ben ik live?",
    "Kan ik een demo van de chatbot krijgen?",
    "Hoe werkt de integratie met mijn website?",
    "Kan ik direct contact opnemen met een expert?"
  ];

  const AVATAR_SVG = `
    <svg viewBox="0 0 64 64" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#fff"/>
      <circle cx="32" cy="26" r="10" fill="#fde68a"/>
      <path d="M16 50a16 16 0 0 1 32 0" fill="#a78bfa"/>
    </svg>`;
  const DOT_SVG = `
    <svg viewBox="0 0 10 10" width="8" height="8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="5" cy="5" r="5" fill="#22c55e"/>
    </svg>`;

  const SID_KEY = "proxi_session_id";
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // ───────────────────────────────────────────────
  // CSS-injectie (Apple frosted glass + mobiel fix)
  // ───────────────────────────────────────────────
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
  :root {
    --vh: 100%;
    --accent1: #8b5cf6;
    --accent2: #6366f1;
    --bg-glass: rgba(255,255,255,0.75);
    --border-glass: rgba(255,255,255,0.5);
    --shadow: 0 18px 45px rgba(0,0,0,.22);
    --radius: 18px;
    --msg-radius: 14px;
    --safe: env(safe-area-inset-bottom);
  }
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

  /* Widget knop */
  #proxi-button {
    position: fixed; right: 30px; bottom: 25px;
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent1), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 22px rgba(0,0,0,.2);
    cursor: pointer; z-index: 99999;
  }
  #proxi-button img { width: 60%; height: 60%; }
  #proxi-status-dot {
    position: absolute; right: 6px; bottom: 6px;
    width: 13px; height: 13px; border-radius: 50%;
    background: #22c55e; border: 2px solid #fff;
  }

  /* Welkomst-popup */
  #proxi-popup {
    position: fixed; right: 30px; bottom: 100px;
    z-index: 99998; display: none;
    background: #fff; border-radius: 14px;
    padding: 12px 14px; font-size: 13px; color: #111;
    box-shadow: 0 8px 25px rgba(0,0,0,.15);
    max-width: 260px; line-height: 1.45;
    animation: fadeIn .4s ease;
  }

  /* Chatvenster */
  #proxi-root {
    position: fixed; right: 30px; bottom: 95px;
    width: 360px; height: 520px; display: none;
    opacity: 0; transform: translateY(14px);
    transition: all .3s ease; z-index: 99998;
  }
  #proxi-root.open { opacity: 1; transform: translateY(0); }

  #proxi-box {
    display: flex; flex-direction: column; height: 100%;
    background: var(--bg-glass);
    backdrop-filter: saturate(120%) blur(24px);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  #proxi-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,.05);
    background: linear-gradient(135deg, rgba(139,92,246,.15), rgba(99,102,241,.10));
  }
  #proxi-head .left { display: flex; align-items: center; gap: 8px; }
  #proxi-head .title { font-weight: 600; font-size: 15px; }
  #proxi-close { background: none; border: none; font-size: 22px; color: #555; cursor: pointer; display: none; }

  #proxi-messages {
    flex: 1; padding: 12px; overflow-y: auto;
  }
  .msg {
    max-width: 82%; margin: 6px 0; padding: 10px 12px;
    border-radius: var(--msg-radius);
    background: #fff; color: #111;
    border: 1px solid rgba(0,0,0,.05);
    font-size: 13.5px;
    animation: fadeIn .3s ease forwards; opacity: 0;
  }
  .msg.user {
    margin-left: auto;
    background: linear-gradient(135deg, rgba(139,92,246,.9), rgba(99,102,241,.9));
    color: #fff; border: none;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .time { font-size: 11px; color: #999; text-align: right; margin-top: 2px; }

  /* Chips */
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
  .chip {
    font-size: 12.5px; padding: 7px 11px; border-radius: 999px;
    background: linear-gradient(135deg, rgba(139,92,246,.1), rgba(99,102,241,.08));
    border: 1px solid rgba(99,102,241,.25); color: #333;
    cursor: pointer; transition: all .12s ease;
  }
  .chip:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(99,102,241,.15); }

  /* Typing indicator */
  .typing { display: inline-flex; gap: 4px; padding: 8px; }
  .typing span { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: blink 1.2s infinite both; }
  .typing span:nth-child(2) { animation-delay: .15s; } .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes blink { 0%,80%,100% { opacity: .3; transform: scale(1); } 40% { opacity: 1; transform: scale(1.2); } }

  /* Input */
  #proxi-input { display: flex; gap: 8px; padding: 10px 12px calc(10px + var(--safe)); background: rgba(255,255,255,.8); border-top: 1px solid rgba(0,0,0,.05); }
  #proxi-text { flex: 1; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 10px 12px; }
  #proxi-send { width: 38px; height: 38px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--accent1), var(--accent2)); color: #fff; font-size: 16px; }

  #proxi-foot { text-align: center; padding: 6px; font-size: 12px; color: #9aa0a6; }
  #proxi-foot a { color: var(--accent2); text-decoration: none; }

  /* Mobile fullscreen */
  @media (max-width: 600px) {
    #proxi-root { right: 0; bottom: 0; width: 100vw; height: calc(var(--vh, 1vh) * 100); }
    #proxi-box { border-radius: 0; }
    #proxi-close { display: block; }
  }`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ───────────────────────────────────────────────
  // ELEMENTEN BOUWEN
  // ───────────────────────────────────────────────
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/><div id="proxi-status-dot"></div>`;
  document.body.appendChild(btn);

  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.innerHTML = `${WELCOME1}<br>${WELCOME2}`;
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
        <button id="proxi-close">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..." autocomplete="off"/>
        <button id="proxi-send">→</button>
      </div>
      <div id="proxi-foot">Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank">ChatPro-AI</a></div>
    </div>`;
  document.body.appendChild(root);

  // ───────────────────────────────────────────────
  // FUNCTIONALITEIT
  // ───────────────────────────────────────────────
  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  const isMobile = () => window.innerWidth <= 600;
  const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function addMsg(text, who) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (who || "bot");
    wrap.innerHTML = text;
    const t = document.createElement("div");
    t.className = "time";
    t.textContent = nowTime();
    const c = document.createElement("div");
    c.appendChild(wrap);
    c.appendChild(t);
    $msgs.appendChild(c);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "typing";
    el.id = "proxi-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    $msgs.appendChild(el);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById("proxi-typing");
    if (el) el.remove();
  }

  function showChips(arr) {
    const wrap = document.createElement("div");
    wrap.className = "chips";
    wrap.id = "proxi-chips";
    arr.forEach(q => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = q;
      c.onclick = () => { removeChips(); send(q); };
      wrap.appendChild(c);
    });
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function removeChips() {
    const el = document.getElementById("proxi-chips");
    if (el) el.remove();
  }

  async function send(text) {
    if (!text) return;
    popup.style.display = "none";
    removeChips();
    addMsg(text, "user");
    $text.value = "";
    showTyping();
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID, session_id: sid() })
      });
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || "…", "bot");
      if (Array.isArray(data.suggestions)) showChips(data.suggestions.slice(0, 4));
    } catch {
      hideTyping();
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  $send.onclick = () => send($text.value.trim());
  $text.addEventListener("keydown", e => { if (e.key === "Enter") send($text.value.trim()); });
  $text.addEventListener("input", removeChips);

  let chatVisible = false;
  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) {
      addMsg(WELCOME1, "bot");
      addMsg(WELCOME2, "bot");
      showChips(SUGGESTIONS);
    }
  }

  function closeChat() {
    root.classList.remove("open");
    setTimeout(() => root.style.display = "none", 220);
    chatVisible = false;
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  popup.onclick = openChat;
  $close.onclick = closeChat;

  // Welkomst-popup na 2s
  setTimeout(() => { popup.style.display = "block"; }, 2000);

  // Nudge animatie
  setTimeout(() => {
    btn.style.animation = "nudge 1s ease";
    setTimeout(() => btn.style.animation = "", 1200);
  }, 45000);

  // iOS keyboard fix
  const vv = window.visualViewport;
  function adjustForKeyboard() {
    if (!vv) return;
    const kb = window.innerHeight - (vv.height + vv.offsetTop);
    if (kb > 0 && isMobile() && chatVisible)
      root.style.transform = `translateY(-${kb}px)`;
    else root.style.transform = "";
  }
  vv && vv.addEventListener("resize", adjustForKeyboard);
})();
