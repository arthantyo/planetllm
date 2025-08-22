export function showToast(message) {
  const existing = document.getElementById("planetLLM-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "planetLLM-toast";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#222",
    color: "#fff",
    fontFamily: "monospace",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    zIndex: "1000000",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "220px",
    maxWidth: "400px",
    animation: "fadeIn 0.3s ease",
  });

  const text = document.createElement("span");
  text.innerText = message;

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✖";
  Object.assign(closeBtn.style, {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  });

  closeBtn.addEventListener("click", () => toast.remove());

  toast.appendChild(text);
  toast.appendChild(closeBtn);
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn { from {opacity:0; transform: translateY(20px);} to {opacity:1; transform: translateY(0);} }
  `;
  document.head.appendChild(style);
}

export function checkReminder(totals) {
  const reminderEnabled =
    localStorage.getItem("planetLLM_reminderEnabled") === "true";
  if (!reminderEnabled) return;

  const threshold =
    localStorage.getItem("planetLLM_reminderThreshold") || "medium_usage";

  const usageScore = totals.energy + totals.water + totals.co2;

  let thresholdValue;
  switch (threshold) {
    case "low_usage":
      thresholdValue = 0.01;
      break;
    case "medium_usage":
      thresholdValue = 0.05;
      break;
    case "heavy_usage":
      thresholdValue = 0.1;
      break;
    default:
      thresholdValue = 0.05;
  }

  if (usageScore >= thresholdValue) {
    showToast(
      "⚠️ You have reached your usage threshold! 🌍 Every little bit helps to save the planet!"
    );
  }
}
