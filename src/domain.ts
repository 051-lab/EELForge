export type WorkflowStage = 'vision' | 'architect' | 'prompt' | 'analyze' | 'refine';
export type HostProfileId = 'rjdsp-modern' | 'rjdsp-legacy' | 'eel-vm-core';
export type ChannelMode = 'mono' | 'stereo' | 'linked-stereo' | 'dual-mono' | 'mid-side';
export type CpuTarget = 'mobile-light' | 'mobile-balanced' | 'desktop-quality';
export type LatencyMode = 'zero' | 'low' | 'allowed';
export type PromptMode = 'architect' | 'build' | 'repair' | 'refine' | 'optimize' | 'review';

export interface VisionState {
  purpose: string;
  audibleGoal: string;
  sourceMaterial: string;
  definitionOfSuccess: string;
  preserve: string;
  avoid: string;
  useLocation: string;
  desiredControls: string;
  references: string;
}

export interface ContractState {
  hostProfileId: HostProfileId;
  channelMode: ChannelMode;
  sampleRates: number[];
  latencyMode: LatencyMode;
  cpuTarget: CpuTarget;
  deviceTargets: string;
  parameterSmoothing: boolean;
  outputProtection: boolean;
  constraints: string;
}

export interface ProjectState {
  schemaVersion: 2;
  appVersion: '0.1.0-alpha.3';
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeStage: WorkflowStage;
  promptMode: PromptMode;
  vision: VisionState;
  contract: ContractState;
  onboardingDismissed: boolean;
}

export const stages: readonly WorkflowStage[] = [
  'vision',
  'architect',
  'prompt',
  'analyze',
  'refine',
] as const;

export const promptModes: readonly PromptMode[] = [
  'architect',
  'build',
  'repair',
  'refine',
  'optimize',
  'review',
] as const;

export const hostLabels: Readonly<Record<HostProfileId, string>> = {
  'rjdsp-modern': 'RootlessJamesDSP Modern',
  'rjdsp-legacy': 'RootlessJamesDSP Legacy',
  'eel-vm-core': 'Generic EEL2 / EEL_VM',
};

export const hostSections: Readonly<Record<HostProfileId, readonly string[]>> = {
  'rjdsp-modern': ['@init', '@slider', '@block', '@sample'],
  'rjdsp-legacy': ['@init', '@sample'],
  'eel-vm-core': [],
};

export function createDefaultProject(): ProjectState {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    appVersion: '0.1.0-alpha.3',
    id: crypto.randomUUID(),
    name: '',
    createdAt: now,
    updatedAt: now,
    activeStage: 'vision',
    promptMode: 'architect',
    vision: {
      purpose: '',
      audibleGoal: '',
      sourceMaterial: '',
      definitionOfSuccess: '',
      preserve: '',
      avoid: '',
      useLocation: '',
      desiredControls: '',
      references: '',
    },
    contract: {
      hostProfileId: 'rjdsp-modern',
      channelMode: 'stereo',
      sampleRates: [44100, 48000],
      latencyMode: 'zero',
      cpuTarget: 'mobile-balanced',
      deviceTargets: 'Galaxy S10; Galaxy S24 Ultra',
      parameterSmoothing: true,
      outputProtection: true,
      constraints: '',
    },
    onboardingDismissed: false,
  };
}
