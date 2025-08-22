export function getTotals(provider) {
  const data = JSON.parse(localStorage.getItem("planetLLM-totals") || "{}");
  const today = new Date().toDateString(); // e.g., "Fri Aug 23 2025"

  if (!data[provider] || data[provider].date !== today) {
    // Reset totals if it's a new day
    data[provider] = { tokens: 0, energy: 0, water: 0, co2: 0, date: today };
    localStorage.setItem("planetLLM-totals", JSON.stringify(data));
  }

  return data[provider];
}

export function saveTotals(provider, totals) {
  const data = JSON.parse(localStorage.getItem("planetLLM-totals") || "{}");
  data[provider] = { ...totals, date: new Date().toDateString() };
  localStorage.setItem("planetLLM-totals", JSON.stringify(data));
}
