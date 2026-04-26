import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';

vi.mock('../../api', () => ({
  default: { post: vi.fn() },
  setCsrfToken: vi.fn(),
}));
import api from '../../api';

function renderRegister(props = {}) {
  return render(
    <MemoryRouter>
      <Register onAuthSuccess={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

describe('Register page', () => {
  it('has a labelled optional phone field with tel semantics', () => {
    renderRegister();
    const phone = screen.getByLabelText(/phone/i);
    expect(phone).toHaveAttribute('type', 'tel');
    expect(phone).toHaveAttribute('autocomplete', 'tel');
    expect(phone).not.toBeRequired();
  });

  it('password field uses new-password autocomplete (so managers offer a strong one)', () => {
    renderRegister();
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'new-password');
  });

  it('submits all four fields — phone included when present', async () => {
    api.post.mockResolvedValueOnce({
      data: { user: { id: '1', name: 'A', email: 'a@t.local', role: 'user' } },
    });
    renderRegister();
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@t.local');
    await userEvent.type(screen.getByLabelText(/phone/i), '+201012345678');
    await userEvent.type(screen.getByLabelText(/password/i), 'longenoughpass1');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Alice',
      email: 'alice@t.local',
      phone: '+201012345678',
      password: 'longenoughpass1',
    });
  });
});
