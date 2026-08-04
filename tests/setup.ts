import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:eelforge-test') });
Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });

if (typeof File.prototype.text !== 'function') {
  Object.defineProperty(File.prototype, 'text', {
    configurable: true,
    value(this: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error('Could not read test file.'));
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.readAsText(this);
      });
    },
  });
}
