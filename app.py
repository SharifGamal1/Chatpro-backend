from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os, json, re, smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import openai
from dotenv import load_dotenv
from markupsafe import Markup

# -------------------------------------------------
# .env laden
# -------------------------------------------------
load_dotenv()

# -------------------------------------------------
# Flask-config
# -------------------------------------------------
app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app, resources={r"/*": {"origins": "*"}})

ROOT = os.path.dirname(__file__)
FAQ_PATH = os.path.join(ROOT, 'data', 'faq_chatpro.json')

# -------------------------------------------------
# SMTP-config
# -------------------------------------------------
SMTP_SERVER = os.getenv("SMTP_SERVER", "mail.zxcs.nl")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "info@chatpro-ai.nl")
SMTP_PASS = os.getenv("SMTP_PASS", "")

# -------------------------------------------------
# OpenAI-config (compatibel met openai==1.30.1)
# -------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY
else:
    openai.api_key = None

# -------------------------------------------------
# Data laden
# -------------------------------------------------
def load_data():
    if os.path.exists(FAQ_PATH):
        with open(FAQ_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

DATA = load_data()

SESSIONS = {}
LEADS = []
RES_DEMO = []  # gereserveerd voor later

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def norm(txt: str) -> str:
    return re.sub(r"\s+", " ", (txt or "").strip().lower())

def reply(text, suggestions=None):
    """Retourneer HTML-compatibele antwoorden (links klikbaar)."""
    out = {"reply": Markup(text)}  # <a> toegestaan
    if suggestions:
        out["suggestions"] = suggestions
    resp = make_response(jsonify(out))
    resp.headers["Content-Type"] = "application/json; charset=utf-8"
    return resp

def send_email(to, subject, body, reply_to=None):
    """Verstuur e-mail via SMTP SSL (poort 465)."""
    if not (SMTP_SERVER and SMTP_USER and SMTP_PASS):
        print("⚠️ SMTP niet geconfigureerd: e-mail is overgeslagen.")
        return
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = to
        msg["Subject"] = subject
        if reply_to:
            msg.add_header("Reply-To", reply_to)
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"✅ E-mail verzonden naar {to}")
    except Exception as e:
        print(f"❌ Fout bij verzenden van e-mail: {e}")

DEFAULT_SUGGESTIONS = [
    "Wat doet Chatpro-AI?",
    "Wat kost het?",
    "Voor wie is het geschikt?",
    "Hoe werkt het?",
    "Tijdelijke inzet",
    "Ik wil een demo aanvragen"
]

SITE_BASE = "https://www.chatpro-ai.nl"

# -------------------------------------------------
# FAQ-antwoorden
# -------------------------------------------------
def ans_intro():
    m = DATA.get("intro", {})
    metrics = m.get("metrics", {})
    return (
        f"{m.get('tagline','')}<br><br>"
        f"⏱️ Reactietijd: {metrics.get('reactietijd','—')} | "
        f"😊 Tevredenheid: {metrics.get('tevredenheid','—')} | "
        f"💸 Kostenreductie: {metrics.get('kostenreductie','—')}<br><br>"
        f'<a href="{SITE_BASE}/" target="_blank">Meer weten</a>'
    )

def ans_pricing():
    p = DATA.get("pricing", {})
    b, pr, e = p.get("basic", {}), p.get("pro", {}), p.get("enterprise", {})
    return (
        "Onze pakketten:<br>"
        f"💡 Basic ({b.get('prijs_per_maand','—')}) — ideaal voor kleine bedrijven.<br>"
        f"⚡ Pro ({pr.get('prijs_per_maand','—')}) — meest gekozen, met leadgeneratie & koppelingen.<br>"
        f"🏢 Enterprise ({e.get('prijs','Maatwerk')}) — voor grotere organisaties met integraties.<br><br>"
        f'<a href="{SITE_BASE}/prijzen" target="_blank">Bekijk prijzen & vergelijking</a>'
    )

def ans_how():
    return (
        "Je plaatst één stukje code op je site. Binnen 48 uur draait de bot live met jouw stijl, FAQ en eventuele agendakoppeling.<br>"
        f'<a href="{SITE_BASE}/onboarding" target="_blank">Uitleg & onboarding</a>'
    )

