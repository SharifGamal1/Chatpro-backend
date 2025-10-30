(function () {
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME =
    "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";

  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

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

  const SID_KEY = "proxi_session_id";
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

    :root {
      --proxi-safe: env(safe-area-inset-bottom);
      --vh: 100%;
    }

    body, #proxi-root, #proxi-popup, #proxi-box, #proxi-input, #proxi-head {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* 💬 Widget button */
    #proxi-button {
      position: fixed; bottom: 25px; right: 35px;
      width: 62px; height: 62px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(145deg, #8b5cf6, #6366f1);
      box-shadow: 0 4px 18px rgba(0,0,0,0.2);
      cursor: pointer; z-index: 99999;
      transition: transform .25s ease;
      animation: glowPulse 3s infinite alternate;
    }
    #proxi-button:hover { transform: scale(1.05); }
    @keyframes glowPulse {
      0% { box-shadow: 0 0 12px rgba(139,92,246,.4), 0 0 20px rgba(99,102,241,.3); }
      100% { box-shadow: 0 0 16px rgba(139,92,246,.6), 0 0 28px rgba(99,102,241,.5); }
    }
    #proxi-button img { width: 60px; height: 60px; border-radius: 50%; }

    #proxi-status-dot {
      position: absolute; bottom: 6px; right: 6px;
      width: 13px; height: 13px;
      background: #22c55e;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(34,197,94,0.8);
    }

    /* 🫧 Frosted glass styles */
    .frosted {
      backdrop-filter: blur(18px) saturate(160%);
      -webkit-backdrop-filter: blur(18px) saturate(160%);
      background: rgba(248, 247, 255, 0.65);
      border: 1px solid rgba(255,255,255,0.25);
    }

    /* 💬 Popup */
    #proxi-popup {
      position: fixed; bottom: 95px; right: 35px;
      padding: 12px 15px; border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,.15);
      max-width: 260px; font-size: 14px;
      color: #111; display: none; z-index: 99998;
      animation: fadeIn .4s ease;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(10px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 💬 Chat window */
    #proxi-root {
      position: fixed; right: 35px; bottom: 95px;
      width: 360px; height: 510px;
      display: none; z-index: 99998;
      opacity: 0; transform: translateY(15px);
      transition: all .3s ease;
    }
    #proxi-root.open { opacity: 1; transform: translateY(0); }

    #proxi-box {
      display: flex; flex-direction: column;
      height: 100%; border-radius: 18px;
      overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,.25);
      background: rgba(249,248,255,0.6);
      backdrop-filter: blur(20px);
    }

    /* Header */
    #proxi-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px;
      background: rgba(140, 90, 250, 0.25);
      backdrop-filter: blur(20px);
      color: #1f1f1f;
      border-bottom: 1px solid rgba(255,255,255,0.25);
    }
    #proxi-head .left { display: flex; align-items: center; gap: 8px; }
    #proxi-head .title { font-weight: 600; font-size: 14px; letter-spacing: 0.3px; }
    #proxi-close {
      background: transparent; border: none; color: #444;
      font-size: 20px; cursor: pointer;
      display: none;
    }
    @media (max-width: 600px) { #proxi-close { display: block; } }

    #proxi-messages {
      flex: 1; padding: 12px; overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .msg {
      max-width: 82%; padding: 8px 12px;
      border-radius: 12px; margin: 6px 0;
      font-size: 14px; line-height: 1.4;
      backdrop-filter: blur(8px);
      word-wrap: break-word;
    }
    .bot { background: rgba(255,255,255,0.7); color: #111; border: 1px solid rgba(255,255,255,0.3); }
    .user { background: rgba(139,92,246,0.85); color: #fff; margin-left: auto; }

    .chip {
      display: inline-block;
      background: rgba(139,92,246,0.08);
      border: 1px solid rgba(139,92,246,0.25);
      color: #4f46e5;
      border-radius: 999px;
      padding: 6px 12px;
      margin: 4px 4px 0 0;
      font-size: 13px;
      cursor: pointer;
      transition: background .25s;
    }
    .chip:hover { background: rgba(139,92,246,0.15); }

    #proxi-input {
      display: flex; gap: 8px; align-items: center;
      padding: 8px 10px calc(10px + var(--proxi-safe));
      border-top: 1px solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(14px);
    }
    #proxi-input input {
      flex: 1; padding: 10px 12px;
      border-radius: 10px; border: 1px solid rgba(0,0,0,0.1);
      background: rgba(255,255,255,0.65);
      outline: none; font-size: 14px;
    }
    #proxi-input button {
      border: none; background: #8b5cf6;
      color: #fff; padding: 10px 14px;
      font-weight: 600; border-radius: 10px;
      cursor: pointer; transition: opacity .2s;
    }
    #proxi-input button:hover { opacity: 0.9; }

    #proxi-foot {
      text-align: center; font-size: 12px;
      padding: 6px 0; color: rgba(60,60,60,0.6);
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(8px);
    }

    @media (max-width: 600px) {
      #proxi-root {
        right: 0; bottom: 0; width: 100vw;
        height: calc(var(--vh, 1vh) * 100);
        border-radius: 0;
      }
      #proxi-box { border-radius: 0; }
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function fixMobileHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  fixMobileHeight();
  window.addEventListener("resize", fixMobileHeight);
  window.addEventListener("orientationchange", fixMobileHeight);

  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/><div id="proxi-status-dot"></div>`;
  document.body.appendChild(btn);

  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.innerText = WELCOME;
  document.body.appendChild(popup);

  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box" class="frosted">
      <div id="proxi-head" class="frosted">
        <div class="left">
          <div class="face">${AVATAR_SVG}<span class="dot">${DOT_SVG}</span></div>
          <div class="title">Proxi</div>
        </div>
        <button id="proxi-close" title="Sluiten">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input" class="frosted">
        <input id="proxi-text" type="text" placeholder="Typ hier..."/>
        <button id="proxi-send">Verstuur</button>
      </div>
      <div id="proxi-foot">
        <img src="${LOGO_URL}" width="14" height="14" alt="ChatPro-AI"/>
        Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank">ChatPro-AI</a>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  function initWelcome() { addMsg(WELCOME, "bot"); }

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = text;
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

  async function send(text) {
    if (!text) return;
    popup.style.display = "none";
    addMsg(text, "user");
    $text.value = "";
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID, session_id: sid() }),
      });
      const data = await res.json();
      addMsg(data.reply || "...", "bot");
      if (Array.isArray(data.suggestions)) addChips(data.suggestions);
    } catch {
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  let chatVisible = false;
  function isMobile() { return window.innerWidth <= 600; }

  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) initWelcome();
  }

  function closeChat() {
    root.classList.remove("open");
    setTimeout(() => (root.style.display = "none"), 250);
    chatVisible = false;
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  $close.onclick = closeChat;
  popup.onclick = openChat;

  $send.onclick = () => send($text.value.trim());
  $text.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      send($text.value.trim());
    }
  });

  const vv = window.visualViewport;
  function liftWithKeyboard() {
    if (!vv) return;
    const keyboard = window.innerHeight - (vv.height + vv.offsetTop);
    if (keyboard > 0 && isMobile() && chatVisible) {
      root.style.transform = `translateY(-${keyboard}px)`;
    } else {
      root.style.transform = "translateY(0)";
    }
  }
  vv && vv.addEventListener("resize", liftWithKeyboard);
  vv && vv.addEventListener("scroll", liftWithKeyboard);
  window.addEventListener("orientationchange", () => setTimeout(liftWithKeyboard, 250));

  setTimeout(() => (popup.style.display = "block"), 2000);
})();
