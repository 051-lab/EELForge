import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { readyArchitectProject } from '../fixtures';
import { testStore } from '../test-store';

function readyStore() {
  const store = testStore();
  store.createProject(() => readyArchitectProject());
  store.dispatch({ type: 'set-path', path: 'onboardingDismissed', value: true });
  store.flush();
  return store;
}

describe('six-mode workspace', () => {
  it('keeps focus and the full value during continuous typing', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    const purpose = screen.getByLabelText('What should this plugin do?');
    await user.clear(purpose);
    await user.type(purpose, 'A complete continuous sentence.');
    expect(purpose).toHaveFocus();
    expect(purpose).toHaveValue('A complete continuous sentence.');
    expect(store.activeProject?.vision.purpose).toBe('A complete continuous sentence.');
  });

  it('shows the correct mode-specific fields', async () => {
    const user = userEvent.setup();
    render(<App store={readyStore()} />);
    await user.click(screen.getByRole('button', { name: 'Build' }));
    expect(screen.getByLabelText('Approved architecture report')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Repair' }));
    expect(screen.getByLabelText('Current EEL2 script')).toBeInTheDocument();
    expect(screen.getByLabelText('Problem description')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Refine' }));
    expect(screen.getByLabelText('Refinement goal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Optimize' }));
    expect(screen.getByLabelText('Optimization notes (optional)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByLabelText('EEL2 script to review')).toBeInTheDocument();
    expect(screen.queryByText('Compare')).not.toBeInTheDocument();
  });

  it('promotes an external architecture result into Build and uses it immediately', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    const intake = screen.getByRole('textbox', { name: 'External agent result' });
    await user.type(intake, '# Approved architecture\n\nUse a safe filter.');
    await user.click(screen.getByRole('button', { name: 'Promote to Build' }));
    expect(store.activeProject?.architectureReport).toBe('# Approved architecture\n\nUse a safe filter.');
    expect(store.activeProject?.promptMode).toBe('build');
    expect(screen.getByLabelText('Approved architecture report')).toHaveValue('# Approved architecture\n\nUse a safe filter.');
  });

  it('promotes iteration results into Review, rejects empty input, and protects overwrites', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: 'Repair' }));
    const intake = screen.getByRole('textbox', { name: 'External agent result' });
    expect(screen.getByRole('button', { name: 'Promote to Review' })).toBeDisabled();
    await user.type(intake, 'new script');
    await user.click(screen.getByRole('button', { name: 'Promote to Review' }));
    expect(store.activeProject?.eel2Script).toBe('new script');
    expect(store.activeProject?.promptMode).toBe('review');

    await user.click(screen.getByRole('button', { name: 'Repair' }));
    await user.type(screen.getByRole('textbox', { name: 'External agent result' }), 'replacement');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(screen.getByRole('button', { name: 'Promote to Review' }));
    expect(store.activeProject?.eel2Script).toBe('new script');
    expect(store.activeProject?.promptMode).toBe('repair');
  });

  it.each([
    ['Build', 'build-specific script'],
    ['Repair', 'repair-specific script'],
    ['Refine', 'refine-specific script'],
    ['Optimize', 'optimize-specific script'],
  ])('directly promotes from %s into Review and compiles the script', async (mode, script) => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: mode }));
    const intake = screen.getByRole('textbox', { name: 'External agent result' });
    const promote = screen.getByRole('button', { name: 'Promote to Review' });
    expect(promote).toBeInTheDocument();
    await user.type(intake, script);
    await user.click(promote);
    expect(store.activeProject?.eel2Script).toBe(script);
    expect(store.activeProject?.promptMode).toBe('review');
    expect(screen.getByLabelText('EEL2 script to review')).toHaveValue(script);
    expect(screen.getByTestId('compiled-prompt')).toHaveTextContent(script);
  });

  it('keeps Review terminal by exposing no artifact promotion intake or action', async () => {
    const user = userEvent.setup();
    render(<App store={readyStore()} />);
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.queryByRole('textbox', { name: 'External agent result' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Promote to Review' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Promote to Build' })).not.toBeInTheDocument();
  });

  it('rejects whitespace-only promotion without changing the artifact or mode', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: 'Repair' }));
    const intake = screen.getByRole('textbox', { name: 'External agent result' });
    await user.type(intake, ' \n\t ');
    expect(screen.getByRole('button', { name: 'Promote to Review' })).toBeDisabled();
    expect(store.activeProject?.eel2Script).toBe('');
    expect(store.activeProject?.promptMode).toBe('repair');
  });

  it('confirms a materially different overwrite before advancing to Review', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    store.dispatch({ type: 'set-path', path: 'eel2Script', value: 'old script' });
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: 'Repair' }));
    await user.type(screen.getByRole('textbox', { name: 'External agent result' }), 'new script');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Promote to Review' }));
    expect(store.activeProject?.eel2Script).toBe('new script');
    expect(store.activeProject?.promptMode).toBe('review');
    expect(store.activeProject?.vision.purpose).toBe(readyArchitectProject().vision.purpose);
  });

  it('clears unpromoted intake when opening another project', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    const projectA = store.activeId;
    await user.type(screen.getByRole('textbox', { name: 'External agent result' }), 'project A result');
    await user.click(screen.getByRole('button', { name: 'Dashboard' }));
    await user.click(screen.getAllByRole('button', { name: 'New Project' })[1]);
    expect(store.activeId).not.toBe(projectA);
    expect(screen.getByRole('textbox', { name: 'External agent result' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Promote to Build' })).toBeDisabled();
  });

  it('clears intake when changing source modes', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    await user.type(screen.getByRole('textbox', { name: 'External agent result' }), 'architecture result');
    await user.click(screen.getByRole('button', { name: 'Repair' }));
    expect(screen.getByRole('textbox', { name: 'External agent result' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Promote to Review' })).toBeDisabled();
  });

  it('updates punctuation-only readiness and reports clipboard rejection', async () => {
    const user = userEvent.setup();
    const store = readyStore();
    render(<App store={store} />);
    const purpose = screen.getByLabelText('What should this plugin do?');
    await user.clear(purpose);
    await user.type(purpose, '...');
    expect(screen.getByText(/Missing: plugin purpose/i)).toBeInTheDocument();

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) } });
    await user.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(screen.getByRole('status')).toHaveTextContent('Clipboard access was blocked');
  });

  it('persists onboarding dismissal and preserves identity through versions', async () => {
    const user = userEvent.setup();
    const store = testStore();
    store.createProject();
    const id = store.activeId;
    const createdAt = store.activeProject?.createdAt;
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: 'Got it, let’s start' }));
    expect(store.activeProject?.onboardingDismissed).toBe(true);

    vi.spyOn(window, 'prompt').mockReturnValue('Before edit');
    await user.click(screen.getByRole('button', { name: 'Save Version' }));
    expect(store.activeEntry?.versions).toHaveLength(1);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Restore' }));
    expect(store.activeProject?.id).toBe(id);
    expect(store.activeProject?.createdAt).toBe(createdAt);
  });
});
