import { getTotals } from "./storage";
import { formatCO2, formatEnergy, formatWater } from "./utils";

// ---------------- Modal ----------------
export function openUsageModal() {
  // Remove existing modal if any
  const existing = document.getElementById("planetLLM-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "planetLLM-modal";
  Object.assign(modal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "999999",
    fontFamily: "monospace",
    overflowY: "auto",
    padding: "40px",
    animation: "fadeIn 0.3s ease",
  });

  const contentWrapper = document.createElement("div");
  Object.assign(contentWrapper.style, {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    minWidth: "600px",
    maxWidth: "900px",
    width: "90%",
  });

  // ---------------- Sidebar ----------------
  const sidebar = document.createElement("div");
  Object.assign(sidebar.style, {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "150px",
    background: "#222",
    borderRadius: "8px",
    padding: "10px",
  });

  const llms = ["ChatGPT", "Claude", "Gemini"];
  const contentArea = document.createElement("div");
  Object.assign(contentArea.style, {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#111",
    borderRadius: "8px",
    padding: "20px",
  });

  // Function to render content based on selected LLM
  function renderContent(llm) {
    contentArea.innerHTML = ""; // clear previous content

    // ---------------- Fake data ----------------
    const totals = getTotals(llm.toLowerCase());

    // Example usage values (you can calculate dynamically if needed)
    const values = [totals.energy, totals.water, totals.co2]; // use stored numbers
    const totalTokens = totals.tokens;

    // ---------------- Usage Cards ----------------
    const metrics = ["Energy", "Water", "Carbon"];
    const icons = ["⚡", "💧", "⛽"];
    const units = ["kWh", "L", "kg"];

    const usageContainer = document.createElement("div");
    Object.assign(usageContainer.style, {
      display: "flex",
      gap: "12px",
      justifyContent: "space-around",
    });

    metrics.forEach((metric, i) => {
      const card = document.createElement("div");
      Object.assign(card.style, {
        background: "#222",
        padding: "10px",
        borderRadius: "6px",
        flex: "1",
        textAlign: "center",
      });

      const label = document.createElement("strong");
      label.innerText = `${icons[i]} ${metric}`;
      const value = document.createElement("div");
      if (metric === "Energy") value.innerText = formatEnergy(values[i]);
      if (metric === "Water") value.innerText = formatWater(values[i]);
      if (metric === "Carbon") value.innerText = formatCO2(values[i]);
      value.style.transition = "all 1s ease";

      card.appendChild(label);
      card.appendChild(value);
      usageContainer.appendChild(card);

      let current = 0;
      const target = values[i];
      const stepCount = 30; // number of steps in the animation
      const step = target / stepCount;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }

        // Format based on metric
        if (metrics[i] === "Energy") value.innerText = formatEnergy(current);
        if (metrics[i] === "Water") value.innerText = formatWater(current);
        if (metrics[i] === "Carbon") value.innerText = formatCO2(current);
      }, 30);
    });

    contentArea.appendChild(usageContainer);

    // ---------------- Impact Score ----------------
    const impactContainer = document.createElement("div");
    Object.assign(impactContainer.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      marginTop: "8px",
      fontFamily: "monospace",
    });

    const impactScore = (
      values[0] * 100 +
      values[1] * 10 +
      values[2] * 50
    ).toFixed(1);
    const impactLabel = document.createElement("div");
    impactLabel.innerHTML = `<strong>Impact Score:</strong> ${impactScore}`;
    impactContainer.appendChild(impactLabel);

    const progressBarContainer = document.createElement("div");
    Object.assign(progressBarContainer.style, {
      width: "100%",
      height: "12px",
      background: "#333",
      borderRadius: "6px",
      overflow: "hidden",
    });

    const progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
      height: "100%",
      width: `${Math.min(100, impactScore)}%`,
      borderRadius: "6px",
      transition: "width 1s ease, background 1s ease",
    });

    const colorValue = Math.min(1, impactScore / 100);
    progressBar.style.background = `hsl(${120 - colorValue * 120}, 100%, 50%)`;

    progressBarContainer.appendChild(progressBar);
    impactContainer.appendChild(progressBarContainer);
    contentArea.appendChild(impactContainer);

    // ---------------- Total Tokens ----------------
    const tokenDiv = document.createElement("div");
    tokenDiv.innerHTML = `<strong>Total Tokens Used:</strong> ${totalTokens}`;
    contentArea.appendChild(tokenDiv);

    // ---------------- Reminder Settings ----------------
    const reminderContainer = document.createElement("div");
    Object.assign(reminderContainer.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "10px",
      background: "#222",
      borderRadius: "6px",
    });

    const reminderHeader = document.createElement("strong");
    reminderHeader.innerText = "Reminder Settings";
    reminderContainer.appendChild(reminderHeader);

    const toggleWrapper = document.createElement("label");
    toggleWrapper.style.display = "flex";
    toggleWrapper.style.alignItems = "center";
    toggleWrapper.style.gap = "8px";
    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked =
      localStorage.getItem("planetLLM_reminderEnabled") === "true";
    const toggleLabel = document.createElement("span");
    toggleLabel.innerText = "Enable Reminder";
    toggleWrapper.appendChild(toggleInput);
    toggleWrapper.appendChild(toggleLabel);
    reminderContainer.appendChild(toggleWrapper);

    const thresholdLabel = document.createElement("span");
    thresholdLabel.innerText = "Reminder Threshold:";
    reminderContainer.appendChild(thresholdLabel);

    const thresholdSelect = document.createElement("select");
    Object.assign(thresholdSelect.style, {
      background: "#222",
      color: "#fff",
      border: "1px solid #555",
      borderRadius: "4px",
      padding: "4px 6px",
      fontFamily: "monospace",
      cursor: "pointer",
    });

    ["Low Usage", "Medium Usage", "Heavy Usage"].forEach((level) => {
      const option = document.createElement("option");
      option.value = level.toLowerCase().replace(" ", "_");
      option.innerText = level;
      Object.assign(option.style, { background: "#222", color: "#fff" });

      if (localStorage.getItem("planetLLM_reminderThreshold") === option.value)
        option.selected = true;

      thresholdSelect.appendChild(option);
    });

    reminderContainer.appendChild(thresholdSelect);

    toggleInput.addEventListener("change", () => {
      localStorage.setItem("planetLLM_reminderEnabled", toggleInput.checked);
    });
    thresholdSelect.addEventListener("change", () => {
      localStorage.setItem(
        "planetLLM_reminderThreshold",
        thresholdSelect.value
      );
    });

    contentArea.appendChild(reminderContainer);
  }

  // Sidebar buttons
  llms.forEach((llm) => {
    const btn = document.createElement("button");
    btn.innerText = llm;
    Object.assign(btn.style, {
      padding: "6px",
      background: "#111",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background 0.2s ease",
    });

    btn.addEventListener("click", () => {
      // Remove "selected" style from all buttons
      sidebar.querySelectorAll("button").forEach((b) => {
        b.style.background = "#111";
      });

      // Apply selected style to the clicked button
      btn.style.background = "#444"; // change to any highlight color you like

      // Render content for the selected LLM
      renderContent(llm);
    });

    sidebar.appendChild(btn);
  });

  contentWrapper.appendChild(sidebar);
  contentWrapper.appendChild(contentArea);
  modal.appendChild(contentWrapper);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✖";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "transparent",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "22px",
  });
  closeBtn.addEventListener("click", () => modal.remove());
  modal.appendChild(closeBtn);

  document.body.appendChild(modal);

  renderContent("ChatGPT"); // default LLM

  // ---------------- Animations ----------------
  const style = document.createElement("style");
  style.innerHTML = `
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      @keyframes pulse { 0%,100% {transform: scale(1)} 50% {transform: scale(1.02)} }
    `;
  document.head.appendChild(style);
}
