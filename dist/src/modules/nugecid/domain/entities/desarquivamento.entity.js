"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoDomain = void 0;
const value_objects_1 = require("../value-objects");
class DesarquivamentoDomain {
    constructor(_id, _tipoDesarquivamento, _status, _nomeCompleto, _numeroNicLaudoAuto, _numeroProcesso, _tipoDocumento, _dataSolicitacao, _dataDesarquivamentoSAG, _dataDevolucaoSetor, _setorDemandante, _servidorResponsavel, _finalidadeDesarquivamento, _solicitacaoProrrogacao, _urgente, _criadoPorId, _responsavelId, _createdAt, _updatedAt, _deletedAt) {
        this._id = _id;
        this._tipoDesarquivamento = _tipoDesarquivamento;
        this._status = _status;
        this._nomeCompleto = _nomeCompleto;
        this._numeroNicLaudoAuto = _numeroNicLaudoAuto;
        this._numeroProcesso = _numeroProcesso;
        this._tipoDocumento = _tipoDocumento;
        this._dataSolicitacao = _dataSolicitacao;
        this._dataDesarquivamentoSAG = _dataDesarquivamentoSAG;
        this._dataDevolucaoSetor = _dataDevolucaoSetor;
        this._setorDemandante = _setorDemandante;
        this._servidorResponsavel = _servidorResponsavel;
        this._finalidadeDesarquivamento = _finalidadeDesarquivamento;
        this._solicitacaoProrrogacao = _solicitacaoProrrogacao;
        this._urgente = _urgente;
        this._criadoPorId = _criadoPorId;
        this._responsavelId = _responsavelId;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
        this._deletedAt = _deletedAt;
        this.validate();
    }
    static create(props) {
        const now = new Date();
        return new DesarquivamentoDomain(undefined, props.tipoDesarquivamento, props.status || value_objects_1.StatusDesarquivamento.createSolicitado(), props.nomeCompleto, props.numeroNicLaudoAuto, props.numeroProcesso, props.tipoDocumento, props.dataSolicitacao, props.dataDesarquivamentoSAG, props.dataDevolucaoSetor, props.setorDemandante, props.servidorResponsavel, props.finalidadeDesarquivamento, props.solicitacaoProrrogacao, props.urgente, props.criadoPorId, props.responsavelId, now, now, props.deletedAt);
    }
    static reconstruct(props) {
        return new DesarquivamentoDomain(props.id, props.tipoDesarquivamento, props.status, props.nomeCompleto, props.numeroNicLaudoAuto, props.numeroProcesso, props.tipoDocumento, props.dataSolicitacao, props.dataDesarquivamentoSAG, props.dataDevolucaoSetor, props.setorDemandante, props.servidorResponsavel, props.finalidadeDesarquivamento, props.solicitacaoProrrogacao, props.urgente, props.criadoPorId, props.responsavelId, props.createdAt, props.updatedAt, props.deletedAt);
    }
    get id() {
        return this._id;
    }
    get tipoDesarquivamento() {
        return this._tipoDesarquivamento;
    }
    get status() {
        return this._status;
    }
    get nomeCompleto() {
        return this._nomeCompleto;
    }
    get numeroNicLaudoAuto() {
        return this._numeroNicLaudoAuto;
    }
    get numeroProcesso() {
        return this._numeroProcesso;
    }
    get tipoDocumento() {
        return this._tipoDocumento;
    }
    get dataSolicitacao() {
        return this._dataSolicitacao;
    }
    get dataDesarquivamentoSAG() {
        return this._dataDesarquivamentoSAG;
    }
    get dataDevolucaoSetor() {
        return this._dataDevolucaoSetor;
    }
    get setorDemandante() {
        return this._setorDemandante;
    }
    get servidorResponsavel() {
        return this._servidorResponsavel;
    }
    get finalidadeDesarquivamento() {
        return this._finalidadeDesarquivamento;
    }
    get solicitacaoProrrogacao() {
        return this._solicitacaoProrrogacao;
    }
    get urgente() {
        return this._urgente;
    }
    get criadoPorId() {
        return this._criadoPorId;
    }
    get responsavelId() {
        return this._responsavelId;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get deletedAt() {
        return this._deletedAt;
    }
    validate() {
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
        if (this._responsavelId !== undefined &&
            this._responsavelId !== null &&
            this._responsavelId < 0) {
            throw new Error('ID do responsável deve ser válido');
        }
    }
    canBeAccessedBy(userId, userRoles) {
        const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
        if (this._criadoPorId === userId) {
            return true;
        }
        if (this._responsavelId === userId) {
            return true;
        }
        if (upperCaseUserRoles.includes('ADMIN')) {
            return true;
        }
        if (upperCaseUserRoles.includes('NUGECID_VIEWER') ||
            upperCaseUserRoles.includes('NUGECID_OPERATOR')) {
            return true;
        }
        return false;
    }
    canBeEditedBy(userId, userRoles) {
        const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
        if (this._status.isFinal()) {
            return false;
        }
        if (this._criadoPorId === userId && this._status.isPending()) {
            return true;
        }
        if (this._responsavelId === userId) {
            return true;
        }
        if (upperCaseUserRoles.includes('ADMIN') || upperCaseUserRoles.includes('NUGECID_OPERATOR')) {
            return true;
        }
        return false;
    }
    canBeCancelled() {
        return this._status.canBeCancelled();
    }
    canBeCompleted() {
        return this._status.canBeCompleted();
    }
    isOverdue() {
        if (this._status.isFinal()) {
            return false;
        }
        const deadline = new Date(this._dataSolicitacao);
        deadline.setDate(deadline.getDate() + 30);
        return new Date() > deadline;
    }
    getDaysUntilDeadline() {
        if (this._status.isFinal()) {
            return null;
        }
        const deadline = new Date(this._dataSolicitacao);
        deadline.setDate(deadline.getDate() + 30);
        const now = new Date();
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    changeStatus(newStatus) {
        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(`Não é possível alterar status de ${this._status.toString()} para ${newStatus.toString()}`);
        }
        this._status = newStatus;
        this._updatedAt = new Date();
        if (newStatus.value === value_objects_1.StatusDesarquivamentoEnum.FINALIZADO &&
            !this._dataDesarquivamentoSAG) {
            this._dataDesarquivamentoSAG = new Date();
        }
    }
    assignResponsible(responsavelId) {
        if (responsavelId < 0) {
            throw new Error('ID do responsável deve ser válido');
        }
        this._responsavelId = responsavelId;
        this._updatedAt = new Date();
        if (this._status.isPending()) {
            this._status = value_objects_1.StatusDesarquivamento.createDesarquivado();
        }
    }
    setDataDesarquivamentoSAG(data) {
        this._dataDesarquivamentoSAG = data;
        this._updatedAt = new Date();
    }
    setDataDevolucaoSetor(data) {
        this._dataDevolucaoSetor = data;
        this._updatedAt = new Date();
    }
    complete() {
        if (!this._status.canBeCompleted()) {
            throw new Error('Desarquivamento não pode ser concluído no status atual');
        }
        this._status = value_objects_1.StatusDesarquivamento.createFinalizado();
        if (!this._dataDesarquivamentoSAG) {
            this._dataDesarquivamentoSAG = new Date();
        }
        this._updatedAt = new Date();
    }
    cancel(motivo) {
        if (!this._status.canBeCancelled()) {
            throw new Error('Desarquivamento não pode ser cancelado no status atual');
        }
        throw new Error('Cancelamento não está disponível na nova estrutura de status');
        this._updatedAt = new Date();
    }
    delete() {
        if (this._status.isInProgress()) {
            throw new Error('Não é possível excluir desarquivamento em andamento');
        }
        this._deletedAt = new Date();
        this._updatedAt = new Date();
    }
    restore() {
        this._deletedAt = undefined;
        this._updatedAt = new Date();
    }
    markAsDeleted() {
        this._deletedAt = new Date();
        this._updatedAt = new Date();
    }
    isDeleted() {
        return this._deletedAt !== undefined;
    }
    toPlainObject() {
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
exports.DesarquivamentoDomain = DesarquivamentoDomain;
//# sourceMappingURL=desarquivamento.entity.js.map