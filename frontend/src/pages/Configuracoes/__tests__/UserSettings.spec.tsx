import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettings } from '../UserSettings';
import { AuthProvider } from '@/contexts/AuthContext';

describe('UserSettings', () => {
  it('should render the profile card', () => {
    render(
      <AuthProvider>
        <UserSettings />
      </AuthProvider>
    );

    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
  });

  it('should render the change password card', () => {
    render(
      <AuthProvider>
        <UserSettings />
      </AuthProvider>
    );

    expect(screen.getByText('Alterar Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
  });

  it('should render the preferences card', () => {
    render(
      <AuthProvider>
        <UserSettings />
      </AuthProvider>
    );

    expect(screen.getByText('Preferências')).toBeInTheDocument();
    expect(screen.getByText('Salvamento automático')).toBeInTheDocument();
  });

  it('should change items per page when select is changed', () => {
    render(
      <AuthProvider>
        <UserSettings />
      </AuthProvider>
    );

    const select = screen.getByLabelText('Itens por página');
    fireEvent.change(select, { target: { value: '25' } });

    expect(select.value).toBe('25');
  });
});
