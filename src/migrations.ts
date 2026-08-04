import {
  APP_VERSION,
  PROJECT_SCHEMA_VERSION,
  createDefaultProject,
  promptModes,
  stages,
  type ChannelMode,
  type CpuTarget,
  type HostProfileId,
  type LatencyMode,
  type ProjectState,
  type PromptMode,
} from './domain';

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(record: UnknownRecord, key: string, fallback = ''): string {
  return typeof record[key] === 'string' ? record[key] : fallback;
}

function booleanValue(record: UnknownRecord, key: string, fallback: boolean): boolean {
  return typeof record[key] === 'boolean' ? record[key] : fallback;
}

function enumValue<T extends string>(record: UnknownRecord, key: string, allowed: readonly T[], fallback: T): T {
  const value = record[key];
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function numberArrayValue(record: UnknownRecord, key: string, fallback: number[]): number[] {
  const value = record[key];
  if (!Array.isArray(value)) return [...fallback];
  const valid = value.filter(
    (item): item is number => typeof item === 'number' && Number.isFinite(item) && item >= 8000 && item <= 768000,
  );
  return valid.length > 0 ? valid : [...fallback];
}

export function unwrapProjectCandidate(value: unknown): unknown {
  if (isRecord(value) && 'project' in value) return value.project;
  return value;
}

export function isRecognizableProject(value: unknown): boolean {
  const candidate = unwrapProjectCandidate(value);
  if (!isRecord(candidate)) return false;
  const schema = candidate.schemaVersion;
  if (schema === 1 || schema === 2 || schema === 3) return true;
  return isRecord(candidate.vision) && isRecord(candidate.contract)
    && (Object.keys(candidate.vision).length > 0 || Object.keys(candidate.contract).length > 0);
}

export function migrateProject(value: unknown): ProjectState {
  const candidate = unwrapProjectCandidate(value);
  if (!isRecord(candidate)) throw new Error('Project data must be an object.');
  if (!isRecognizableProject(candidate)) throw new Error('Unsupported EELForge project structure.');

  const defaults = createDefaultProject();
  const schema = candidate.schemaVersion;
  if (schema !== undefined && schema !== 1 && schema !== 2 && schema !== 3) {
    throw new Error('Unsupported EELForge project schema.');
  }

  const vision = isRecord(candidate.vision) ? candidate.vision : {};
  const contract = isRecord(candidate.contract) ? candidate.contract : {};
  const originalName = stringValue(candidate, 'name', defaults.name);
  const migratedName = schema === 1 && originalName === 'Untitled EEL Effect' ? '' : originalName;

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    id: stringValue(candidate, 'id', defaults.id),
    name: migratedName,
    createdAt: stringValue(candidate, 'createdAt', defaults.createdAt),
    updatedAt: stringValue(candidate, 'updatedAt', defaults.updatedAt),
    activeStage: enumValue(candidate, 'activeStage', stages, defaults.activeStage),
    promptMode: enumValue(candidate, 'promptMode', promptModes, 'architect') as PromptMode,
    vision: {
      purpose: stringValue(vision, 'purpose'),
      audibleGoal: stringValue(vision, 'audibleGoal'),
      sourceMaterial: stringValue(vision, 'sourceMaterial'),
      definitionOfSuccess: stringValue(vision, 'definitionOfSuccess'),
      preserve: stringValue(vision, 'preserve'),
      avoid: stringValue(vision, 'avoid'),
      useLocation: stringValue(vision, 'useLocation'),
      desiredControls: stringValue(vision, 'desiredControls'),
      references: stringValue(vision, 'references'),
    },
    contract: {
      hostProfileId: enumValue(
        contract,
        'hostProfileId',
        ['rjdsp-modern', 'rjdsp-legacy', 'eel-vm-core'] as const,
        defaults.contract.hostProfileId,
      ) as HostProfileId,
      channelMode: enumValue(
        contract,
        'channelMode',
        ['mono', 'stereo', 'linked-stereo', 'dual-mono', 'mid-side'] as const,
        defaults.contract.channelMode,
      ) as ChannelMode,
      sampleRates: numberArrayValue(contract, 'sampleRates', defaults.contract.sampleRates),
      latencyMode: enumValue(
        contract,
        'latencyMode',
        ['zero', 'low', 'allowed'] as const,
        defaults.contract.latencyMode,
      ) as LatencyMode,
      cpuTarget: enumValue(
        contract,
        'cpuTarget',
        ['mobile-light', 'mobile-balanced', 'desktop-quality'] as const,
        defaults.contract.cpuTarget,
      ) as CpuTarget,
      deviceTargets: stringValue(contract, 'deviceTargets', defaults.contract.deviceTargets),
      parameterSmoothing: booleanValue(contract, 'parameterSmoothing', defaults.contract.parameterSmoothing),
      outputProtection: booleanValue(contract, 'outputProtection', defaults.contract.outputProtection),
      constraints: stringValue(contract, 'constraints'),
    },
    architectureReport: stringValue(candidate, 'architectureReport'),
    eel2Script: stringValue(candidate, 'eel2Script'),
    iterationNote: stringValue(candidate, 'iterationNote'),
    onboardingDismissed: booleanValue(candidate, 'onboardingDismissed', defaults.onboardingDismissed),
  };
}
