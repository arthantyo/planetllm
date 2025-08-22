// -------------------- Toast --------------------
function createToast(message) {
  // Check if toast already exists
  if (document.querySelector("#planetLLM-toast")) return;

  const toast = document.createElement("div");
  toast.id = "planetLLM-toast";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#222",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    fontSize: "14px",
    fontFamily: "monospace",
    zIndex: "999999",
    opacity: "0",
    transform: "translateY(20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });

  toast.innerText = message;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Auto-remove after 5s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// -------------------- Daily Limit --------------------
const DAILY_LIMIT = 500; // adjust limit as needed
function checkDailyLimit(tokensUsed) {
  const today = new Date().toISOString().slice(0, 10);
  let usage = JSON.parse(localStorage.getItem("planetLLM_dailyUsage") || "{}");

  if (usage.date !== today) {
    usage = { date: today, tokens: 0 };
  }

  usage.tokens += tokensUsed;
  localStorage.setItem("planetLLM_dailyUsage", JSON.stringify(usage));

  if (usage.tokens >= DAILY_LIMIT) {
    createToast("🌍 You’ve reached your daily LLM usage. Save the planet!");
  }
}
