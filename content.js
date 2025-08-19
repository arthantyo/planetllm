const ENERGY_PER_TOKEN = 0.000002;
const WATER_PER_KWH = 0.5;
const CO2_PER_KWH = 0.4;

let toast = document.createElement("div");
let lastPrompt = "";
toast.id = "llm-footprint-toast";
toast.innerText = "🌍 Waiting for your first prompt...";
document.body.appendChild(toast);

function hookSendButton() {
  const sendBtn = document.querySelector("#composer-submit-button");
  const inputDiv = document.querySelector("#prompt-textarea > p");
  const textArea = document.querySelector("#prompt-textarea");

  if (!sendBtn || !inputDiv) {
    setTimeout(hookSendButton, 1000);
    return;
  }

  sendBtn.addEventListener("click", () => {
    updateFootprint(lastPrompt);
  });

  textArea.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("enter", lastPrompt);

      updateFootprint(lastPrompt);
    } else {
      lastPrompt = textArea.textContent;
    }
  });
}

hookSendButton();

function updateFootprint(promptText) {
  const tokens = Math.ceil(promptText.split(/\s+/).length * 1.3);
  const energy = tokens * ENERGY_PER_TOKEN;
  const water = energy * WATER_PER_KWH;
  const co2 = energy * CO2_PER_KWH;

  toast.innerText = `⚡ ${energy.toFixed(6)} kWh | 💧 ${water.toFixed(
    3
  )} L | 🌍 ${(co2 * 1000).toFixed(2)} g CO₂`;
}
