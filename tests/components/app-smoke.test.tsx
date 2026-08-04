import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import { testStore } from '../test-store';

describe('App shell', () => {
  it('renders the v0.2 dashboard', () => {
    render(<App store={testStore()} />);
    expect(screen.getByText('EELFORGE')).toBeInTheDocument();
    expect(screen.getByText('v0.2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'EELForge Projects' })).toBeInTheDocument();
  });
});
