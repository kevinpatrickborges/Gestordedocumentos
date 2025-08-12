export enum StatusDesarquivamentoEnum {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export class StatusDesarquivamento {
  private readonly _value: StatusDesarquivamentoEnum;

  // Mapa de transições válidas
  private static readonly VALID_TRANSITIONS: Map<StatusDesarquivamentoEnum, StatusDesarquivamentoEnum[]> = new Map([
    [StatusDesarquivamentoEnum.PENDENTE, [StatusDesarquivamentoEnum.EM_ANDAMENTO, StatusDesarquivamentoEnum.CANCELADO]],
    [StatusDesarquivamentoEnum.EM_ANDAMENTO, [StatusDesarquivamentoEnum.CONCLUIDO, StatusDesarquivamentoEnum.CANCELADO, StatusDesarquivamentoEnum.PENDENTE]],
    [StatusDesarquivamentoEnum.CONCLUIDO, []], // Status final - não pode ser alterado
    [StatusDesarquivamentoEnum.CANCELADO, [StatusDesarquivamentoEnum.PENDENTE]], // Pode ser reaberto
  ]);

  constructor(value: StatusDesarquivamentoEnum) {
    if (!Object.values(StatusDesarquivamentoEnum).includes(value)) {
      throw new Error(`Status inválido: ${value}`);
    }
    this._value = value;
  }

  get value(): StatusDesarquivamentoEnum {
    return this._value;
  }

  equals(other: StatusDesarquivamento): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: StatusDesarquivamentoEnum): StatusDesarquivamento {
    return new StatusDesarquivamento(value);
  }

  static createPendente(): StatusDesarquivamento {
    return new StatusDesarquivamento(StatusDesarquivamentoEnum.PENDENTE);
  }

  static createEmAndamento(): StatusDesarquivamento {
    return new StatusDesarquivamento(StatusDesarquivamentoEnum.EM_ANDAMENTO);
  }

  static createConcluido(): StatusDesarquivamento {
    return new StatusDesarquivamento(StatusDesarquivamentoEnum.CONCLUIDO);
  }

  static createCancelado(): StatusDesarquivamento {
    return new StatusDesarquivamento(StatusDesarquivamentoEnum.CANCELADO);
  }

  // Verifica se pode transicionar para um novo status
  canTransitionTo(newStatus: StatusDesarquivamento): boolean {
    const allowedTransitions = StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
    return allowedTransitions.includes(newStatus._value);
  }

  // Obtém os status válidos para transição
  getValidTransitions(): StatusDesarquivamentoEnum[] {
    return StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
  }

  // Verifica se é um status final
  isFinal(): boolean {
    return this._value === StatusDesarquivamentoEnum.CONCLUIDO;
  }

  // Verifica se está cancelado
  isCancelled(): boolean {
    return this._value === StatusDesarquivamentoEnum.CANCELADO;
  }

  // Verifica se está em andamento
  isInProgress(): boolean {
    return this._value === StatusDesarquivamentoEnum.EM_ANDAMENTO;
  }

  // Verifica se está pendente
  isPending(): boolean {
    return this._value === StatusDesarquivamentoEnum.PENDENTE;
  }

  // Verifica se pode ser cancelado
  canBeCancelled(): boolean {
    return this.canTransitionTo(StatusDesarquivamento.createCancelado());
  }

  // Verifica se pode ser concluído
  canBeCompleted(): boolean {
    return this.canTransitionTo(StatusDesarquivamento.createConcluido());
  }

  // Obtém a cor associada ao status (para UI)
  getColor(): string {
    switch (this._value) {
      case StatusDesarquivamentoEnum.PENDENTE:
        return '#fbbf24'; // amarelo
      case StatusDesarquivamentoEnum.EM_ANDAMENTO:
        return '#3b82f6'; // azul
      case StatusDesarquivamentoEnum.CONCLUIDO:
        return '#10b981'; // verde
      case StatusDesarquivamentoEnum.CANCELADO:
        return '#ef4444'; // vermelho
      default:
        return '#6b7280'; // cinza
    }
  }

  // Obtém a descrição amigável do status
  getDescription(): string {
    switch (this._value) {
      case StatusDesarquivamentoEnum.PENDENTE:
        return 'Aguardando atendimento';
      case StatusDesarquivamentoEnum.EM_ANDAMENTO:
        return 'Em processo de atendimento';
      case StatusDesarquivamentoEnum.CONCLUIDO:
        return 'Atendimento concluído';
      case StatusDesarquivamentoEnum.CANCELADO:
        return 'Solicitação cancelada';
      default:
        return 'Status desconhecido';
    }
  }
}