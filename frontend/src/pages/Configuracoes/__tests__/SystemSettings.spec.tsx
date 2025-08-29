import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSettings } from '../SystemSettings';

describe('SystemSettings', () => {
  it('should render the backup and recovery card', () => {
    render(<SystemSettings />);

    expect(screen.getByText('Backup e Recuperação')).toBeInTheDocument();
    expect(screen.getByText('Backup automático')).toBeInTheDocument();
  });

  it('should render the logs and monitoring card', () => {
    render(<SystemSettings />);

    expect(screen.getByText('Logs e Monitoramento')).toBeInTheDocument();
    expect(screen.getByLabelText('Nível de log')).toBeInTheDocument();
  });

  it('should render the maintenance card', () => {
    render(<SystemSettings />);

    expect(screen.getByText('Manutenção')).toBeInTheDocument();
    expect(screen.getByText('Modo manutenção')).toBeInTheDocument();
  });

  it('should change backup frequency when select is changed', () => {
    render(<SystemSettings />);

    const select = screen.getByLabelText('Frequência do backup');
    fireEvent.change(select, { target: { value: 'weekly' } });

    expect(select.value).toBe('weekly');
  });
});
