import { calculateTokens } from "./token";
import { openUsageModal } from "./modal";
import { getProvider, formatCO2, formatEnergy, formatWater } from "./utils";
import { getTotals, saveTotals } from "./storage";
import { showToast, checkReminder } from "./toast";

// -------------------- Constants --------------------
const ENERGY_PER_TOKEN = 0.000002;
const WATER_PER_KWH = 0.5;
const CO2_PER_KWH = 0.4;

let latestInput = "";
let infoBox = null;

// -------------------- Helpers --------------------
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function calculateFootprint(promptText) {
  const tokens = calculateTokens(promptText);

  const energy = tokens * ENERGY_PER_TOKEN;
  const water = energy * WATER_PER_KWH;
  const co2 = energy * CO2_PER_KWH;

  return { tokens, energy, water, co2 };
}

// -------------------- InfoBox --------------------
function createInfoBox() {
  if (infoBox) return;

  infoBox = document.createElement("div");
  infoBox.id = "planetLLM-info-box";
  Object.assign(infoBox.style, {
    padding: "6px 10px",
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "monospace",
    marginBottom: "6px",
    cursor: "pointer",
    transition: "transform 0.2s ease, boxShadow 0.2s ease",
    transformOrigin: "center",
    transform: "scale(0.95)",
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  });

  const branding = document.createElement("div");
  branding.innerText = "planetLLM 🌍";
  branding.style.fontWeight = "bold";
  branding.style.marginBottom = "4px";
  infoBox.appendChild(branding);

  const usage = document.createElement("div");
  usage.id = "planetLLM-usage";
  usage.innerText = "Waiting for your first prompt...";
  infoBox.appendChild(usage);

  const tokensDiv = document.createElement("div");
  Object.assign(tokensDiv.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
    fontSize: "11px",
    color: "#ccc",
  });

  const tokensText = document.createElement("span");
  tokensText.id = "planetLLM-tokens-text";
  tokensText.innerText = "Tokens used: 0 Severity:";
  tokensDiv.appendChild(tokensText);

  const dotsContainer = document.createElement("div");
  dotsContainer.style.display = "flex";
  dotsContainer.style.gap = "3px";

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "planetLLM-dot";
    Object.assign(dot.style, {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#333",
      transition: "background 0.3s ease",
    });
    dotsContainer.appendChild(dot);
  }

  tokensDiv.appendChild(dotsContainer);
  infoBox.appendChild(tokensDiv);

  infoBox.addEventListener("mouseenter", () => {
    infoBox.style.transform = "scale(1.05)";
    infoBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
  });

  infoBox.addEventListener("mouseleave", () => {
    infoBox.style.transform = "scale(1)";
    infoBox.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
  });

  infoBox.addEventListener("click", () => {
    openUsageModal();
  });
}

function insertBox() {
  const form = document.querySelector("form[data-type='unified-composer']");
  if (!form) return;
  if (!form.contains(infoBox)) {
    form.prepend(infoBox);
    infoBox.style.transform = "scale(0.8)";
    requestAnimationFrame(() => {
      infoBox.style.transition = "transform 0.25s ease, box-shadow 0.2s ease";
      infoBox.style.transform = "scale(1)";
    });
  }
}

// -------------------- Footprint --------------------
// function updateFootprint(promptText) {
//   const tokens = calculateTokens(promptText);

//   const energy = tokens * ENERGY_PER_TOKEN;
//   const water = energy * WATER_PER_KWH;
//   const co2 = energy * CO2_PER_KWH;

//   const usageDiv = document.querySelector("#planetLLM-usage");
//   const tokensText = document.querySelector("#planetLLM-tokens-text");
//   const dots = document.querySelectorAll(".planetLLM-dot");

//   if (usageDiv) {
//     usageDiv.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
//       water
//     )} | ⛽ ${formatCO2(co2)}`;
//   }

//   if (tokensText) {
//     tokensText.innerText = `Tokens used: ${tokens} Severity:`;
//   }

//   if (dots) {
//     const severityLevel = Math.min(3, Math.ceil(tokens / 10));
//     dots.forEach((dot, index) => {
//       dot.style.background =
//         index < severityLevel
//           ? index === 0
//             ? "limegreen"
//             : index === 1
//             ? "yellow"
//             : "red"
//           : "#333";
//     });
//   }
// }

