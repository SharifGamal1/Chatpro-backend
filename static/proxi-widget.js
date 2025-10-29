(function () {
  // 🔗 Backend & assets
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

  // 🧠 Welkomsttekst
  const WELCOME1 = "Welkom bij ChatPro-AI 👋, ik ben Proxi.";
  const WELCOME2 = "Laat me gerust weten als je ergens hulp bij nodig hebt.";

  // ✅ Avatar & online dot
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

  // Session ID
  const SID_KEY = "proxi_session_id";
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // -------------------------------------
  // CSS
  // -------------------------------------
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

  :root {
    --vh: 100%;
    --accent1: #8b5cf6;
    --accent2: #6366f1;
    --radius: 16px;
    --bg-blur: rgba(255,255,255,0.65);
  }

  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

  /* 💬 Widget */
  #proxi-button {
    position: fixed; bottom: 25px; right: 35px;
    width: 62px; height: 62px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent1), var(--accent2));
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 99999;
    transition: transform .25s ease, box-shadow .25s ease;
  }
  #proxi-button:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(99,102,241,0.35); }
  #proxi-button img { width: 60%; height: 60%; }

  /* ✅ Online dot */
  #proxi-status-dot {
    position: absolute; bottom: 8px; right: 8px;
    width: 13px; height: 13px; border-radius: 50%;
    background: #22c55e; border: 2px solid #fff;
    box-shadow: 0 0 6px rgba(34,197,94,0.8);
  }

  /* 💬 Chat window */
  #proxi-root {
    position: fixed; right: 35px; bottom: 95px;
    width: 340px; height: 470px; display: none;
    opacity: 0; transform: translateY(15px);
    transition: all .3s ease; z-index: 99998;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  #proxi-root.open { opacity: 1; transform: translateY(0); }

  #proxi-box {
    display: flex; flex-direction: column; height: 100%;
    border-radius: var(--radius);
    box-shadow: 0 15px 40px rgba(0,0,0,.25);
    background: #fff; overflow: hidden;
  }

  /* 🍏 Frosted header */
  #proxi-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    backdrop-filter: blur(16px);
    background: var(--bg-blur);
    border-bottom: 1px solid rgba(255,255,255,0.4);
  }
  #proxi-head .left { display: flex; align-items: center; gap: 8px; }
  #proxi-head .title { font-weight: 600; font-size: 15px; color: #000; }
  #proxi-close {
    background: transparent; border: none; color: #555;
    font-size: 20px; cursor: pointer; display: none;
  }

  /* 🗨️ Messages */
  #proxi-messages {
    flex: 1; padding: 12px; overflow-y: auto;
    background: #f9fafb; -webkit-overflow-scrolling: touch;
  }
  .msg {
    max-width: 82%; padding: 8px 11px; border-radius: 14px;
    margin: 6px 0; font-size: 13px; line-height: 1.4;
    opacity: 0; animation: fadeInMsg .4s forwards;
    position: relative;
  }
  @keyframes fadeInMsg { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .bot { background: #fff; border: 1px solid #ececf0; color: #111; }
  .user { background: linear-gradient(135deg,var(--accent1),var(--accent2)); color: #fff; margin-left: auto; }

  /* 🕒 Timestamps (iMessage-style) */
  .timestamp {
    font-size: 10px; color: #9ca3af; text-align: right; margin-top: 2px;
  }

  /* 💡 Chips */
  .chip {
    display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb;
    color: #444; border-radius: 999px; padding: 5px 10px;
    margin: 3px 3px 0 0; font-size: 12px; cursor: pointer;
    transition: all .2s; user-select: none;
  }
  .chip:hover { background: #e5e7eb; }

  /* 💬 Input */
  #proxi-input {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px; border-top: 1px solid #eee; background: #fff;
  }
  #proxi-input input {
    flex: 1; padding: 10px 12px; border-radius: 10px;
    border: 1px solid #e5e7eb; outline: none; font-size: 13px;
  }
  #proxi-input button {
    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--accent1), var(--accent2));
    color: #fff; font-size: 16px;
  }

  /* 👣 Footer */
  #proxi-foot {
    text-align: center; padding: 8px; font-size: 11px; color: #9ca3af;
  }

  /* 📱 Mobile fullscreen fix */
  @media (max-width: 600px) {
    #proxi-root { right: 0; bottom: 0; width: 100vw; height: calc(var(--vh, 1vh) * 100); }
    #proxi-box { border-radius: 0; }
    #proxi-close { display: block; }
  }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // -------------------------------------
  // Elements
  // -------------------------------------
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/><div id="proxi-status-dot"></div>`;
  document.body.appendChild(btn);

  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div class="left"><div class="face">${AVATAR_SVG}<span class="dot">${DOT_SVG}</span></div>
          <div class="title">Proxi</div></div>
        <button id="proxi-close">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..."/>
        <button id="proxi-send">→</button>
      </div>
      <div id="proxi-foot">Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank" rel="noopener">ChatPro-AI</a></div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = root.querySelector("#proxi-messages");
  const $text = root.querySelector("#proxi-text");
  const $send = root.querySelector("#proxi-send");
  const $close = root.querySelector("#proxi-close");

  // -------------------------------------
  // Helper functions
  // -------------------------------------
  function isMobile() { return window.innerWidth <= 600; }

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = `${text}<div class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function addChips(items) {
    const chipBox = document.createElement("div");
    chipBox.className = "chips";
    items.forEach((x) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = x;
      chip.onclick = () => {
        chipBox.remove();
        send(x);
      };
      chipBox.appendChild(chip);
    });
    $msgs.appendChild(chipBox);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  async function send(text) {
    if (!text) return;
    addMsg(text, "user");
    $text.value = "";
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID, session_id: sid() }),
      });
      const data = await res.json();
      addMsg(data.reply || "...");
      if (Array.isArray(data.suggestions)) addChips(data.suggestions);
    } catch {
      addMsg("⚠️ De server reageert niet.");
    }
  }

  // -------------------------------------
  // Open / Close
  // -------------------------------------
  let chatVisible = false;
  function openChat() {
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) {
      addMsg(WELCOME1);
      addMsg(WELCOME2);
    }
  }

  function closeChat() {
    root.classList.remove("open");
    setTimeout(() => (root.style.display = "none"), 250);
    chatVisible = false;
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  $close.onclick = closeChat;

  // Keyboard fix (iOS/Safari)
  const vv = window.visualViewport;
  function fixKeyboard() {
    if (!vv) return;
    const kb = window.innerHeight - (vv.height + vv.offsetTop);
    if (kb > 0 && isMobile() && chatVisible) {
      root.style.transform = `translateY(-${kb}px)`;
    } else {
      root.style.transform = "translateY(0)";
    }
  }
  vv && vv.addEventListener("resize", fixKeyboard);
  vv && vv.addEventListener("scroll", fixKeyboard);
  window.addEventListener("orientationchange", () => setTimeout(fixKeyboard, 250));

  // Input send
  $send.onclick = () => send($text.value.trim());
  $text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); send($text.value.trim()); }
  });

  // Initial welcome after 2s
  setTimeout(() => {
    if (!$msgs.hasChildNodes()) {
      addMsg(WELCOME1);
      addMsg(WELCOME2);
    }
  }, 2000);
})();
