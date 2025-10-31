(function () {
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME = "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";
  const SID_KEY = "proxi_session_id";
  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;

  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  const css = `
    :root {
      --brand: #8b5cf6;
      --brand2: #6366f1;
      --glass: rgba(255,255,255,0.55);
      --border: rgba(255,255,255,0.25);
      --text: #111;
      --safe: env(safe-area-inset-bottom);
    }

    * { box-sizing: border-box; font-family: "Plus Jakarta Sans", -apple-system, system-ui, sans-serif; }

    #proxi-button {
      position: fixed; bottom: 25px; right: 30px;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg,var(--brand),var(--brand2));
      box-shadow: 0 8px 20px rgba(99,102,241,.4);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 99999; transition: transform .2s ease;
    }
    #proxi-button:hover { transform: scale(1.06); }
    #proxi-button img { width: 56px; height: 56px; border-radius: 50%; }
    #proxi-status-dot {
      position: absolute; bottom: 5px; right: 5px;
      width: 11px; height: 11px;
      background: #22c55e; border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 6px rgba(34,197,94,.7);
    }

    #proxi-popup {
      position: fixed; bottom: 95px; right: 30px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(0,0,0,.15);
      padding: 10px 14px 12px; border-radius: 14px;
      color: var(--text); font-size: 13.5px; max-width: 260px;
      display: none; z-index: 99998; animation: fadeIn .4s ease;
      position: fixed;
    }
    #proxi-popup .head {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:6px;
    }
    #proxi-popup .name { font-weight:600; font-size:13px; color:#111; }
    #proxi-popup .close {
      border:none; background:none; font-size:16px;
      line-height:1; cursor:pointer; color:#555;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }

    #proxi-root {
      position: fixed; right: 30px; bottom: 95px;
      width: 340px; height: 470px;
      display: none; opacity: 0; transform: translateY(10px);
      z-index: 99998; transition: all .25s ease;
    }
    #proxi-root.open { opacity: 1; transform: translateY(0); }

    #proxi-box {
      display: flex; flex-direction: column; height: 100%;
      background: rgba(255,255,255,0.65);
      border: 1px solid var(--border);
      border-radius: 18px;
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 10px 30px rgba(0,0,0,.2);
      overflow: hidden;
    }

    #proxi-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: rgba(255,255,255,0.35);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px);
    }
    #proxi-head .left { display: flex; align-items: center; gap: 8px; }
    #proxi-head .title { font-weight: 600; font-size: 13.5px; color: #111; }
    #proxi-close {
      background: transparent; border: none; font-size: 20px;
      color: #444; cursor: pointer; display: none;
    }
    @media (max-width:600px) { #proxi-close { display:block; } }

    #proxi-messages {
      flex:1; padding:12px; overflow:auto;
      -webkit-overflow-scrolling:touch;
    }
    .msg {
      max-width:82%; padding:8px 11px; border-radius:12px;
      margin:6px 0; font-size:13.5px; line-height:1.45;
    }
    .bot { background: rgba(255,255,255,0.7); border: 1px solid var(--border); color: #111; }
    .user { background: linear-gradient(135deg,var(--brand),var(--brand2)); color:#fff; margin-left:auto; }

    #proxi-input {
      display:flex; align-items:center; gap:8px;
      padding:8px 10px calc(10px + var(--safe));
      background: rgba(255,255,255,0.4);
      border-top: 1px solid var(--border);
      backdrop-filter: blur(12px);
      position:sticky; bottom:0;
    }
    #proxi-text {
      flex:1; border:1px solid rgba(0,0,0,0.08);
      border-radius:12px; padding:10px 12px;
      background:rgba(255,255,255,0.85);
      font-size:13.5px; outline:none;
    }
    #proxi-send {
      border:none; border-radius:12px;
      background:linear-gradient(135deg,var(--brand),var(--brand2));
      color:#fff; padding:10px 13px;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
    }
    #proxi-send svg {
      width:15px; height:15px; fill:#fff;
      transform: rotate(-45deg);
    }

    #proxi-foot {
      border-top: 1px solid var(--border);
      padding: 6px 10px; font-size: 11.5px;
      color: rgba(31,41,55,0.6);
      text-align: center; background: rgba(255,255,255,0.4);
      backdrop-filter: blur(10px);
    }

    @media (max-width:600px){
      #proxi-root {
        right:0; bottom:0; width:100vw;
        height:calc(var(--vh,1vh)*100);
        border-radius:0;
      }
      #proxi-box { border-radius:0; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // Dynamic height fix
  function fixVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  fixVH();
  window.addEventListener("resize", fixVH);
  window.addEventListener("orientationchange", fixVH);

  // Elements
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/><div id="proxi-status-dot"></div>`;
  document.body.appendChild(btn);

  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.innerHTML = `
    <div class="head">
      <div class="name">Proxi</div>
      <button class="close">×</button>
    </div>
    <div class="body">${WELCOME}</div>`;
  document.body.appendChild(popup);

  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div class="left"><div class="title">Proxi</div></div>
        <button id="proxi-close">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier...">
        <button id="proxi-send" title="Verstuur">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 21L23 12 2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="proxi-foot">Gebouwd door ChatPro-AI</div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");
  const $popupClose = popup.querySelector(".close");

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = text;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  async function send(text) {
    const val = typeof text === "string" ? text : $text.value.trim();
    if (!val) return;
    popup.style.display = "none";
    addMsg(val, "user");
    $text.value = "";
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: val, bot_id: BOT_ID, session_id: sid() }),
      });
      const data = await res.json();
      addMsg(data.reply || "...", "bot");
    } catch {
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  // Open / Close
  let chatVisible = false;
  function isMobile() { return window.innerWidth <= 600; }

  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;
    if (isMobile()) btn.style.display = "none";
    if (!$msgs.hasChildNodes()) addMsg(WELCOME, "bot");
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
  $popupClose.onclick = () => { popup.style.display = "none"; localStorage.setItem("proxi_popup_closed", "1"); };
  $send.onclick = send;
  $text.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } });

  // Keyboard lift fix (iOS/Android)
  const vv = window.visualViewport;
  function lift() {
    if (!vv) return;
    const kb = window.innerHeight - (vv.height + vv.offsetTop);
    if (kb > 0 && isMobile() && chatVisible)
      root.style.transform = `translateY(-${kb}px)`;
    else if (chatVisible)
      root.style.transform = `translateY(0)`;
  }
  vv && vv.addEventListener("resize", lift);
  vv && vv.addEventListener("scroll", lift);
  window.addEventListener("orientationchange", () => setTimeout(lift, 250));

  // Show welcome popup only if not closed before
  if (!localStorage.getItem("proxi_popup_closed")) {
    setTimeout(() => (popup.style.display = "block"), 2000);
  }
})();
