import { createDefaultProject, type ProjectState } from './domain';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  build: () => ProjectState;
}

function preparedProject(name: string): ProjectState {
  const project = createDefaultProject();
  project.name = name;
  return project;
}

export const templates: readonly ProjectTemplate[] = [
  {
    id: 'warm-saturator',
    name: 'Warm Saturator',
    description: 'A starter brief for smooth harmonic density and restrained analog-style coloration.',
    build: () => {
      const p = preparedProject('Warm Saturator');
      p.vision = {
        purpose: 'Add musical saturation that thickens thin sources while remaining useful at subtle settings.',
        audibleGoal: 'Warm, full-bodied coloration with a smooth high end, gentle density, and progressively richer harmonics as drive increases.',
        sourceMaterial: 'Vocals, bass, drum buses, full mixes, and sources that feel thin or sterile.',
        definitionOfSuccess: 'The design should preserve clarity and transient identity at low settings, remain stable at 44.1 and 48 kHz, and include an explicit alias-management strategy.',
        preserve: 'Transient punch, stereo image, low-frequency solidity, and the source tonal balance at subtle settings.',
        avoid: 'Brittle upper mids, uncontrolled aliasing, pumping, DC buildup, or low-end thinning.',
        useLocation: 'Track, group bus, or master bus.',
        desiredControls: 'Drive, Character or Warmth, Output Trim, and Mix with smoothed mappings.',
        references: 'Tape and transformer saturation are inspiration only; do not claim hardware-identical modeling without evidence.',
      };
      return p;
    },
  },
  {
    id: 'transparent-limiter',
    name: 'Transparent Limiter',
    description: 'A low-latency limiter design brief with explicit peak-control and validation requirements.',
    build: () => {
      const p = preparedProject('Transparent Limiter');
      p.vision = {
        purpose: 'Control short peaks and increase usable level while minimizing pumping, distortion, and stereo-image movement.',
        audibleGoal: 'Mostly unobtrusive level control at moderate gain reduction, with predictable behavior when pushed harder.',
        sourceMaterial: 'Master bus, podcast voice, streaming playback, and mixes requiring output protection.',
        definitionOfSuccess: 'The architecture states its latency honestly, defines how peaks are detected, and includes a test plan for transient distortion and inter-sample overs.',
        preserve: 'Transient identity, stereo balance, tonal balance, and low-frequency impact.',
        avoid: 'Pumping, breathing, transient splatter, image shift, and unsupported true-peak compliance claims.',
        useLocation: 'Final output or master bus.',
        desiredControls: 'Threshold, Ceiling, Release, optional Lookahead, Output Gain, and Link behavior.',
        references: 'Modern transparent limiters are behavioral inspiration only.',
      };
      p.contract.cpuTarget = 'mobile-light';
      p.contract.channelMode = 'linked-stereo';
      p.contract.latencyMode = 'low';
      return p;
    },
  },
  {
    id: 'stereo-widener',
    name: 'Stereo Widener',
    description: 'A mid/side width brief with center preservation and mono-compatibility safeguards.',
    build: () => {
      const p = preparedProject('Stereo Widener');
      p.vision = {
        purpose: 'Increase or reduce perceived stereo width while protecting the center and low-frequency mono compatibility.',
        audibleGoal: 'A broader, more immersive image without hollow center energy or obvious phase artifacts.',
        sourceMaterial: 'Full mixes, drum buses, synth buses, and stereo tracks.',
        definitionOfSuccess: 'The design defines mono-downmix checks, center-energy limits, and stable behavior from mono through wide settings.',
        preserve: 'Center image, low-frequency weight, level consistency, and tonal balance.',
        avoid: 'Phase cancellation, center collapse, excessive side gain, or low-frequency instability.',
        useLocation: 'Master or group bus.',
        desiredControls: 'Width, low-frequency protection frequency, side balance, and output trim.',
        references: 'Mid/side processing theory and conservative mastering wideners.',
      };
      p.contract.cpuTarget = 'mobile-light';
      p.contract.channelMode = 'mid-side';
      p.contract.outputProtection = false;
      return p;
    },
  },
  {
    id: 'tape-character',
    name: 'Tape Character',
    description: 'A tape-inspired character brief focused on saturation, softening, and restrained motion.',
    build: () => {
      const p = preparedProject('Tape Character');
      p.vision = {
        purpose: 'Create tape-inspired density, level-dependent softening, gentle high-frequency shaping, and optional low-level motion.',
        audibleGoal: 'Cohesive, rounded, and subtly animated rather than obviously modulated or lo-fi.',
        sourceMaterial: 'Full mixes, drum buses, vocals, instruments, and system-wide playback.',
        definitionOfSuccess: 'The design remains numerically stable, explains alias control and sample-rate behavior, and keeps wow/flutter subtle at defaults.',
        preserve: 'Transient identity, stereo image, bass stability, and usable level.',
        avoid: 'Harsh aliasing, seasick modulation, DC drift, excessive rumble, or claims of exact machine emulation.',
        useLocation: 'Track, bus, master, or system-wide playback.',
        desiredControls: 'Drive, Character, HF Softening, Motion, Output Trim, and Mix.',
        references: 'Reel-to-reel behavior is inspiration; the implementation should be described by its actual DSP stages.',
      };
      return p;
    },
  },
] as const;

export function templateById(id: string): ProjectTemplate | undefined {
  return templates.find((template) => template.id === id);
}
