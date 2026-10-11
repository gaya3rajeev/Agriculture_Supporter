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

   async function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    appendMsg(text, "user");
    input.value = "";
    const bubble = appendMsg("Typing...", "bot");
    try {
      const res = await fetch(`${AG_API_BASE}/chat`, {
        method: "POST",
        headers: agAuthHeaders(),
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (res.status === 401) bubble.textContent = "Your session expired. Please log out and log in again.";
      else if (!res.ok) bubble.textContent = data.error || "Something went wrong.";
      else bubble.textContent = data.reply;
    } catch (e) {
      bubble.textContent = "Cannot reach the server. Is the backend running?";
    }
    body.scrollTop = body.scrollHeight;
  }

  function appendMsg(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }});