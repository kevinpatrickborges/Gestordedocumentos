import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralSettings } from '../GeneralSettings';
import { ThemeProvider } from '@/contexts/ThemeContext';

describe('GeneralSettings', () => {
  it('should render the appearance card', () => {
    render(
      <ThemeProvider>
        <GeneralSettings />
      </ThemeProvider>
    );

    expect(screen.getByText('Aparência')).toBeInTheDocument();
    expect(screen.getByText('Modo escuro')).toBeInTheDocument();
  });

  it('should render the language card', () => {
    render(
      <ThemeProvider>
        <GeneralSettings />
      </ThemeProvider>
    );

    expect(screen.getByText('Idioma')).toBeInTheDocument();
    expect(screen.getByLabelText('Idioma do sistema')).toBeInTheDocument();
  });

  it('should render the notifications card', () => {
    render(
      <ThemeProvider>
        <GeneralSettings />
      </ThemeProvider>
    );

    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Som')).toBeInTheDocument();
  });

  it('should change language when select is changed', () => {
    render(
      <ThemeProvider>
        <GeneralSettings />
      </ThemeProvider>
    );

    const select = screen.getByLabelText('Idioma do sistema');
    fireEvent.change(select, { target: { value: 'en-US' } });

    expect(select.value).toBe('en-US');
  });
});
