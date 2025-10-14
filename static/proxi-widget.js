(function(){
  const DEFAULT_API = "http://127.0.0.1:5050";
  const BOT_ID = "chatpro_site";
  const WELCOME = "Hoi 👋 ik ben Proxi, de virtuele assistent van ChatPro-AI. Waar kan ik je vandaag mee helpen?";

  const STATIC_BASE = /^https?:/i.test(window.location.origin) ? window.location.origin : DEFAULT_API;
  const ICON_URL = `${STATIC_BASE}/static/proxi-icon.svg?v=3`;
  const LOGO_URL = `${STATIC_BASE}/static/chatpro-mini.svg`; // nieuw mini-logo

  const SID_KEY = "proxi_session_id";
  function sid(){
    let id = localStorage.getItem(SID_KEY);
    if(!id){
      id = "sid_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  }

  // 🌈 CSS met glow en subtiele paars
  const css = `
    #proxi-button{
      position:fixed; bottom:25px; right:25px;
      width:60px; height:60px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; z-index:99999;
      background:transparent;
      box-shadow:0 0 15px rgba(139,92,246,.6), 0 0 25px rgba(14,165,233,.4);
      animation:glowPulse 2.5s infinite alternate;
    }
    @keyframes glowPulse{
      0%{box-shadow:0 0 12px rgba(139,92,246,.6), 0 0 25px rgba(14,165,233,.3)}
      100%{box-shadow:0 0 18px rgba(139,92,246,.8), 0 0 30px rgba(14,165,233,.5)}
    }
    #proxi-button img{width:60px; height:60px; border-radius:50%; transition:transform .2s}
    #proxi-button img:hover{transform:scale(1.05)}

    #proxi-popup{
      position:fixed; bottom:95px; right:25px; background:#fff;
      border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,.2);
      padding:12px 15px; font-family:Inter,system-ui,sans-serif;
      color:#111; max-width:260px; font-size:14px; display:none; z-index:99998;
      animation:fadeIn .4s ease;
    }
    @keyframes fadeIn{from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)}}

    #proxi-root{position:fixed; right:25px; bottom:100px; width:330px; height:460px; display:none; z-index:99998; font-family:Inter,system-ui,sans-serif}
    #proxi-box{display:flex; flex-direction:column; height:100%; border-radius:14px; box-shadow:0 10px 25px rgba(0,0,0,.2); background:#fff; border:1px solid #e7e7e9; overflow:hidden}
    #proxi-head{display:flex; align-items:center; gap:10px; padding:10px 14px; background:#8b5cf6; color:#fff}
    #proxi-head .title{font-weight:700; font-size:14px}
    #proxi-messages{flex:1; padding:10px; overflow:auto; background:#f9fafb}
    .msg{max-width:82%; padding:8px 11px; border-radius:10px; margin:6px 0; font-size:14px; line-height:1.4}
    .msg a{text-decoration:underline; color:#0ea5e9; word-break:break-word}
    .bot{background:#fff; border:1px solid #ececf0; color:#111}
    .user{background:#8b5cf6; color:#fff; margin-left:auto}
    #proxi-input{display:flex; border-top:1px solid #ececf0}
    #proxi-input input{flex:1; border:none; padding:10px; outline:none; font-size:14px}
    #proxi-input button{border:none; background:#0ea5e9; color:#fff; padding:0 12px; font-weight:600; cursor:pointer}
    .row{display:flex; gap:6px; flex-wrap:wrap; margin:6px 0}
    .chip{background:#eef6ff; border:1px solid #dbeafe; color:#0b4b76; border-radius:999px; padding:5px 9px; font-size:12px; cursor:pointer}
    .chip:hover{filter:brightness(.97)}

    /* Footer credit */
    #proxi-foot{
      border-top:1px solid #ececf0;
      padding:8px 10px; font-size:12px; color:#6b7280;
      display:flex; justify-content:center; align-items:center; gap:6px; background:#fff;
    }
    #proxi-foot img{width:14px; height:14px; vertical-align:middle}
    #proxi-foot a{color:#6b7280; text-decoration:none; font-weight:500}
    #proxi-foot a:hover{text-decoration:underline}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // 🟣 knop met icoon
  const btn = document.createElement("div");
  btn.id = "proxi-button";
  btn.innerHTML = `<img src="${ICON_URL}" alt="Proxi"/>`;
  document.body.appendChild(btn);

  // 💬 Welkomstballonnetje
  const popup = document.createElement("div");
  popup.id = "proxi-popup";
  popup.innerText = WELCOME;
  document.body.appendChild(popup);

  // 🧠 Chatvenster
  const root = document.createElement("div");
  root.id = "proxi-root";
  root.innerHTML = `
    <div id="proxi-box">
      <div id="proxi-head">
        <div style="width:8px;height:8px;border-radius:999px;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.15)"></div>
        <div class="title">Proxi</div>
      </div>
      <div id="proxi-messages"></div>
      <div id="proxi-foot">
        <img src="${LOGO_URL}" alt="ChatPro-AI logo"/>
        <span>Gebouwd door</span>
        <a href="https://www.chatpro-ai.nl" target="_blank" rel="noopener">ChatPro-AI</a>
      </div>
      <div id="proxi-input">
        <input id="proxi-text" type="text" placeholder="Typ hier..."/>
        <button id="proxi-send">Verstuur</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $msgs = document.getElementById("proxi-messages");
  const $text = document.getElementById("proxi-text");
  const $send = document.getElementById("proxi-send");

  function initWelcome(){ addMsg(WELCOME,"bot"); }
  function addMsg(text, who){
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = text;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
  }
  function addChips(items){
    const wrap = document.createElement("div");
    wrap.className = "row";
    items.forEach(t=>{
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = t.label;
      b.onclick = ()=>send(t.payload);
      wrap.appendChild(b);
    });
    $msgs.appendChild(wrap);
    $msgs.scrollTop = $msgs.scrollHeight;
  }

  async function send(text){
    if(!text) return;
    popup.style.display = "none";
    addMsg(text,"user");
    $text.value = "";
    try{
      const res = await fetch(`${DEFAULT_API}/chat`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ message:text, bot_id:BOT_ID, session_id:sid() })
      });
      const data = await res.json();
      addMsg(data.reply || "...","bot");
      if(Array.isArray(data.suggestions)){
        addChips(data.suggestions.map(x=>({label:x, payload:x})));
      }
    }catch(e){
      addMsg("⚠️ De server reageert niet. Controleer of de backend draait op poort 5050.","bot");
    }
  }

  setTimeout(()=> popup.style.display = "block", 2000);

  let chatVisible = false;
  btn.onclick = ()=>{
    popup.style.display = "none";
    chatVisible = !chatVisible;
    root.style.display = chatVisible ? "block" : "none";
    if(chatVisible && !$msgs.hasChildNodes()) initWelcome();
  };
  popup.onclick = ()=>{
    popup.style.display = "none";
    root.style.display = "block";
    chatVisible = true;
    if(!$msgs.hasChildNodes()) initWelcome();
  };

  $send.onclick = ()=>send($text.value.trim());
  $text.addEventListener("keydown", e=>{
    if(e.key==="Enter") send($text.value.trim());
  });
})();
