import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { serializeProjectExport } from '../../src/import-export';
import { readyArchitectProject } from '../fixtures';
import { testStore } from '../test-store';

describe('dashboard lifecycle', () => {
  it('creates, searches, renames, duplicates, opens, and confirms named deletion', async () => {
    const user = userEvent.setup();
    const store = testStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: 'New Project' }));
    expect(screen.getByText('Welcome to EELForge')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dashboard' }));

    vi.spyOn(window, 'prompt').mockReturnValue('Renamed Project');
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    expect(screen.getByText('Renamed Project')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await user.click(screen.getByRole('button', { name: 'Dashboard' }));
    expect(screen.getAllByText(/Renamed Project/)).toHaveLength(2);

    await user.type(screen.getByLabelText('Search projects'), 'copy');
    expect(screen.getByText('Renamed Project (copy)')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Search projects'));

    const cards = screen.getAllByRole('article');
    const originalCard = cards.find((card) => within(card).queryByText('Renamed Project'))!;
    await user.click(within(originalCard).getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('heading', { name: 'Delete “Renamed Project”?' })).toBeInTheDocument();
  });

  it('rejects arbitrary JSON and imports the same project with distinct identities', async () => {
    const user = userEvent.setup();
    const store = testStore();
    render(<App store={store} />);
    const input = screen.getByLabelText('Import') as HTMLInputElement;
    await user.upload(input, new File(['{}'], 'bad.json', { type: 'application/json' }));
    expect(screen.getByRole('status')).toHaveTextContent('This file is not a recognizable EELForge project.');
    expect(store.entries).toHaveLength(0);

    const exported = serializeProjectExport(readyArchitectProject());
    await user.upload(input, new File([exported], 'project.json', { type: 'application/json' }));
    await user.click(screen.getByRole('button', { name: 'Dashboard' }));
    const inputAgain = screen.getByLabelText('Import') as HTMLInputElement;
    await user.upload(inputAgain, new File([exported], 'project.json', { type: 'application/json' }));
    expect(store.entries).toHaveLength(2);
    expect(new Set(store.entries.map((entry) => entry.project.id)).size).toBe(2);
  });
});
