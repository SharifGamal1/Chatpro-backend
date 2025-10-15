(function () {
  // ---- Config
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME =
    "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";

  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=4`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

  // Kleine inline-iconen voor header
  const AVATAR_SVG =
    `<svg viewBox="0 0 64 64" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#fff"/>
      <circle cx="32" cy="26" r="10" fill="#fde68a"/>
      <path d="M16 50a16 16 0 0 1 32 0" fill="#a78bfa"/>
    </svg>`;

  // ---- Session
  const SID_KEY = "proxi_session_id";
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // ---- CSS
  const css = `
    :root { --proxi-safe: env(safe-area-inset-bottom); }

    /* launcher */
    #proxi-button{
      position:fixed; bottom:25px; right:25px;
      width:60px; height:60px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; z-index:99997; background:transparent;
      box-shadow:0 0 15px rgba(139,92,246,.6), 0 0 25px rgba(14,165,233,.4);
      animation:glowPulse 2.5s infinite alternate;
    }
    @keyframes glowPulse{
      0%{box-shadow:0 0 12px rgba(139,92,246,.6), 0 0 25px rgba(14,165,233,.3)}
      100%{box-shadow:0 0 18px rgba(139,92,246,.8), 0 0 30px rgba(14,165,233,.5)}
    }
    #proxi-button img{width:60px; height:60px; border-radius:50%; transition:transform .2s}
    #proxi-button img:hover{transform:scale(1.05)}

    /* welcome bubble */
    #proxi-popup{
      position:fixed; bottom:95px; right:25px; background:#fff;
      border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,.2);
      padding:12px 15px; font-family:Inter,system-ui,sans-serif;
      color:#111; max-width:260px; font-size:14px; display:none; z-index:99996;
      animation:fadeIn .4s ease;
    }
    @keyframes fadeIn{from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)}}

    /* chat root */
    #proxi-root{
      position:fixed; right:25px; bottom:100px;
      width:330px; height:460px; display:none;
      z-index:99998; font-family:Inter,system-ui,sans-serif;
      transition:transform .25s ease;
      will-change: transform;
    }

    /* desktop: schuif chat iets naar links zodat launcher nooit overlapt */
    @media (min-width: 601px){
      #proxi-root{ right:115px; } /* 60px knop + 30px marge + 25px gap */
    }

    #proxi-box{
      display:flex; flex-direction:column; height:100%;
      border-radius:14px; box-shadow:0 10px 25px rgba(0,0,0,.2);
      background:#fff; border:1px solid #e7e7e9; overflow:hidden;
    }

    #proxi-head{
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      padding:10px 12px; background:#8b5cf6; color:#fff;
    }
    #proxi-head-left{display:flex; align-items:center; gap:8px}
    #proxi-head .title{font-weight:700; font-size:14px}
    #proxi-close{
      border:none; background:transparent; color:#fff; font-size:20px;
      line-height:1; cursor:pointer; padding:2px 6px;
    }

    #proxi-messages{
      flex:1; padding:10px; overflow:auto; background:#f9fafb;
      -webkit-overflow-scrolling: touch;
    }
    .msg{max-width:82%; padding:8px 11px; border-radius:10px; margin:6px 0; font-size:14px; line-height:1.4}
    .msg a{text-decoration:underline; color:#0ea5e9; word-break:break-word}
    .bot{background:#fff; border:1px solid #ececf0; color:#111}
    .user{background:#8b5cf6; color:#fff; margin-left:auto}

    #proxi-input{
      display:flex; gap:8px; align-items:center;
      border-top:1px solid #ececf0; background:#fff;
      padding:8px 10px calc(8px + var(--proxi-safe));
      position:sticky; bottom:0;
    }
    #proxi-input input{
      flex:1; border:1px solid #e5e7eb; padding:10px 12px; outline:none; font-size:14px; min-width:0;
      border-radius:10px; background:#fff;
    }
    #proxi-input button{
      border:none; background:#0ea5e9; color:#fff; padding:10px 14px; font-weight:700; cursor:pointer; border-radius:10px;
    }

    #proxi-foot{
      border-top:1px solid #ececf0;
      padding:8px 10px; font-size:12px; color:#6b7280;
      display:flex; justify-content:center; align-items:center; gap:6px; background:#fff;
    }
    #proxi-foot img{width:14px; height:14px; vertical-align:middle}
    #proxi-foot a{color:#6b7280; text-decoration:none; font-weight:500}
    #proxi-foot a:hover{text-decoration:underline}

    /* mobiel: fullscreen, launcher verbergen bij open */
    @media (max-width:600px){
      #proxi-root{
        right:0; bottom:0; width:100vw; height:100vh;
        border-radius:0; transform:translateY(0);
      }
      #proxi-box{border-radius:0}
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- Launcher
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/>`;
  document.body.appendChild(btn);

  // ---- Welcome bubble
  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.innerText = WELCOME;
  document.body.appendChild(popup);

  // ---- Chat window
  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div id="proxi-head-left">
          ${AVATAR_SVG}
          <div class="title">Proxi</div>
        </div>
        <button id="proxi-close" aria-label="Sluiten">×</button>
      </div>

      <div id="proxi-messages"></div>

      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..."/>
        <button id="proxi-send">Verstuur</button>
      </div>

      <div id="proxi-foot">
        <img src="${LOGO_URL}" alt="ChatPro-AI logo"/>
        <span>Gebouwd door</span>
        <a href="https://www.chatpro-ai.nl" target="_blank" rel="noopener">ChatPro-AI</a>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  // ---- Helpers
  function initWelcome() { addMsg(WELCOME, "bot"); }
  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = text;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function addChips(items) {
    const wrap = document.createElement("div");
    wrap.className = "row";
    items.forEach(t => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = t.label;
      b.onclick = () => send(t.payload);
      wrap.appendChild(b);
    });
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  // ---- Send
  async function send(text) {
    if (!text) return;
    popup.style.display = "none";
    addMsg(text, "user");
    $text.value = "";
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID, session_id: sid() })
      });
      const data = await res.json();
      addMsg(data.reply || "...", "bot");
      if (Array.isArray(data.suggestions)) {
        addChips(data.suggestions.map(x => ({ label: x, payload: x })));
      }
    } catch (e) {
      addMsg("⚠️ De server reageert niet. Controleer of de backend draait op poort 5050.", "bot");
    }
  }

  // ---- Open/Close behaviour
  setTimeout(() => (popup.style.display = "block"), 2000);

  let chatVisible = false;
  function isMobile() { return window.innerWidth <= 600; }

  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    // desktop: launcher zichtbaar; mobiel: verbergen
    btn.style.display = isMobile() ? "none" : "flex";
    document.documentElement.style.overflow = isMobile() ? "hidden" : "";
    chatVisible = true;
    if (!$msgs.hasChildNodes()) initWelcome();
  }
  function closeChat() {
    root.style.display = "none";
    btn.style.display = "flex";
    document.documentElement.style.overflow = "";
    chatVisible = false;
    root.style.transform = "translateY(0)";
  }

  // desktop: launcher toggelt open/close
  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  // welkomstballon opent
  popup.onclick = openChat;
  // header X sluit altijd
  $close.onclick = closeChat;

  // ---- Input events
  $send.onclick = () => send($text.value.trim());
  $text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send($text.value.trim());
    }
  });

  // ---- Mobile keyboard lift (VisualViewport)
  const vv = window.visualViewport;
  function liftWithKeyboard() {
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
  window.addEventListener("orientationchange", () => setTimeout(liftWithKeyboard, 250));
})();
