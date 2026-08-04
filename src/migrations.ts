import {
  createDefaultProject,
  promptModes,
  stages,
  type ChannelMode,
  type CpuTarget,
  type HostProfileId,
  type LatencyMode,
  type ProjectState,
} from './domain.js';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? value as T : fallback;
}

function sampleRates(value: unknown, fallback: number[]): number[] {
  if (!Array.isArray(value)) return fallback;
  const rates = value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item) && item >= 8000 && item <= 768000);
  return rates.length ? rates : fallback;
}

export function migrateProject(candidate: unknown): ProjectState {
  const defaults = createDefaultProject();
  const root = record(candidate);
  const vision = record(root.vision);
  const contract = record(root.contract);

  return {
    ...defaults,
    schemaVersion: 2,
    appVersion: '0.1.0-alpha.3',
    id: stringValue(root.id, defaults.id),
    name: stringValue(root.name),
    createdAt: stringValue(root.createdAt, defaults.createdAt),
    updatedAt: stringValue(root.updatedAt, defaults.updatedAt),
    activeStage: stringEnum(root.activeStage, stages, defaults.activeStage),
    promptMode: stringEnum(root.promptMode, promptModes, 'architect'),
    vision: {
      purpose: stringValue(vision.purpose),
      audibleGoal: stringValue(vision.audibleGoal),
      sourceMaterial: stringValue(vision.sourceMaterial),
      definitionOfSuccess: stringValue(vision.definitionOfSuccess),
      preserve: stringValue(vision.preserve),
      avoid: stringValue(vision.avoid),
      useLocation: stringValue(vision.useLocation),
      desiredControls: stringValue(vision.desiredControls),
      references: stringValue(vision.references),
    },
    contract: {
      hostProfileId: stringEnum(contract.hostProfileId, ['rjdsp-modern', 'rjdsp-legacy', 'eel-vm-core'] as const, defaults.contract.hostProfileId) as HostProfileId,
      channelMode: stringEnum(contract.channelMode, ['mono', 'stereo', 'linked-stereo', 'dual-mono', 'mid-side'] as const, defaults.contract.channelMode) as ChannelMode,
      sampleRates: sampleRates(contract.sampleRates, defaults.contract.sampleRates),
      latencyMode: stringEnum(contract.latencyMode, ['zero', 'low', 'allowed'] as const, defaults.contract.latencyMode) as LatencyMode,
      cpuTarget: stringEnum(contract.cpuTarget, ['mobile-light', 'mobile-balanced', 'desktop-quality'] as const, defaults.contract.cpuTarget) as CpuTarget,
      deviceTargets: stringValue(contract.deviceTargets, defaults.contract.deviceTargets),
      parameterSmoothing: booleanValue(contract.parameterSmoothing, defaults.contract.parameterSmoothing),
      outputProtection: booleanValue(contract.outputProtection, defaults.contract.outputProtection),
      constraints: stringValue(contract.constraints),
    },
    onboardingDismissed: booleanValue(root.onboardingDismissed, false),
  };
}
