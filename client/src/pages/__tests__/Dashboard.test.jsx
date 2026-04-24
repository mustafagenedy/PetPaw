import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

vi.mock('../../api', () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}));
import api from '../../api';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard page', () => {
  it('when the user has no bookings, shows a big empty-state card with the "Book an appointment" CTA', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings/me') return Promise.resolve({ data: [] });
      if (url === '/contact/user') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('unexpected GET: ' + url));
    });
    renderDashboard();
    expect(await screen.findByRole('heading', { name: /no bookings yet/i })).toBeInTheDocument();
    const cta = await screen.findByRole('link', { name: /book an appointment/i });
    expect(cta).toHaveAttribute('href', '/booking');
  });

  it('renders a status badge per booking and marks cancelled rows visibly different', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings/me') return Promise.resolve({ data: [
        { _id: 'b1', service: { name: 'Bath' }, date: '2030-01-01T12:00:00.000Z', status: 'pending' },
        { _id: 'b2', service: { name: 'Full Groom' }, date: '2030-01-02T12:00:00.000Z', status: 'cancelled' },
      ] });
      if (url === '/contact/user') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('unexpected GET: ' + url));
    });
    renderDashboard();
    expect(await screen.findByText('Bath')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('cancelled')).toBeInTheDocument();
    // Cancel button should be disabled on the cancelled row
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    expect(cancelButtons[1]).toBeDisabled();
  });
});
