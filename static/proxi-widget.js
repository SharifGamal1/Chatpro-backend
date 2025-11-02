(function () {
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";
  const WELCOME = "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";
  const SID_KEY = "proxi_session_id";
  const STATIC_BASE = DEFAULT_API;

  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // ✅ voorkomt iOS zoom op invoerveld
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(meta);

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

    /* ✅ NIEUWE LUXE BUTTON STIJL */
    #proxi-button {
      position: fixed;
      bottom: 25px;
      right: 30px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(145deg, #8b5cf6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 99999;
      transition: all 0.25s ease;
      box-shadow: 0 6px 18px rgba(99,102,241,0.35),
                  inset 0 1px 2px rgba(255,255,255,0.4);
      backdrop-filter: blur(12px) saturate(180%);
    }
    #proxi-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 22px rgba(99,102,241,0.45);
    }
    #proxi-button svg {
      width: 28px;
      height: 28px;
      stroke: #fff;
      stroke-width: 1.8;
      fill: none;
      filter: drop-shadow(0 0 2px rgba(255,255,255,0.4));
    }
    #proxi-status-dot {
      position: absolute;
      bottom: 7px;
      right: 7px;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 6px rgba(34,197,94,0.7);
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
      z-index: 99998; transition: transform .3s ease;
      will-change: transform;
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
      transition: padding-bottom .2s ease;
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
      position: sticky; bottom:0;
      transition: bottom .25s ease;
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
      transform:none;
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

  // Elements
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V5z"/>
      <circle cx="9" cy="10" r="1.2"/>
      <circle cx="12" cy="10" r="1.2"/>
      <circle cx="15" cy="10" r="1.2"/>
    </svg>
    <div id="proxi-status-dot"></div>
  `;
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
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

  let chatVisible = false;
  const isMobile = () => window.innerWidth <= 600;
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

  // keyboard fix
  const vv = window.visualViewport;
  function lift() {
    if (!vv || !chatVisible || !isMobile()) return;
    const kb = window.innerHeight - (vv.height + vv.offsetTop);
    if (kb > 0) root.style.transform = `translateY(-${kb}px)`;
    else root.style.transform = "translateY(0)";
  }
  vv && vv.addEventListener("resize", lift);
  vv && vv.addEventListener("scroll", lift);
  $text.addEventListener("focus", lift);
  $text.addEventListener("blur", () => root.style.transform = "translateY(0)");
  window.addEventListener("orientationchange", () => setTimeout(lift, 250));

  if (!localStorage.getItem("proxi_popup_closed")) setTimeout(() => (popup.style.display = "block"), 2000);
})();
