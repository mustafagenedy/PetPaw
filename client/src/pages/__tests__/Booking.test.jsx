import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Booking from '../Booking';

vi.mock('../../api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
import api from '../../api';

beforeEach(() => {
  // Booking.jsx fetches /services in useEffect (unconditionally, per rules of hooks).
  // Default the mock to an empty list so the effect doesn't NPE in tests
  // that only care about the auth-gated UI.
  api.get.mockResolvedValue({ data: [] });
});

function renderBooking(user) {
  return render(
    <MemoryRouter>
      <Booking user={user} authReady={true} />
    </MemoryRouter>
  );
}

describe('Booking page', () => {
  it('shows a login-prompt card (not a disabled form) when the visitor is logged out', () => {
    renderBooking(null);
    expect(screen.getByRole('heading', { name: /log in to book/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register');
    // No form inputs for a logged-out visitor
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('for a logged-in visitor, fetches services and renders them as selectable radio cards', async () => {
    api.get.mockReset();
    api.get.mockResolvedValueOnce({
      data: [
        { _id: 's1', name: 'Bath & Brush', description: 'gentle', price: 25, duration: 30 },
        { _id: 's2', name: 'Full Groom', description: 'haircut + nails', price: 60, duration: 90 },
      ],
    });
    renderBooking({ id: 'u1', role: 'user' });
    // While loading, a skeleton is visible; wait for the radiogroup
    expect(await screen.findByRole('radiogroup', { name: /grooming service/i })).toBeInTheDocument();
    expect(screen.getByText('Bath & Brush')).toBeInTheDocument();
    expect(screen.getByText('Full Groom')).toBeInTheDocument();
    // Each card is a radio input, hidden visually but semantically present
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });
});
