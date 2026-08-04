import type { ProjectState } from '../domain.js';
import { buildArchitectPrompt } from './architect.js';
import type { CompiledPrompt } from './types.js';

export function compilePrompt(state: ProjectState): CompiledPrompt {
  if (state.promptMode === 'architect') return buildArchitectPrompt(state);
  return buildArchitectPrompt({ ...state, promptMode: 'architect' });
}
