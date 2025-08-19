const ENERGY_PER_TOKEN = 0.000002;
const WATER_PER_KWH = 0.5;
const CO2_PER_KWH = 0.4;

let totalTokens = 0;
let lastPrompt = "";
let infoBox = null;

// -------------------- Helpers --------------------
const formatEnergy = (kWh) => {
  if (kWh < 0.001) return `${(kWh * 1000).toFixed(3)} Wh`;
  if (kWh < 1) return `${kWh.toFixed(6)} kWh`;
  return `${(kWh / 1000).toFixed(6)} MWh`;
};

const formatWater = (L) => {
  if (L < 0.001) return `${(L * 1_000_000).toFixed(1)} μL`;
  if (L < 1) return `${(L * 1000).toFixed(2)} mL`;
  return `${L.toFixed(3)} L`;
};

const formatCO2 = (kg) => {
  if (kg < 0.001) return `${(kg * 1_000_000).toFixed(1)} mg`;
  if (kg < 1) return `${(kg * 1000).toFixed(2)} g`;
  return `${kg.toFixed(3)} kg`;
};

// -------------------- InfoBox Creation --------------------
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
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    transformOrigin: "center",
    transform: "scale(0.95)",
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  });

  // Branding
  const branding = document.createElement("div");
  branding.innerText = "planetLLM 🌍";
  branding.style.fontWeight = "bold";
  branding.style.marginBottom = "4px";
  infoBox.appendChild(branding);

  // Usage
  const usage = document.createElement("div");
  usage.id = "planetLLM-usage";
  usage.innerText = "Waiting for your first prompt...";
  infoBox.appendChild(usage);

  // Tokens + Severity
  const tokensDiv = document.createElement("div");
  Object.assign(tokensDiv.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
    fontSize: "11px",
    color: "#ccc",
  });

  // Tokens text
  const tokensText = document.createElement("span");
  tokensText.id = "planetLLM-tokens-text";
  tokensText.innerText = "Tokens used: 0 Severity:";
  tokensDiv.appendChild(tokensText);

  // Severity dots
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

  // Hover effect
  infoBox.addEventListener("mouseenter", () => {
    infoBox.style.transform = "scale(1.05)";
    infoBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
  });
  infoBox.addEventListener("mouseleave", () => {
    infoBox.style.transform = "scale(1)";
    infoBox.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
  });
}

// -------------------- Insert InfoBox --------------------
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

// -------------------- Footprint Update --------------------
function updateFootprint(promptText) {
  const tokens = Math.ceil(promptText.split(/\s+/).length * 1.3);
  totalTokens += tokens;

  const energy = tokens * ENERGY_PER_TOKEN;
  const water = energy * WATER_PER_KWH;
  const co2 = energy * CO2_PER_KWH;

  const usageDiv = document.querySelector("#planetLLM-usage");
  const tokensText = document.querySelector("#planetLLM-tokens-text");
  const dots = document.querySelectorAll(".planetLLM-dot");

  if (usageDiv) {
    usageDiv.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
      water
    )} | ⛽ ${formatCO2(co2)}`;
  }

  if (tokensText) {
    tokensText.innerText = `Tokens used: ${totalTokens} Severity:`;
  }

  if (dots) {
    const severityLevel = Math.min(3, Math.ceil(totalTokens / 10));
    dots.forEach((dot, index) => {
      if (index < severityLevel) {
        dot.style.background =
          index === 0 ? "limegreen" : index === 1 ? "yellow" : "red";
      } else {
        dot.style.background = "#333";
      }
    });
  }
}

// -------------------- Hook Send Button --------------------
function hookSendButton() {
  const sendBtn = document.querySelector("#composer-submit-button");
  const textArea = document.querySelector("#prompt-textarea");

  if (!sendBtn || !textArea) {
    setTimeout(hookSendButton, 1000);
    return;
  }

  sendBtn.addEventListener("click", () => updateFootprint(lastPrompt));

  textArea.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      updateFootprint(lastPrompt);
    } else {
      lastPrompt = textArea.textContent;
    }
  });
}

// -------------------- PlanetLM Tooltip

function injectPlanetLLMButtons() {
  const userArticles = document.querySelectorAll(
    'article[data-turn="assistant"]'
  );

  userArticles.forEach((article) => {
    const buttonContainer = article.querySelector("div");

    if (!buttonContainer || buttonContainer.querySelector(".planetllm-btn"))
      return;

    const planetButton = document.createElement("button");
    planetButton.innerText = "Energy usage";
    planetButton.className = "planetllm-btn";

    planetButton.style.padding = "6px 12px";
    planetButton.style.marginLeft = "110px";
    planetButton.style.background = "#4CAF50"; // modern green
    planetButton.style.color = "#fff";
    planetButton.style.border = "none";
    planetButton.style.borderRadius = "6px"; // smooth corners
    planetButton.style.cursor = "pointer";
    planetButton.style.fontSize = "12px";
    planetButton.style.fontFamily = "monospace"; // keeps it clean and readable
    planetButton.style.position = "relative";
    planetButton.style.letterSpacing = "0.5px";
    planetButton.style.transition = "all 0.2s ease";

    // Hover effect: subtle lift and shadow
    planetButton.onmouseenter = () => {
      planetButton.style.transform = "translateY(-2px)";
      planetButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    };

    planetButton.onmouseleave = () => {
      planetButton.style.transform = "translateY(0)";
      planetButton.style.boxShadow = "none";
    };

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.top = "125%"; // changed from bottom to top
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    tooltip.style.background = "rgba(0,0,0,0.85)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "10px";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.opacity = "0";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transition = "opacity 0.2s ease";
    planetButton.appendChild(tooltip);

    planetButton.addEventListener("mouseenter", () => {
      const userArticle = article.previousElementSibling;

      let promptText = "";
      if (userArticle && userArticle.matches('article[data-turn="user"]')) {
        promptText = userArticle.innerText.trim();

        // remove "You said:" if it's at the beginning
        if (promptText.startsWith("You said:")) {
          promptText = promptText.slice("You said:".length).trim();
        }

        console.log(promptText);
      }

      // Fallback if nothing is found
      if (!promptText) promptText = "";

      const tokens = Math.ceil(promptText.split(/\s+/).length * 1.3);
      const energy = tokens * ENERGY_PER_TOKEN;
      const water = energy * WATER_PER_KWH;
      const co2 = energy * CO2_PER_KWH;

      tooltip.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
        water
      )} | ⛽ ${formatCO2(co2)}`;
      tooltip.style.opacity = "1";
    });

    planetButton.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    buttonContainer.appendChild(planetButton);
  });
}

// Observe chat for new messages dynamically

// Find the parent container of all user & assistant messages
// const chatContainer = document.querySelector(
//   'article[data-turn="user"]'
// )?.parentElement;

// if (chatContainer) {
//   const observer = new MutationObserver(() => {
//     injectPlanetLLMButtons();
//   });

//   observer.observe(docu, { childList: true, subtree: true });

//   // Initial injection
//   injectPlanetLLMButtons();
// } else {
//   console.warn("PlanetLLM: Chat container not found.");
// }

// Initial injection
injectPlanetLLMButtons();

// -------------------- Initialization --------------------
createInfoBox();
insertBox();
hookSendButton();

new MutationObserver(() => {
  injectPlanetLLMButtons();
  insertBox();
}).observe(document.body, {
  childList: true,
  subtree: true,
});
