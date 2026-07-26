/* =========================================================================
   chatbot.js — floating assistant widget
   Injects its own HTML so every authenticated page just needs to include
   this one script tag. Responses are rule-based here for the demo; swap
   `getBotReply()` for a call to your NLP/LLM backend endpoint later.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const host = document.createElement("div");
  host.innerHTML = `
    <button class="chatbot-fab" id="chatbotFab" aria-label="Open assistant">
      <i class="bi bi-robot"></i>
    </button>
    <div class="chatbot-panel" id="chatbotPanel">
      <div class="chatbot-head">
        <div class="d-flex align-items-center gap-2 flex-grow-1">
          <i class="bi bi-robot fs-5"></i>
          <div>
            <div class="fw-bold" style="font-size:.92rem;">AgriBot Assistant</div>
            <div class="small" style="opacity:.7;font-size:.72rem;">Here to help with farming queries</div>
          </div>
        </div>
        <button class="btn btn-sm text-white" id="chatbotClose" aria-label="Close assistant"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="chatbot-body" id="chatbotBody">
        <div class="msg bot">Hi! I'm AgriBot 🌱 Ask me about crops, animal care, or how to use this site.</div>
        <div class="chatbot-quick" id="chatbotQuick">
          <button data-q="How do I add a new crop?">Add a crop?</button>
          <button data-q="How does search by location work?">Search by location</button>
          <button data-q="Tell me about animal husbandry">Animal husbandry</button>
        </div>
      </div>
      <div class="chatbot-foot">
        <input type="text" id="chatbotInput" placeholder="Type your question..." aria-label="Message" />
        <button class="btn btn-wheat btn-sm" id="chatbotSend" aria-label="Send"><i class="bi bi-send-fill"></i></button>
      </div>
    </div>`;
  document.body.appendChild(host);

  const fab = document.getElementById("chatbotFab");
  const panel = document.getElementById("chatbotPanel");
  const body = document.getElementById("chatbotBody");
  const input = document.getElementById("chatbotInput");

  fab.addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("chatbotClose").addEventListener("click", () => panel.classList.remove("open"));

  document.getElementById("chatbotSend").addEventListener("click", sendMsg);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMsg(); });
  document.getElementById("chatbotQuick").addEventListener("click", (e) => {
    if (e.target.dataset.q) { input.value = e.target.dataset.q; sendMsg(); }
  });

  function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    appendMsg(text, "user");
    input.value = "";
    setTimeout(() => appendMsg(getBotReply(text), "bot"), 450);
  }

  function appendMsg(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  // BACKEND HOOK: replace this with a fetch() call to your chatbot / LLM
  // API endpoint, e.g. POST /api/chatbot { message: text }
  function getBotReply(text) {
    const t = text.toLowerCase();
    if (t.includes("location")) return "Head to 'Search by Location' on your dashboard, pick your state and enter your area — you'll get crop & livestock recommendations for that region.";
    if (t.includes("animal")) return "Animal Husbandry covers Poultry, Dairy, Goat, Sheep, Piggery, Aquaculture and more. Pick a category, then an animal, to see care, feeding and housing details.";
    if (t.includes("crop")) return "Crop Production is organised by category — Cereals, Pulses, Vegetables, Fruits, Spices and more. Click a category to browse crops and their growing guides.";
    if (t.includes("login") || t.includes("signup") || t.includes("account")) return "You can log in or create an account from the auth page — your details are stored securely and checked against the database.";
    if (t.includes("hi") || t.includes("hello")) return "Hello! Ask me anything about crops, animals, or navigating Agriculture Supporter.";
    return "I'm a demo assistant for now — in the full version I'll be connected to a live knowledge base to answer detailed farming questions.";
  }
});