function previewFootprint(promptText) {
  const { tokens, energy, water, co2 } = calculateFootprint(promptText);

  const usageDiv = document.querySelector("#planetLLM-usage");
  const tokensText = document.querySelector("#planetLLM-tokens-text");
  const dots = document.querySelectorAll(".planetLLM-dot");

  if (usageDiv) {
    usageDiv.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
      water
    )} | ⛽ ${formatCO2(co2)}`;
  }

  if (tokensText) {
    tokensText.innerText = `Tokens used: ${tokens} Severity:`;
  }

  if (dots) {
    const severityLevel = Math.min(3, Math.ceil(tokens / 10));
    dots.forEach((dot, index) => {
      dot.style.background =
        index < severityLevel
          ? index === 0
            ? "limegreen"
            : index === 1
            ? "yellow"
            : "red"
          : "#333";
    });
  }
}

function saveFootprint(promptText) {
  const { tokens, energy, water, co2 } = calculateFootprint(promptText);

  const provider = getProvider();
  const totals = getTotals(provider);

  totals.tokens += tokens;
  totals.energy += energy;
  totals.water += water;
  totals.co2 += co2;

  saveTotals(provider, totals);

  checkReminder(totals);
}

// -------------------- Hook Send --------------------

// function calculateTokens(promptText) {
//   if (!promptText || promptText.trim() === "") return 0; // empty prompt = 0 tokens

//   const words = promptText.trim().split(/\s+/).length;
//   const tokens = Math.ceil(words * 1.3);
//   return tokens;
// }

function hookSendButton() {
  const sendBtn = document.querySelector("button#composer-submit-button");
  const textArea = document.querySelector("#prompt-textarea");

  if (!sendBtn || !textArea) {
    setTimeout(hookSendButton, 1000);
    return;
  }

  const getCurrentPrompt = () =>
    textArea.value ? textArea.value.trim() : textArea.textContent.trim();

  const debouncedPreview = debounce(
    () => previewFootprint(getCurrentPrompt()),
    300
  );

  // 🔹 just preview while typing/pasting
  textArea.addEventListener("input", (e) => {
    latestInput = e.target.innerText;

    debouncedPreview();
  });
  textArea.addEventListener("paste", debouncedPreview);
  textArea.addEventListener("cut", debouncedPreview);

  // 🔹 submit on Enter
  textArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const prompt = latestInput;
      previewFootprint(prompt);
      saveFootprint(prompt); // ✅ only save here
    }
  });

  // 🔹 submit on click
  sendBtn.addEventListener("click", () => {
    const prompt = latestInput;
    previewFootprint(prompt);

    saveFootprint(prompt);
  });
}

// -------------------- PlanetLLM Buttons --------------------
function createPlanetButton(promptText = "") {
  const button = document.createElement("button");
  button.innerText = "Energy usage ";
  button.className = "planetllm-btn";

  Object.assign(button.style, {
    padding: "6px 14px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "monospace",
    position: "relative",
    letterSpacing: "0.5px",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap",
    textAlign: "center",
    marginBottom: "6px",
    maxWidth: "150px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  });

  // Hover effect
  button.onmouseenter = () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  };
  button.onmouseleave = () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "none";
  };

  // Tooltip
  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute",
    top: "50%", // vertically center relative to parent
    left: "105%", // a bit to the right of the parent element
    transform: "translateY(-50%)", // center vertically
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    whiteSpace: "nowrap",
    opacity: "0",
    zIndex: "999999999",
    pointerEvents: "none",
    transition: "opacity 0.2s ease",
  });

  const branding = document.createElement("div");
  branding.innerText = "planetLLM 🌍";
  branding.style.fontWeight = "bold";
  branding.style.marginBottom = "4px";
  tooltip.appendChild(branding);

  const metrics = document.createElement("div");
  tooltip.appendChild(metrics);

  const metrics2 = document.createElement("div");
  Object.assign(metrics2.style, {
    display: "flex",
    marginTop: "2px",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  });
  tooltip.appendChild(metrics2);

  const tokensText = document.createElement("span");
  tokensText.innerText = "Tokens used: 0";
  metrics2.appendChild(tokensText);

  const severityText = document.createElement("span");
  severityText.innerText = "Severity:";
  metrics2.appendChild(severityText);

  const dotsContainer = document.createElement("div");
  Object.assign(dotsContainer.style, {
    display: "flex",
    gap: "3px",
  });
  metrics2.appendChild(dotsContainer);

  const dots = Array.from({ length: 3 }).map(() => {
    const dot = document.createElement("span");
    Object.assign(dot.style, {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#333",
      transition: "background 0.3s ease",
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  button.appendChild(tooltip);

  // hover logic
  button.addEventListener("mouseenter", () => {
    if (!promptText) return;
    // const tokens = Math.ceil(promptText.split(/\s+/).length * 1.3);
    const tokens = calculateTokens(promptText);
    const energy = tokens * ENERGY_PER_TOKEN;
    const water = energy * WATER_PER_KWH;
    const co2 = energy * CO2_PER_KWH;

    // update metrics
    metrics.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
      water
    )} | ⛽ ${formatCO2(co2)}`;

    // update tokens
    tokensText.innerText = `Tokens used: ${tokens}`;

    // update severity dots
    const severityLevel = Math.min(3, Math.ceil(tokens / 10));
    dots.forEach((dot, index) => {
      dot.style.background =
        index < severityLevel
          ? index === 0
            ? "limegreen"
            : index === 1
            ? "yellow"
            : "red"
          : "#333";
    });

    tooltip.style.opacity = "1";
  });

  button.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  return button;
}

function injectPlanetLLMButtons() {
  const userArticles = document.querySelectorAll(
    'article[data-turn="assistant"]'
  );
  userArticles.forEach((article) => {
    const container = article.querySelector("div");
    if (!container || container.querySelector(".planetllm-btn")) return;

    Object.assign(container.style, {
      display: "flex",
      justifyContent: "flex-end", // align to the right
      alignItems: "center", // vertically center
      gap: "4px", // space between buttons if multiple
      flexDirection: "column",
    });

    const userArticle = article.previousElementSibling;
    let promptText = "";
    if (userArticle && userArticle.matches('article[data-turn="user"]')) {
      promptText = userArticle.innerText.trim();
      if (promptText.startsWith("You said:"))
        promptText = promptText.slice(9).trim();
    }

    const btn = createPlanetButton(promptText);
    container.appendChild(btn);
  });
}

// -------------------- Initialization --------------------
createInfoBox();
insertBox();
injectPlanetLLMButtons();

hookSendButton(); // if you’re using your existing footprint hook

new MutationObserver(() => {
  injectPlanetLLMButtons();
  insertBox();
}).observe(document.body, { childList: true, subtree: true });
