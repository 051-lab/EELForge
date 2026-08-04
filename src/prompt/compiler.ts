import type { ProjectState } from '../domain';
import { buildArchitectPrompt } from './architect';
import { buildBuildPrompt } from './build';
import { buildOptimizePrompt } from './optimize';
import { buildRefinePrompt } from './refine';
import { buildRepairPrompt } from './repair';
import { buildReviewPrompt } from './review';
import type { CompiledPrompt } from './types';

export function compilePrompt(state: ProjectState): CompiledPrompt {
  switch (state.promptMode) {
    case 'architect': return buildArchitectPrompt(state);
    case 'build': return buildBuildPrompt(state);
    case 'repair': return buildRepairPrompt(state);
    case 'refine': return buildRefinePrompt(state);
    case 'optimize': return buildOptimizePrompt(state);
    case 'review': return buildReviewPrompt(state);
    default: {
      const exhaustive: never = state.promptMode;
      throw new Error(`Unsupported prompt mode: ${String(exhaustive)}`);
    }
  }
}

export function modeCompletion(state: ProjectState): { completed: number; total: number } {
  const requiredFields = compilePrompt(state).requiredFields;
  return {
    completed: requiredFields.filter((field) => field.filled).length,
    total: requiredFields.length,
  };
}
