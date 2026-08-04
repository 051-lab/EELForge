export const APP_VERSION = '0.2.0' as const;
export const PROJECT_SCHEMA_VERSION = 3 as const;

export const stages = ['vision', 'architect', 'build', 'iterate'] as const;
export type Stage = (typeof stages)[number];

export const promptModes = ['architect', 'build', 'repair', 'refine', 'optimize', 'review'] as const;
export type PromptMode = (typeof promptModes)[number];

export type HostProfileId = 'rjdsp-modern' | 'rjdsp-legacy' | 'eel-vm-core';
export type ChannelMode = 'mono' | 'stereo' | 'linked-stereo' | 'dual-mono' | 'mid-side';
export type LatencyMode = 'zero' | 'low' | 'allowed';
export type CpuTarget = 'mobile-light' | 'mobile-balanced' | 'desktop-quality';

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
  schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  appVersion: typeof APP_VERSION;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeStage: Stage;
  promptMode: PromptMode;
  vision: VisionState;
  contract: ContractState;
  architectureReport: string;
  eel2Script: string;
  iterationNote: string;
  onboardingDismissed: boolean;
}

export interface ProjectFactoryOptions {
  id?: string;
  now?: string;
}

export function createDefaultProject(options: ProjectFactoryOptions = {}): ProjectState {
  const now = options.now ?? new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    id: options.id ?? crypto.randomUUID(),
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
    architectureReport: '',
    eel2Script: '',
    iterationNote: '',
    onboardingDismissed: false,
  };
}
