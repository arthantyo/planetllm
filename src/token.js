import { Tiktoken } from "js-tiktoken";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";

const enc = new Tiktoken(cl100k_base);

export function calculateTokens(promptText) {
  if (!promptText || !promptText.trim()) return 0;

  return enc.encode(promptText).length;
}
