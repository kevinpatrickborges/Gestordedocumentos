import {
  DesarquivamentoId,
  StatusDesarquivamento,
  StatusDesarquivamentoEnum,
} from '../value-objects';

export interface DesarquivamentoDomainProps {
  id?: DesarquivamentoId;
  tipoDesarquivamento: string;
  status: StatusDesarquivamento;
  nomeCompleto: string;
  numeroNicLaudoAuto: string;
  numeroProcesso: string;
  tipoDocumento: string;
  dataSolicitacao: Date;
  dataDesarquivamentoSAG?: Date;
  dataDevolucaoSetor?: Date;
  setorDemandante: string;
  servidorResponsavel: string;
  finalidadeDesarquivamento: string;
  solicitacaoProrrogacao: boolean;
  urgente?: boolean;
  criadoPorId: number;
  responsavelId?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class DesarquivamentoDomain {
  private constructor(
    private readonly _id: DesarquivamentoId | undefined,
    private readonly _tipoDesarquivamento: string,
    private _status: StatusDesarquivamento,
    private readonly _nomeCompleto: string,
    private readonly _numeroNicLaudoAuto: string,
    private readonly _numeroProcesso: string,
    private readonly _tipoDocumento: string,
    private readonly _dataSolicitacao: Date,
    private _dataDesarquivamentoSAG: Date | undefined,
    private _dataDevolucaoSetor: Date | undefined,
    private readonly _setorDemandante: string,
    private readonly _servidorResponsavel: string,
    private readonly _finalidadeDesarquivamento: string,
    private readonly _solicitacaoProrrogacao: boolean,
    private readonly _urgente: boolean | undefined,
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
      props.tipoDesarquivamento,
      props.status || StatusDesarquivamento.createSolicitado(),
      props.nomeCompleto,
      props.numeroNicLaudoAuto,
      props.numeroProcesso,
      props.tipoDocumento,
      props.dataSolicitacao,
      props.dataDesarquivamentoSAG,
      props.dataDevolucaoSetor,
      props.setorDemandante,
      props.servidorResponsavel,
      props.finalidadeDesarquivamento,
      props.solicitacaoProrrogacao,
      props.urgente,
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
      props.tipoDesarquivamento,
      props.status,
      props.nomeCompleto,
      props.numeroNicLaudoAuto,
      props.numeroProcesso,
      props.tipoDocumento,
      props.dataSolicitacao,
      props.dataDesarquivamentoSAG,
      props.dataDevolucaoSetor,
      props.setorDemandante,
      props.servidorResponsavel,
      props.finalidadeDesarquivamento,
      props.solicitacaoProrrogacao,
      props.urgente,
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

  get tipoDesarquivamento(): string {
    return this._tipoDesarquivamento;
  }

  get status(): StatusDesarquivamento {
    return this._status;
  }

  get nomeCompleto(): string {
    return this._nomeCompleto;
  }

  get numeroNicLaudoAuto(): string {
    return this._numeroNicLaudoAuto;
  }

  get numeroProcesso(): string {
    return this._numeroProcesso;
  }

  get tipoDocumento(): string {
    return this._tipoDocumento;
  }

  get dataSolicitacao(): Date {
    return this._dataSolicitacao;
  }

  get dataDesarquivamentoSAG(): Date | undefined {
    return this._dataDesarquivamentoSAG;
  }

  get dataDevolucaoSetor(): Date | undefined {
    return this._dataDevolucaoSetor;
  }

  get setorDemandante(): string {
    return this._setorDemandante;
  }

  get servidorResponsavel(): string {
    return this._servidorResponsavel;
  }

  get finalidadeDesarquivamento(): string {
    return this._finalidadeDesarquivamento;
  }

  get solicitacaoProrrogacao(): boolean {
    return this._solicitacaoProrrogacao;
  }

  get urgente(): boolean | undefined {
    return this._urgente;
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
    if (!this._nomeCompleto || this._nomeCompleto.trim().length === 0) {
      throw new Error('Nome completo é obrigatório');
    }

    if (this._nomeCompleto.length > 255) {
      throw new Error('Nome completo deve ter no máximo 255 caracteres');
    }

    if (!this._numeroNicLaudoAuto || this._numeroNicLaudoAuto.trim().length === 0) {
      throw new Error('Número NIC/Laudo/Auto é obrigatório');
    }

    if (!this._numeroProcesso || this._numeroProcesso.trim().length === 0) {
      throw new Error('Número do processo é obrigatório');
    }

    if (!this._tipoDocumento || this._tipoDocumento.trim().length === 0) {
      throw new Error('Tipo do documento é obrigatório');
    }

    if (!this._setorDemandante || this._setorDemandante.trim().length === 0) {
      throw new Error('Setor demandante é obrigatório');
    }

    if (!this._servidorResponsavel || this._servidorResponsavel.trim().length === 0) {
      throw new Error('Servidor responsável é obrigatório');
    }

    if (!this._finalidadeDesarquivamento || this._finalidadeDesarquivamento.trim().length === 0) {
      throw new Error('Finalidade do desarquivamento é obrigatória');
    }

    if (this._criadoPorId <= 0) {
      throw new Error('ID do usuário criador deve ser válido');
    }

    if (
      this._responsavelId !== undefined &&
      this._responsavelId !== null &&
      this._responsavelId < 0
    ) {
      throw new Error('ID do responsável deve ser válido');
    }
  }


  // Verifica se pode ser acessado por um usuário
  canBeAccessedBy(userId: number, userRoles: string[]): boolean {
    const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
    // Criador sempre pode acessar
    if (this._criadoPorId === userId) {
      return true;
    }

    // Responsável pode acessar
    if (this._responsavelId === userId) {
      return true;
    }

    // Administradores podem acessar tudo
    if (upperCaseUserRoles.includes('ADMIN')) {
      return true;
    }

    // Usuários com role específica podem acessar
    if (
      upperCaseUserRoles.includes('NUGECID_VIEWER') ||
      upperCaseUserRoles.includes('NUGECID_OPERATOR')
    ) {
      return true;
    }

    return false;
  }

  // Verifica se pode ser editado por um usuário
  canBeEditedBy(userId: number, userRoles: string[]): boolean {
    const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
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
    if (upperCaseUserRoles.includes('ADMIN') || upperCaseUserRoles.includes('NUGECID_OPERATOR')) {
      return true;
    }

    return false;
  }

  // Verifica se pode ser excluído por um usuário (regras específicas para exclusão)
  canBeDeletedBy(userId: number, userRoles: string[]): boolean {
    const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
    
    // Administradores podem excluir qualquer coisa (exceto em andamento)
    if (upperCaseUserRoles.includes('ADMIN')) {
      // Não permitir exclusão de registros em andamento, mesmo para admin
      if (this._status.isInProgress()) {
        return false;
      }
      return true;
    }

    // Criador pode excluir apenas suas próprias solicitações que não estão finalizadas ou em andamento
    if (this._criadoPorId === userId) {
      // Não pode excluir se finalizado ou em andamento
      if (this._status.isFinal() || this._status.isInProgress()) {
        return false;
      }
      return true;
    }

    // Responsável pode excluir apenas se não estiver finalizado
    if (this._responsavelId === userId) {
      if (this._status.isFinal()) {
        return false;
      }
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

  // Verifica se está vencido (baseado na data de solicitação + 30 dias)
  isOverdue(): boolean {
    if (this._status.isFinal()) {
      return false;
    }
    const deadline = new Date(this._dataSolicitacao);
    deadline.setDate(deadline.getDate() + 30); // 30 dias padrão
    return new Date() > deadline;
  }

  // Calcula dias restantes até o vencimento
  getDaysUntilDeadline(): number | null {
    if (this._status.isFinal()) {
      return null;
    }

    const deadline = new Date(this._dataSolicitacao);
    deadline.setDate(deadline.getDate() + 30); // 30 dias padrão
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
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

    // Se foi concluído, define data de desarquivamento se não foi definida
    if (
      newStatus.value === StatusDesarquivamentoEnum.FINALIZADO &&
      !this._dataDesarquivamentoSAG
    ) {
      this._dataDesarquivamentoSAG = new Date();
    }
  }

  // Atribui responsável
  assignResponsible(responsavelId: number): void {
    if (responsavelId < 0) {
      throw new Error('ID do responsável deve ser válido');
    }

    this._responsavelId = responsavelId;
    this._updatedAt = new Date();

    // Se estava pendente, muda para em andamento
    if (this._status.isPending()) {
      this._status = StatusDesarquivamento.createDesarquivado();
    }
  }

  // Define data de desarquivamento SAG
  setDataDesarquivamentoSAG(data: Date): void {
    this._dataDesarquivamentoSAG = data;
    this._updatedAt = new Date();
  }

  // Define data de devolução ao setor
  setDataDevolucaoSetor(data: Date): void {
    this._dataDevolucaoSetor = data;
    this._updatedAt = new Date();
  }

  // Conclui o atendimento
  complete(): void {
    if (!this._status.canBeCompleted()) {
      throw new Error('Desarquivamento não pode ser concluído no status atual');
    }

    this._status = StatusDesarquivamento.createFinalizado();
    if (!this._dataDesarquivamentoSAG) {
      this._dataDesarquivamentoSAG = new Date();
    }
    this._updatedAt = new Date();
  }

  // Cancela o desarquivamento
  cancel(motivo?: string): void {
    if (!this._status.canBeCancelled()) {
      throw new Error('Desarquivamento não pode ser cancelado no status atual');
    }

    // Cancel functionality not available in new status structure
    throw new Error('Cancelamento não está disponível na nova estrutura de status');
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

  // Marca como excluído (soft delete)
  markAsDeleted(): void {
    this._deletedAt = new Date();
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
      tipoDesarquivamento: this._tipoDesarquivamento,
      status: this._status.value,
      nomeCompleto: this._nomeCompleto,
      numeroNicLaudoAuto: this._numeroNicLaudoAuto,
      numeroProcesso: this._numeroProcesso,
      tipoDocumento: this._tipoDocumento,
      dataSolicitacao: this._dataSolicitacao,
      dataDesarquivamentoSAG: this._dataDesarquivamentoSAG,
      dataDevolucaoSetor: this._dataDevolucaoSetor,
      setorDemandante: this._setorDemandante,
      servidorResponsavel: this._servidorResponsavel,
      finalidadeDesarquivamento: this._finalidadeDesarquivamento,
      solicitacaoProrrogacao: this._solicitacaoProrrogacao,
      urgente: this._urgente,
      criadoPorId: this._criadoPorId,
      responsavelId: this._responsavelId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