def ans_why():
    w = DATA.get("why_choose", [])
    korte = w[:3] if len(w) >= 3 else w
    return (
        "Waarom Chatpro-AI?<br>- " + "<br>- ".join(korte) +
        f'<br><br><a href="{SITE_BASE}/" target="_blank">Meer voordelen</a>'
    )

def ans_temp():
    t = DATA.get("temporary_use", {})
    ew, c2 = t.get("event_week", {}), t.get("campaign_2_weeks", {})
    return (
        "📅 Tijdelijke inzet — ideaal voor beurzen of campagnes.<br>"
        f"• {ew.get('naam','Event Week')} — {ew.get('prijs','—')}<br>"
        f"• {c2.get('naam','Campaign 2 Weeks')} — {c2.get('prijs','—')}<br><br>"
        f'<a href="{SITE_BASE}/tijdelijk" target="_blank">Alle opties bekijken</a>'
    )

def ans_contact():
    c = DATA.get("contact", {})
    return (
        f"📞 Contact opnemen:<br>"
        f'• E-mail: <a href="mailto:{c.get("email","")}">{c.get("email","—")}</a><br>'
        f'• Tel: <a href="tel:{c.get("telefoon","")}">{c.get("telefoon","—")}</a><br>'
        f"• {c.get('reactietijd','')}<br><br>"
        f'<a href="{SITE_BASE}/contact" target="_blank">Contactpagina</a>'
    )

def ans_sectors():
    s = DATA.get("sectors", {})
    return (
        f"{s.get('samenvatting','')}<br>"
        "📍 MKB: kappers, restaurants, garages, coaches, vastgoed, fitness, zorg...<br>"
        "🏢 Grotere organisaties: SaaS, agencies, onderwijs & overheid.<br><br>"
        f'<a href="{SITE_BASE}/" target="_blank">Bekijk voorbeelden</a>'
    )

# -------------------------------------------------
# Smalltalk
# -------------------------------------------------
def smalltalk(text):
    st = DATA.get("smalltalk", {})
    t = norm(text)

    if t in ["goed", "prima", "top", "super", "redelijk", "lekker", "gaat wel", "best goed"]:
        return "Fijn om te horen! 😄 Waarmee kan ik je helpen?"
    if any(neg in t for neg in ["niet goed", "slecht", "druk", "moe", "zwaar", "rot", "kutdag"]):
        return "Jammer om te horen 😔 Hopelijk kan ik helpen — waarmee kan ik je helpen?"

    for _, section in st.items():
        for trig in section.get("triggers", []):
            if trig in t:
                return section.get("antwoord", "")
    return None

# -------------------------------------------------
# Extra vragen
# -------------------------------------------------
def check_extra_questions(text):
    eq = DATA.get("extra_questions", {})
    t = norm(text)
    for _, section in eq.items():
        for trig in section.get("triggers", []):
            if trig in t:
                return section.get("antwoord", "")
    return None

# -------------------------------------------------
# Leadflow
# -------------------------------------------------
def lead_prompt(step):
    return {
        "lead_name": "Leuk! 😊 Voor de demo heb ik je naam nodig.",
        "lead_website": "Dank je! Wat is de website waar de ChatPro-AI bot op moet komen?",
        "lead_email": "Perfect 👍 En wat is je e-mailadres?",
        "lead_phone": "Heb je ook een telefoonnummer waarop we je mogen bereiken? (optioneel)"
    }.get(step, "Zullen we verdergaan met je demo-aanvraag?")

def start_lead_flow(st):
    st["mode"] = "lead"
    st["lead"] = {}
    st["step"] = "lead_name"
    return lead_prompt("lead_name")

