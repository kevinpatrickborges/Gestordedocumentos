import {
  DesarquivamentoId,
  CodigoBarras,
  NumeroRegistro,
  StatusDesarquivamento,
  StatusDesarquivamentoEnum,
  TipoSolicitacao,
  TipoSolicitacaoEnum,
} from '../value-objects';

export interface DesarquivamentoDomainProps {
  id?: DesarquivamentoId;
  codigoBarras: CodigoBarras;
  tipoSolicitacao: TipoSolicitacao;
  status: StatusDesarquivamento;
  nomeSolicitante: string;
  nomeVitima?: string;
  numeroRegistro: NumeroRegistro;
  tipoDocumento?: string;
  dataFato?: Date;
  prazoAtendimento?: Date;
  dataAtendimento?: Date;
  resultadoAtendimento?: string;
  finalidade?: string;
  observacoes?: string;
  urgente: boolean;
  localizacaoFisica?: string;
  criadoPorId: number;
  responsavelId?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class DesarquivamentoDomain {
  private constructor(
    private readonly _id: DesarquivamentoId | undefined,
    private readonly _codigoBarras: CodigoBarras,
    private readonly _tipoSolicitacao: TipoSolicitacao,
    private _status: StatusDesarquivamento,
    private readonly _nomeSolicitante: string,
    private readonly _nomeVitima: string | undefined,
    private readonly _numeroRegistro: NumeroRegistro,
    private readonly _tipoDocumento: string | undefined,
    private readonly _dataFato: Date | undefined,
    private _prazoAtendimento: Date | undefined,
    private _dataAtendimento: Date | undefined,
    private _resultadoAtendimento: string | undefined,
    private readonly _finalidade: string | undefined,
    private readonly _observacoes: string | undefined,
    private readonly _urgente: boolean,
    private _localizacaoFisica: string | undefined,
    private readonly _criadoPorId: number,
    private _responsavelId: number | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | undefined,
  ) {
    this.validate();
  }

  // Factory method para criar nova instância
  static create(
    props: Omit<DesarquivamentoDomainProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): DesarquivamentoDomain {
    const now = new Date();

    return new DesarquivamentoDomain(
      undefined, // ID será gerado pelo repositório
      props.codigoBarras,
      props.tipoSolicitacao,
      props.status || StatusDesarquivamento.createPendente(),
      props.nomeSolicitante,
      props.nomeVitima,
      props.numeroRegistro,
      props.tipoDocumento,
      props.dataFato,
      props.prazoAtendimento ||
        DesarquivamentoDomain.calculateDefaultDeadline(
          props.tipoSolicitacao,
          props.urgente,
        ),
      props.dataAtendimento,
      props.resultadoAtendimento,
      props.finalidade,
      props.observacoes,
      props.urgente,
      props.localizacaoFisica,
      props.criadoPorId,
      props.responsavelId,
      now,
      now,
      props.deletedAt,
    );
  }

  // Factory method para reconstruir a partir de dados persistidos
  static reconstruct(props: DesarquivamentoDomainProps): DesarquivamentoDomain {
    return new DesarquivamentoDomain(
      props.id,
      props.codigoBarras,
      props.tipoSolicitacao,
      props.status,
      props.nomeSolicitante,
      props.nomeVitima,
      props.numeroRegistro,
      props.tipoDocumento,
      props.dataFato,
      props.prazoAtendimento,
      props.dataAtendimento,
      props.resultadoAtendimento,
      props.finalidade,
      props.observacoes,
      props.urgente,
      props.localizacaoFisica,
      props.criadoPorId,
      props.responsavelId,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  // Getters
  get id(): DesarquivamentoId | undefined {
    return this._id;
  }

  get codigoBarras(): CodigoBarras {
    return this._codigoBarras;
  }

  get tipoSolicitacao(): TipoSolicitacao {
    return this._tipoSolicitacao;
  }

  get status(): StatusDesarquivamento {
    return this._status;
  }

  get nomeSolicitante(): string {
    return this._nomeSolicitante;
  }

  get nomeVitima(): string | undefined {
    return this._nomeVitima;
  }

  get numeroRegistro(): NumeroRegistro {
    return this._numeroRegistro;
  }

  get tipoDocumento(): string | undefined {
    return this._tipoDocumento;
  }

  get dataFato(): Date | undefined {
    return this._dataFato;
  }

  get prazoAtendimento(): Date | undefined {
    return this._prazoAtendimento;
  }

  get dataAtendimento(): Date | undefined {
    return this._dataAtendimento;
  }

  get resultadoAtendimento(): string | undefined {
    return this._resultadoAtendimento;
  }

  get finalidade(): string | undefined {
    return this._finalidade;
  }

  get observacoes(): string | undefined {
    return this._observacoes;
  }

  get urgente(): boolean {
    return this._urgente;
  }

  get localizacaoFisica(): string | undefined {
    return this._localizacaoFisica;
  }

  get criadoPorId(): number {
    return this._criadoPorId;
  }

  get responsavelId(): number | undefined {
    return this._responsavelId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  // Métodos de negócio
  private validate(): void {
    if (!this._nomeSolicitante || this._nomeSolicitante.trim().length === 0) {
      throw new Error('Nome do solicitante é obrigatório');
    }

    if (this._nomeSolicitante.length > 255) {
      throw new Error('Nome do solicitante deve ter no máximo 255 caracteres');
    }

    if (this._nomeVitima && this._nomeVitima.length > 255) {
      throw new Error('Nome da vítima deve ter no máximo 255 caracteres');
    }

    if (this._tipoDocumento && this._tipoDocumento.length > 100) {
      throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
    }

    if (this._localizacaoFisica && this._localizacaoFisica.length > 255) {
      throw new Error('Localização física deve ter no máximo 255 caracteres');
    }

    if (this._criadoPorId <= 0) {
      throw new Error('ID do usuário criador deve ser válido');
    }

    if (this._responsavelId !== undefined && this._responsavelId <= 0) {
      throw new Error('ID do responsável deve ser válido');
    }
  }

  // Calcula prazo padrão baseado no tipo e urgência
  private static calculateDefaultDeadline(
    tipo: TipoSolicitacao,
    urgente: boolean,
  ): Date {
    const days = urgente
      ? Math.ceil(tipo.getDefaultDeadlineDays() / 2)
      : tipo.getDefaultDeadlineDays();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline;
  }

  // Verifica se pode ser acessado por um usuário
  canBeAccessedBy(userId: number, userRoles: string[]): boolean {
    // Criador sempre pode acessar
    if (this._criadoPorId === userId) {
      return true;
    }

    // Responsável pode acessar
    if (this._responsavelId === userId) {
      return true;
    }

    // Administradores podem acessar tudo
    if (userRoles.includes('ADMIN')) {
      return true;
    }

    // Usuários com role específica podem acessar
    if (
      userRoles.includes('NUGECID_VIEWER') ||
      userRoles.includes('NUGECID_OPERATOR')
    ) {
      return true;
    }

    return false;
  }

  // Verifica se pode ser editado por um usuário
  canBeEditedBy(userId: number, userRoles: string[]): boolean {
    // Não pode editar se estiver concluído
    if (this._status.isFinal()) {
      return false;
    }

    // Criador pode editar se ainda estiver pendente
    if (this._criadoPorId === userId && this._status.isPending()) {
      return true;
    }

    // Responsável pode editar
    if (this._responsavelId === userId) {
      return true;
    }

    // Administradores e operadores podem editar
    if (userRoles.includes('ADMIN') || userRoles.includes('NUGECID_OPERATOR')) {
      return true;
    }

    return false;
  }

  // Verifica se pode ser cancelado
  canBeCancelled(): boolean {
    return this._status.canBeCancelled();
  }

  // Verifica se pode ser concluído
  canBeCompleted(): boolean {
    return this._status.canBeCompleted();
  }

  // Verifica se está vencido
  isOverdue(): boolean {
    if (!this._prazoAtendimento || this._status.isFinal()) {
      return false;
    }
    return new Date() > this._prazoAtendimento;
  }

  // Calcula dias restantes até o vencimento
  getDaysUntilDeadline(): number | null {
    if (!this._prazoAtendimento || this._status.isFinal()) {
      return null;
    }

    const now = new Date();
    const diffTime = this._prazoAtendimento.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // Métodos para alterar estado
  changeStatus(newStatus: StatusDesarquivamento): void {
    if (!this._status.canTransitionTo(newStatus)) {
      throw new Error(
        `Não é possível alterar status de ${this._status.toString()} para ${newStatus.toString()}`,
      );
    }

    this._status = newStatus;
    this._updatedAt = new Date();

    // Se foi concluído, define data de atendimento
    if (
      newStatus.value === StatusDesarquivamentoEnum.CONCLUIDO &&
      !this._dataAtendimento
    ) {
      this._dataAtendimento = new Date();
    }
  }

  // Atribui responsável
  assignResponsible(responsavelId: number): void {
    if (responsavelId <= 0) {
      throw new Error('ID do responsável deve ser válido');
    }

    this._responsavelId = responsavelId;
    this._updatedAt = new Date();

    // Se estava pendente, muda para em andamento
    if (this._status.isPending()) {
      this._status = StatusDesarquivamento.createEmAndamento();
    }
  }

  // Define localização física
  setPhysicalLocation(localizacao: string): void {
    if (localizacao && localizacao.length > 255) {
      throw new Error('Localização física deve ter no máximo 255 caracteres');
    }

    this._localizacaoFisica = localizacao;
    this._updatedAt = new Date();
  }

  // Conclui o atendimento
  complete(resultado: string): void {
    if (!this._status.canBeCompleted()) {
      throw new Error('Desarquivamento não pode ser concluído no status atual');
    }

    if (!resultado || resultado.trim().length === 0) {
      throw new Error('Resultado do atendimento é obrigatório para conclusão');
    }

    this._status = StatusDesarquivamento.createConcluido();
    this._resultadoAtendimento = resultado.trim();
    this._dataAtendimento = new Date();
    this._updatedAt = new Date();
  }

  // Cancela o desarquivamento
  cancel(motivo?: string): void {
    if (!this._status.canBeCancelled()) {
      throw new Error('Desarquivamento não pode ser cancelado no status atual');
    }

    this._status = StatusDesarquivamento.createCancelado();
    if (motivo) {
      this._resultadoAtendimento = `Cancelado: ${motivo}`;
    }
    this._updatedAt = new Date();
  }

  // Soft delete
  delete(): void {
    if (this._status.isInProgress()) {
      throw new Error('Não é possível excluir desarquivamento em andamento');
    }

    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // Restaura soft delete
  restore(): void {
    this._deletedAt = undefined;
    this._updatedAt = new Date();
  }

  // Verifica se foi excluído
  isDeleted(): boolean {
    return this._deletedAt !== undefined;
  }

  // Converte para objeto simples (para serialização)
  toPlainObject(): any {
    return {
      id: this._id?.value,
      codigoBarras: this._codigoBarras.value,
      tipoSolicitacao: this._tipoSolicitacao.value,
      status: this._status.value,
      nomeSolicitante: this._nomeSolicitante,
      nomeVitima: this._nomeVitima,
      numeroRegistro: this._numeroRegistro.value,
      tipoDocumento: this._tipoDocumento,
      dataFato: this._dataFato,
      prazoAtendimento: this._prazoAtendimento,
      dataAtendimento: this._dataAtendimento,
      resultadoAtendimento: this._resultadoAtendimento,
      finalidade: this._finalidade,
      observacoes: this._observacoes,
      urgente: this._urgente,
      localizacaoFisica: this._localizacaoFisica,
      criadoPorId: this._criadoPorId,
      responsavelId: this._responsavelId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
