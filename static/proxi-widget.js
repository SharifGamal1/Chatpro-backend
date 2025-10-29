(function () {
  // ---------- Backend & assets ----------
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";

  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

  // Welkom
  const WELCOME1 = "Welkom bij ChatPro-AI 👋, ik ben Proxi.";
  const WELCOME2 = "Laat me gerust weten als je ergens hulp bij nodig hebt.";

  // Onboarding chips (subtiel, professioneel)
  const START_CHIPS = [
    "Wat kost ChatPro-AI en hoe snel ben ik live?",
    "Kan ik een demo van de chatbot krijgen?",
    "Hoe werkt de integratie met mijn website?",
    "Kan ik direct contact opnemen met een expert?"
  ];

  // Avatar & dot
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

  // ---------- Session ----------
  const SID_KEY = "proxi_session_id";
  function sid() {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // ---------- CSS ----------
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

    :root{
      --vh:100%;
      --accent1:#8b5cf6;
      --accent2:#6366f1;
      --radius:16px;
      --glass:rgba(255,255,255,0.6);
      --glass-strong:rgba(255,255,255,0.75);
      --shadow:0 18px 45px rgba(2,6,23,.15);
    }
    body{ font-family:'Plus Jakarta Sans',system-ui,sans-serif; }

    /* Floating button */
    #proxi-button{
      position:fixed; bottom:25px; right:35px;
      width:64px; height:64px; border-radius:50%;
      background:linear-gradient(135deg,var(--accent1),var(--accent2));
      box-shadow:0 8px 20px rgba(0,0,0,.15);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; z-index:99999;
      transition:transform .25s ease, box-shadow .25s ease;
    }
    #proxi-button:hover{ transform:scale(1.05); box-shadow:0 12px 28px rgba(99,102,241,.35); }
    #proxi-button img{ width:60%; height:60%; border-radius:50%; }
    #proxi-status-dot{
      position:absolute; bottom:8px; right:8px; width:13px; height:13px; border-radius:50%;
      background:#22c55e; border:2px solid #fff; box-shadow:0 0 6px rgba(34,197,94,.8);
    }

    /* Welcome bubble */
    #proxi-popup{
      position:fixed; bottom:95px; right:35px;
      background:#fff; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,.15);
      padding:14px 16px; color:#111; max-width:270px; font-size:14px;
      display:none; z-index:99998; animation:fadeIn .5s ease;
    }
    @keyframes fadeIn{ from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }

    /* Chat root */
    #proxi-root{
      position:fixed; right:35px; bottom:95px;
      width:360px; height:520px; display:none; opacity:0; transform:translateY(15px);
      transition:all .3s ease; z-index:99998;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    #proxi-root.open{ opacity:1; transform:translateY(0); }

    /* Chat box with subtle frosted edge */
    #proxi-box{
      display:flex; flex-direction:column; height:100%;
      border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow);
      background:linear-gradient(180deg,var(--glass-strong),rgba(255,255,255,.95));
      backdrop-filter:blur(14px);
      border:1px solid rgba(255,255,255,.55);
    }

    /* Header — frosted glass, prevent page text bleed-through with solid tint */
    #proxi-head{
      display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:12px 16px;
      background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.86));
      backdrop-filter:blur(18px);
      border-bottom:1px solid rgba(0,0,0,.06);
      color:#0b0f19;
    }
    #proxi-head .left{ display:flex; align-items:center; gap:8px; }
    #proxi-head .title{ font-weight:600; font-size:15px; }
    #proxi-close{ background:transparent; border:none; color:#4b5563; font-size:20px; cursor:pointer; }

    /* Messages */
    #proxi-messages{
      flex:1; padding:14px; overflow-y:auto; background:transparent;
      -webkit-overflow-scrolling:touch;
    }
    .msg{
      max-width:82%; padding:10px 14px; border-radius:14px; margin:6px 0;
      font-size:14px; line-height:1.5; opacity:0; animation:msgPop .35s forwards;
      position:relative;
    }
    @keyframes msgPop{ from{transform:translateY(6px); opacity:0} to{transform:translateY(0); opacity:1} }
    .bot{ background:rgba(255,255,255,.8); border:1px solid rgba(0,0,0,.06); color:#0b0f19; }
    .user{ background:#fff; border:1px solid rgba(0,0,0,.08); box-shadow:0 1px 3px rgba(0,0,0,.06); margin-left:auto; }
    .stamp{
      display:block; font-size:11px; color:#9ca3af; margin-top:4px; user-select:none;
    }

    /* Chips (subtiel) */
    .chips{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 4px 0; }
    .chip{
      border-radius:999px; padding:8px 12px; font-size:13px; cursor:pointer; user-select:none;
      background:linear-gradient(135deg, rgba(139,92,246,.10), rgba(99,102,241,.10));
      border:1px solid rgba(139,92,246,.25);
      transition:transform .15s ease, background .2s ease, border-color .2s ease;
    }
    .chip:hover{ transform:translateY(-1px); background:linear-gradient(135deg, rgba(139,92,246,.16), rgba(99,102,241,.16)); border-color:rgba(139,92,246,.35); }

    /* Typing indicator */
    .typing{ display:inline-flex; gap:4px; margin:8px 0; align-items:center; }
    .typing span{ width:6px; height:6px; background:#9ca3af; border-radius:50%; animation:blink 1.4s infinite both; }
    .typing span:nth-child(2){ animation-delay:.2s } .typing span:nth-child(3){ animation-delay:.4s }
    @keyframes blink{ 0%,80%,100%{opacity:.3; transform:scale(1)} 40%{opacity:1; transform:scale(1.28)} }

    /* Input */
    #proxi-input{ display:flex; align-items:center; gap:8px; padding:10px 12px; border-top:1px solid rgba(0,0,0,.06); background:rgba(255,255,255,.9); }
    #proxi-input input{
      flex:1; padding:11px 12px; border-radius:12px; border:1px solid rgba(0,0,0,.1); outline:none; font-size:14px; background:#fff;
    }
    #proxi-input button{
      width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,var(--accent1),var(--accent2)); color:#fff; font-size:16px;
      display:flex; align-items:center; justify-content:center; transition:transform .2s ease, box-shadow .2s ease;
    }
    #proxi-input button:hover{ transform:scale(1.05); box-shadow:0 6px 14px rgba(99,102,241,.35); }

    /* Footer */
    #proxi-foot{ text-align:center; padding:8px; font-size:12px; color:#9ca3af; background:transparent; }
    #proxi-foot a{ color:#9ca3af; text-decoration:none; }

    /* Mobile: fullscreen, proper 100vh on iOS */
    @media (max-width:600px){
      #proxi-root{
        right:0; bottom:0; width:100vw; height:calc(var(--vh, 1vh) * 100);
      }
      #proxi-box{ border-radius:0; }
    }

    /* Nudge */
    @keyframes nudge{ 0%,100%{transform:rotate(0)} 20%{transform:rotate(-5deg)} 40%{transform:rotate(5deg)} 60%{transform:rotate(-3deg)} 80%{transform:rotate(3deg)} }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Elements ----------
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
        <button id="proxi-close" title="Sluiten">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..." />
        <button id="proxi-send">→</button>
      </div>
      <div id="proxi-foot">
        Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank" rel="noopener">ChatPro-AI</a>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  // ---------- Helpers ----------
  const isMobile = () => window.innerWidth <= 600;

  function timeStamp() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function addMsg(html, who) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (who || "bot");
    wrap.innerHTML = `${html}<span class="stamp">${timeStamp()}</span>`;
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  function addChips(items) {
    const box = document.createElement("div");
    box.className = "chips";
    items.forEach((label) => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = label;
      c.onclick = () => {
        // bij klik: als er nog een typing staat weghalen
        const t = document.getElementById("typing"); if (t) t.remove();
        send(label);
        box.remove();
      };
      box.appendChild(c);
    });
    $msgs.appendChild(box);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  // Typing indicator
  function showTyping() {
    const div = document.createElement("div");
    div.className = "typing";
    div.id = "typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  // Welcome (eenmalig per sessie in de view)
  let bootstrapped = false;
  function bootstrapConversation() {
    if (bootstrapped) return;
    addMsg(WELCOME1, "bot");
    addMsg(WELCOME2, "bot");
    addChips(START_CHIPS);
    bootstrapped = true;
  }

  // ---------- API send ----------
  async function send(text) {
    if (!text) return;
    popup.style.display = "none";
    addMsg(text, "user");
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
      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        addChips(data.suggestions);
      }
    } catch (e) {
      hideTyping();
      addMsg("⚠️ De server reageert niet.", "bot");
    }
  }

  // ---------- Open / Close ----------
  let chatVisible = false;

  // iOS/Safari 100vh fix
  function setVH() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${h / 100}px`);
  }
  setVH();
  window.addEventListener("resize", setVH);
  window.visualViewport && window.visualViewport.addEventListener("resize", setVH);
  window.visualViewport && window.visualViewport.addEventListener("scroll", setVH);
  window.addEventListener("orientationchange", () => setTimeout(setVH, 250));

  function openChat() {
    popup.style.display = "none";
    root.style.display = "block";
    requestAnimationFrame(() => root.classList.add("open"));
    chatVisible = true;

    // mobiel: verberg de widget zodat hij niet over input/knoppen zit
    if (isMobile()) btn.style.display = "none";

    if (!bootstrapped) bootstrapConversation();
  }

  function closeChat() {
    root.classList.remove("open");
    setTimeout(() => (root.style.display = "none"), 250);
    chatVisible = false;

    // mobiel: toon widget terug
    if (isMobile()) btn.style.display = "flex";
  }

  btn.onclick = () => (chatVisible ? closeChat() : openChat());
  $close.onclick = closeChat;
  popup.onclick = openChat;

  // ---------- Send events ----------
  $send.onclick = () => send($text.value.trim());
  $text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send($text.value.trim());
    }
  });

  // ---------- Welcome popup ----------
  setTimeout(() => (popup.style.display = "block"), 2000);

  // ---------- Nudge na 45s ----------
  let nudgeTimer = setTimeout(() => {
    btn.style.animation = "nudge 1s ease";
    setTimeout(() => (btn.style.animation = ""), 1200);
  }, 45000);
})();
