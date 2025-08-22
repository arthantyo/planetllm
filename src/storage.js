export function getTotals(provider) {
  const data = JSON.parse(localStorage.getItem("planetLLM-totals") || "{}");
  return data[provider] || { tokens: 0, energy: 0, water: 0, co2: 0 };
}

export function saveTotals(provider, totals) {
  const data = JSON.parse(localStorage.getItem("planetLLM-totals") || "{}");
  console.log(data);
  data[provider] = totals;
  localStorage.setItem("planetLLM-totals", JSON.stringify(data));
}
