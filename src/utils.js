export function getProvider() {
  const host = window.location.hostname;
  if (host.includes("chatgpt") || host.includes("openai")) return "chatgpt";
  if (host.includes("claude") || host.includes("anthropic")) return "claude";
  if (host.includes("gemini") || host.includes("bard")) return "gemini";
  return "unknown";
}

export function formatEnergy(kWh) {
  if (kWh < 0.001) return `${(kWh * 1000).toFixed(3)} Wh`;
  if (kWh < 1) return `${kWh.toFixed(6)} kWh`;
  return `${(kWh / 1000).toFixed(6)} MWh`;
}
export function formatWater(L) {
  if (L < 0.001) return `${(L * 1_000_000).toFixed(1)} μL`;
  if (L < 1) return `${(L * 1000).toFixed(2)} mL`;
  return `${L.toFixed(3)} L`;
}

export function formatCO2(kg) {
  if (kg < 0.001) return `${(kg * 1_000_000).toFixed(1)} mg`;
  if (kg < 1) return `${(kg * 1000).toFixed(2)} g`;
  return `${kg.toFixed(3)} kg`;
}
