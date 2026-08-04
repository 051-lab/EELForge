import type { PromptMode } from '../domain';

export type PromptReadiness = 'draft' | 'ready';

export interface CompiledPrompt {
  mode: PromptMode;
  title: string;
  text: string;
  characterCount: number;
  readiness: PromptReadiness;
  missingRequiredFields: string[];
  requiredFields: { label: string; filled: boolean }[];
}
