const ENERGY_PER_TOKEN = 0.000002;
const WATER_PER_KWH = 0.5;
const CO2_PER_KWH = 0.4;

let totalTokens = 0; // global cumulative count
let infoBox = document.querySelector("#planetLLM-info-box");

function createInfoBox() {
  if (infoBox) return;

  infoBox = document.createElement("div");
  infoBox.id = "planetLLM-info-box";
  infoBox.style.padding = "6px 10px";
  infoBox.style.background = "rgba(0,0,0,0.75)";
  infoBox.style.color = "#fff";
  infoBox.style.borderRadius = "6px";
  infoBox.style.fontSize = "12px";
  infoBox.style.fontFamily = "monospace";
  infoBox.style.marginBottom = "6px";
  infoBox.style.cursor = "pointer";
  infoBox.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

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

  // Tokens + severity
  const tokensDiv = document.createElement("div");
  tokensDiv.style.display = "flex";
  tokensDiv.style.alignItems = "center";
  tokensDiv.style.gap = "6px";
  tokensDiv.style.marginTop = "2px";
  tokensDiv.style.fontSize = "11px";
  tokensDiv.style.color = "#ccc";

  // Tokens text
  const tokensText = document.createElement("span");
  tokensText.id = "planetLLM-tokens-text";
  tokensText.innerText = "Tokens used: 0 Severity:";
  tokensDiv.appendChild(tokensText);

  // Severity dots
  const dotsContainer = document.createElement("div");
  dotsContainer.style.display = "flex";
  dotsContainer.style.gap = "3px";
  for (let i = 1; i <= 3; i++) {
    const dot = document.createElement("span");
    dot.className = `planetLLM-dot dot-${i}`;
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#333";
    dot.style.transition = "background 0.3s ease";
    dotsContainer.appendChild(dot);
  }
  tokensDiv.appendChild(dotsContainer);

  infoBox.appendChild(tokensDiv);

  // Hover expand
  infoBox.addEventListener("mouseenter", () => {
    infoBox.style.transform = "scale(1.05)";
    infoBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
  });
  infoBox.addEventListener("mouseleave", () => {
    infoBox.style.transform = "scale(1)";
    infoBox.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
  });
}

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
    tokensText.innerText = `Tokens used: ${totalTokens}`;
  }

  if (dots) {
    const severityLevel = Math.min(3, Math.ceil(totalTokens / 10)); // adjust scale factor
    dots.forEach((dot, index) => {
      if (index + 1 <= severityLevel) {
        if (index === 0) dot.style.background = "limegreen";
        else if (index === 1) dot.style.background = "yellow";
        else dot.style.background = "red";
      } else {
        dot.style.background = "#333";
      }
    });
  }
}

function insertBox() {
  const form = document.querySelector("form[data-type='unified-composer']");
  if (!form) return;

  // Only insert if not already in the form
  if (!form.contains(infoBox)) {
    form.prepend(infoBox);

    // Pop animation
    infoBox.style.transform = "scale(0.8)";
    requestAnimationFrame(() => {
      infoBox.style.transition = "transform 0.25s ease, box-shadow 0.2s ease";
      infoBox.style.transform = "scale(1)";
    });
  }
}

// Initialize
createInfoBox();
insertBox();

const observer = new MutationObserver(() => {
  insertBox();
});
observer.observe(document.body, { childList: true, subtree: true });

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
function formatWater(waterLiters) {
  if (waterLiters < 0.001) return `${(waterLiters * 1_000_000).toFixed(1)} μL`;
  if (waterLiters < 1) return `${(waterLiters * 1000).toFixed(2)} mL`;
  return `${waterLiters.toFixed(3)} L`;
}

function formatEnergy(energyKWh) {
  if (energyKWh < 0.001) return `${(energyKWh * 1000).toFixed(3)} Wh`;
  if (energyKWh < 1) return `${energyKWh.toFixed(6)} kWh`;
  return `${(energyKWh / 1000).toFixed(6)} MWh`;
}

function formatCO2(co2Kg) {
  if (co2Kg < 0.001) return `${(co2Kg * 1_000_000).toFixed(1)} mg`;
  if (co2Kg < 1) return `${(co2Kg * 1000).toFixed(2)} g`;
  return `${co2Kg.toFixed(3)} kg`;
}

// function updateFootprint(promptText) {
//   const tokens = Math.ceil(promptText.split(/\s+/).length * 1.3);
//   totalTokens += tokens;

//   const energy = tokens * ENERGY_PER_TOKEN;
//   const water = energy * WATER_PER_KWH;
//   const co2 = energy * CO2_PER_KWH;

//   const usageDiv = document.querySelector("#planetLLM-usage");
//   const tokensDiv = document.querySelector("#planetLLM-tokens");
//   const impactBar = document.querySelector("#planetLLM-impact-bar");

//   if (usageDiv) {
//     usageDiv.innerText = `⚡ ${formatEnergy(energy)} | 💧 ${formatWater(
//       water
//     )} | ⛽ ${formatCO2(co2)}`;
//   }

//   if (tokensDiv) {
//     const tokensText = document.querySelector("#planetLLM-tokens-text");
//     tokensText.innerText = `Tokens used: ${tokens}`;

//     // Update dots
//     const dots = document.querySelectorAll(".planetLLM-dot");
//     // Example: green for first third, yellow for second, red for third
//     const severityLevel = Math.min(3, Math.ceil(tokens / 10)); // adjust scale factor

//     dots.forEach((dot, index) => {
//       if (index + 1 <= severityLevel) {
//         if (index === 0) dot.style.background = "limegreen";
//         else if (index === 1) dot.style.background = "yellow";
//         else dot.style.background = "red";
//       } else {
//         dot.style.background = "#333";
//       }
//     });
//   }
// }
