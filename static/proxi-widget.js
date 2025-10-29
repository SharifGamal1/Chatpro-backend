(function () {
  const DEFAULT_API = "https://chatpro-backend-wu17.onrender.com";
  const BOT_ID = "chatpro_site";

  const STATIC_BASE = DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`;

  const WELCOME1 = "Welkom bij ChatPro-AI 👋";
  const WELCOME2 = "Ik ben Proxi — laat me gerust weten als je ergens hulp bij nodig hebt.";
  const OPTIONS = [
    "Wat kost het en hoe snel ben ik live?",
    "Prijzen starten vanaf €225/mnd — vertel me meer",
    "Kan ik een demo krijgen?",
    "Wat doet ChatPro-AI precies?",
  ];

  // Fonts
  const font = document.createElement("link");
  font.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap";
  font.rel = "stylesheet";
  document.head.appendChild(font);

  // Frosted glass styling
  const css = `
    :root {
      --proxi-safe: env(safe-area-inset-bottom);
      --vh: 100%;
    }

    #proxi-button {
      position: fixed; bottom: 25px; right: 35px;
      width: 62px; height: 62px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 99999;
      background: #8b5cf6;
      box-shadow: 0 4px 18px rgba(0,0,0,0.15);
      transition: transform .25s ease;
    }
    #proxi-button:hover { transform: scale(1.05); }
    #proxi-button img { width: 60px; height: 60px; border-radius: 50%; }

    @keyframes nudge {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      75% { transform: rotate(-5deg); }
    }

    /* Chat container */
    #proxi-root {
      position: fixed; right: 35px; bottom: 95px;
      width: 360px; height: 520px;
      display: none; opacity: 0; transform: translateY(20px);
      transition: all .3s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
      z-index: 99998;
    }
    #proxi-root.open { display: block; opacity: 1; transform: translateY(0); }

    #proxi-box {
      display: flex; flex-direction: column; height: 100%;
      border-radius: 16px; overflow: hidden;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.4);
    }

    #proxi-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px;
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #111;
      border-bottom: 1px solid rgba(255,255,255,0.5);
    }
    #proxi-head .title { font-weight: 600; font-size: 15px; }
    #proxi-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #555; }

    #proxi-messages {
      flex: 1; padding: 10px; overflow-y: auto;
      display: flex; flex-direction: column;
    }

    .msg {
      max-width: 80%; border-radius: 12px; padding: 10px 14px;
      margin: 6px 0; font-size: 14px; line-height: 1.4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .msg.bot { background: rgba(255,255,255,0.8); color: #111; border: 1px solid rgba(0,0,0,0.05); }
    .msg.user { background: #8b5cf6; color: #fff; align-self: flex-end; }
    .time { font-size: 11px; color: #888; margin-top: 3px; text-align: right; }

    .chip {
      display: inline-block;
      background: rgba(139,92,246,0.08);
      border: 1px solid rgba(139,92,246,0.15);
      color: #5b21b6;
      border-radius: 999px;
      padding: 6px 12px;
      margin: 4px 6px 0 0;
      font-size: 13px;
      cursor: pointer;
      transition: background .2s;
    }
    .chip:hover { background: rgba(139,92,246,0.15); }

    #proxi-input {
      display: flex; align-items: center; gap: 8px;
      padding: 10px; border-top: 1px solid rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(12px);
    }
    #proxi-input input {
      flex: 1; border: none; border-radius: 12px;
      padding: 12px; font-size: 14px;
      outline: none; background: rgba(255,255,255,0.85);
    }
    #proxi-input button {
      background: linear-gradient(135deg,#8b5cf6,#6366f1);
      border: none; color: white; padding: 12px 14px;
      border-radius: 12px; cursor: pointer;
    }

    #proxi-foot {
      text-align: center; font-size: 12px; color: #666;
      padding: 6px 0 10px;
    }

    /* Mobile fullscreen fix (Safari-safe) */
    @media (max-width: 600px) {
      #proxi-root {
        width: 100vw;
        height: calc(var(--vh, 1vh) * 100);
        right: 0; bottom: 0;
        border-radius: 0;
      }
      #proxi-box { border-radius: 0; }
      #proxi-head { padding-top: calc(env(safe-area-inset-top) + 10px); }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // Fix Safari vh
  const fixVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  fixVH();
  window.addEventListener("resize", fixVH);

  // Create elements
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/>`;
  document.body.appendChild(btn);

  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div class="title">Proxi</div>
        <button id="proxi-close">×</button>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-input">
        <input id="proxi-text" placeholder="Typ hier..."/>
        <button id="proxi-send">➜</button>
      </div>
      <div id="proxi-foot">Gebouwd door <a href="https://www.chatpro-ai.nl" target="_blank">ChatPro-AI</a></div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");
  const $close = document.getElementById("proxi-close");

  // Add messages + timestamp
  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = text;
    const time = document.createElement("div");
    time.className = "time";
    const t = new Date();
    time.textContent = `${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}`;
    div.appendChild(time);
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  // Add quick options
  function addChips(options) {
    const wrap = document.createElement("div");
    options.forEach((opt) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = opt;
      chip.onclick = () => send(opt);
      wrap.appendChild(chip);
    });
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  // Send
  async function send(text) {
    if (!text.trim()) return;
    addMsg(text, "user");
    $text.value = "";
    try {
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, bot_id: BOT_ID }),
      });
      const data = await res.json();
      addMsg(data.reply || "Ik denk even na...", "bot");
    } catch {
      addMsg("⚠️ Er ging iets mis. Probeer later opnieuw.", "bot");
    }
  }

  $send.onclick = () => send($text.value);
  $text.addEventListener("keydown", (e) => e.key === "Enter" && send($text.value));

  // Open / Close
  let open = false;
  btn.onclick = () => {
    open = !open;
    root.classList.toggle("open", open);
    if (open && !$msgs.childElementCount) {
      setTimeout(() => addMsg(WELCOME1, "bot"), 400);
      setTimeout(() => addMsg(WELCOME2, "bot"), 1000);
      setTimeout(() => addChips(OPTIONS), 1600);
    }
  };
  $close.onclick = () => root.classList.remove("open");

  // Nudge
  setTimeout(() => (btn.style.animation = "nudge 0.3s ease 3"), 45000);
})();