def lead_flow(st, text):
    step = st.get("step")

    if step == "lead_name":
        st["lead"]["naam"] = text.strip()
        st["step"] = "lead_website"
        return lead_prompt("lead_website")

    if step == "lead_website":
        st["lead"]["website"] = text.strip()
        st["step"] = "lead_email"
        return lead_prompt("lead_email")

    if step == "lead_email":
        st["lead"]["email"] = text.strip()
        st["step"] = "lead_phone"
        return lead_prompt("lead_phone")

    if step == "lead_phone":
        phone = text.strip()
        st["lead"]["telefoon"] = phone if phone and phone.lower() not in ["nee", "nvt", "geen", "liever niet"] else "niet opgegeven"
        lead = st["lead"]
        LEADS.append(lead)

        body_team = f"""
Nieuwe demo-aanvraag via Proxi 🤖

Naam: {lead['naam']}
E-mail: {lead['email']}
Website: {lead['website']}
Telefoon: {lead['telefoon']}

Verstuurd op {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        send_email("info@chatpro-ai.nl", "Nieuwe demo-aanvraag via Proxi", body_team, reply_to=lead["email"])

        body_client = f"""
Hoi {lead['naam']},

Bedankt voor je interesse in ChatPro-AI! 🎉
Ons team neemt binnen 24 uur contact met je op om de demo te plannen.

Website: {lead['website']}
Telefoon: {lead['telefoon']}

Handige links:
• Prijzen: {SITE_BASE}/prijzen
• Tijdelijke inzet: {SITE_BASE}/tijdelijk
• Contact: {SITE_BASE}/contact

Tot snel!
Het ChatPro-AI Team
{SITE_BASE}
"""
        send_email(lead["email"], "Bevestiging — je ChatPro-AI demo-aanvraag", body_client, reply_to="info@chatpro-ai.nl")

        st.clear()
        return "Top! ✅ Je demo-aanvraag is verzonden. Je ontvangt zo een bevestiging per e-mail."

# -------------------------------------------------
# AI fallback (OpenAI 1.30.1 compatibel)
# -------------------------------------------------
def ai_fallback(user_input):
    if not openai.api_key:
        print("⚠️ Geen OpenAI API-key, sla AI-fallback over.")
        return DATA.get("fallback", "Dat weet ik niet helemaal zeker 🤔. Zal ik je doorverbinden met het team via info@chatpro-ai.nl?")
    try:
        prompt = "Je bent Proxi, de virtuele assistent van ChatPro-AI. Antwoord professioneel, kort en vriendelijk in het Nederlands."
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=180,
            temperature=0.6
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("❌ Fout bij OpenAI:", e)
        return DATA.get("fallback", "Ik weet het niet helemaal zeker 🤔. Misschien kan ik je beter doorverbinden met het team via info@chatpro-ai.nl?")

# -------------------------------------------------
# Routing
# -------------------------------------------------
INTENTS = [
    (r"(wat\s+doet|wat\s+is|functie|uitleg|intro)", ans_intro),
    (r"(hoe\s+werk|implementatie|koppel|integratie)", ans_how),
    (r"(waarom|voordeel|benefit)", ans_why),
    (r"(wat\s+kost|kosten|prijs|tarief|abonnement)", ans_pricing),
    (r"(tijdelijk|event|campagne|week|weken)", ans_temp),
    (r"(sector|branche|voor\s+wie|geschikt)", ans_sectors),
    (r"(contact|email|mail|telefoon|bel)", ans_contact)
]

def route_only(text):
    t = norm(text)
    st_ans = smalltalk(t)
    if st_ans:
        return st_ans
    eq_ans = check_extra_questions(t)
    if eq_ans:
        return eq_ans
    for pattern, handler in INTENTS:
        if re.search(pattern, t):
            return handler()
    return None

def route(text):
    ans = route_only(text)
    if ans:
        return ans
    return ai_fallback(text)

# -------------------------------------------------
# API-routes
# -------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    text = data.get("message", "")
    sid = data.get("session_id", "anon")
    st = SESSIONS.get(sid, {"sid": sid, "mode": "site"})

    if st.get("mode") == "lead":
        out = lead_flow(st, text)
        SESSIONS[sid] = st
        return reply(out)

    if "demo" in norm(text):
        out = start_lead_flow(st)
        SESSIONS[sid] = st
        return reply(out)

    answer = route(text)
    SESSIONS[sid] = st
    return reply(answer, DEFAULT_SUGGESTIONS)

@app.route("/")
def home():
    w = DATA.get("intro", {}).get("welcome", "Proxi online.")
    return reply(w, DEFAULT_SUGGESTIONS)

@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route("/health")
def health():
    return jsonify({"ok": True, "leads": len(LEADS), "reserveringen_demo": len(RES_DEMO)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
