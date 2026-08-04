import type { PromptMode } from '../domain.js';

export type PromptReadiness = 'draft' | 'ready';

export interface CompiledPrompt {
  mode: PromptMode;
  title: string;
  text: string;
  characterCount: number;
  readiness: PromptReadiness;
  missingRequiredFields: string[];
}
