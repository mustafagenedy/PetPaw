import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

// Replace the shared axios instance with a mock we can assert against.
vi.mock('../../api', () => ({
  default: { post: vi.fn() },
}));
import api from '../../api';

function renderLogin(props = {}) {
  return render(
    <MemoryRouter>
      <Login onAuthSuccess={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  it('renders a labelled form with password-manager friendly autocomplete', () => {
    renderLogin();
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
  });

  it('submits credentials to /auth/login and calls onAuthSuccess with the user', async () => {
    const onAuthSuccess = vi.fn();
    api.post.mockResolvedValueOnce({
      data: { user: { id: '1', name: 'A', email: 'a@t.local', role: 'user' } },
    });
    renderLogin({ onAuthSuccess });
    await userEvent.type(screen.getByLabelText(/email/i), 'a@t.local');
    await userEvent.type(screen.getByLabelText(/password/i), 'longenoughpass1');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@t.local',
      password: 'longenoughpass1',
    });
    expect(onAuthSuccess).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@t.local' }));
  });

  it('shows the server error message when login fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@t.local');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
