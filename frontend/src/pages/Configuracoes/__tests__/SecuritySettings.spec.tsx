import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecuritySettings } from '../SecuritySettings';

describe('SecuritySettings', () => {
  it('should render the session card', () => {
    render(<SecuritySettings />);

    expect(screen.getByText('Sessão')).toBeInTheDocument();
    expect(screen.getByLabelText('Tempo limite da sessão (minutos)')).toBeInTheDocument();
  });

  it('should render the authentication card', () => {
    render(<SecuritySettings />);

    expect(screen.getByText('Autenticação')).toBeInTheDocument();
    expect(screen.getByText('Autenticação de dois fatores')).toBeInTheDocument();
  });

  it('should change session timeout when input is changed', () => {
    render(<SecuritySettings />);

    const input = screen.getByLabelText('Tempo limite da sessão (minutos)');
    fireEvent.change(input, { target: { value: '60' } });

    expect(input.value).toBe('60');
  });
});
