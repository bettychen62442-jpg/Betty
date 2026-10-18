import { AIProvider } from "./types";
import { mockProvider } from "./providers/mock.provider";

const providers: Record<string, () => AIProvider> = {
  mock: () => mockProvider,
};

export function getAIProvider(name?: string): AIProvider {
  const key = name || process.env.AI_PROVIDER || "mock";
  const factory = providers[key];
  if (!factory) {
    throw new Error(
      `Unknown AI provider: "${key}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return factory();
}

export function registerAIProvider(name: string, factory: () => AIProvider): void {
  providers[name] = factory;
}
