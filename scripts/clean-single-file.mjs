import { rm } from 'node:fs/promises';
import release from '../release.json' with { type: 'json' };
await rm(`releases/${release.artifactName}.tmp`, { force: true });
