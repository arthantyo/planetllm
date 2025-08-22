export function getProvider() {
  const host = window.location.hostname;
  if (host.includes("chatgpt") || host.includes("openai")) return "chatgpt";
  if (host.includes("claude") || host.includes("anthropic")) return "claude";
  if (host.includes("gemini") || host.includes("bard")) return "gemini";
  return "unknown";
}
