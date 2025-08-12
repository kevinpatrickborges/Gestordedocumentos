"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoDomain = void 0;
const value_objects_1 = require("../value-objects");
class DesarquivamentoDomain {
    constructor(_id, _codigoBarras, _tipoSolicitacao, _status, _nomeSolicitante, _nomeVitima, _numeroRegistro, _tipoDocumento, _dataFato, _prazoAtendimento, _dataAtendimento, _resultadoAtendimento, _finalidade, _observacoes, _urgente, _localizacaoFisica, _criadoPorId, _responsavelId, _createdAt, _updatedAt, _deletedAt) {
        this._id = _id;
        this._codigoBarras = _codigoBarras;
        this._tipoSolicitacao = _tipoSolicitacao;
        this._status = _status;
        this._nomeSolicitante = _nomeSolicitante;
        this._nomeVitima = _nomeVitima;
        this._numeroRegistro = _numeroRegistro;
        this._tipoDocumento = _tipoDocumento;
        this._dataFato = _dataFato;
        this._prazoAtendimento = _prazoAtendimento;
        this._dataAtendimento = _dataAtendimento;
        this._resultadoAtendimento = _resultadoAtendimento;
        this._finalidade = _finalidade;
        this._observacoes = _observacoes;
        this._urgente = _urgente;
        this._localizacaoFisica = _localizacaoFisica;
        this._criadoPorId = _criadoPorId;
        this._responsavelId = _responsavelId;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
        this._deletedAt = _deletedAt;
        this.validate();
    }
    static create(props) {
        const now = new Date();
        return new DesarquivamentoDomain(undefined, props.codigoBarras, props.tipoSolicitacao, props.status || value_objects_1.StatusDesarquivamento.createPendente(), props.nomeSolicitante, props.nomeVitima, props.numeroRegistro, props.tipoDocumento, props.dataFato, props.prazoAtendimento || DesarquivamentoDomain.calculateDefaultDeadline(props.tipoSolicitacao, props.urgente), props.dataAtendimento, props.resultadoAtendimento, props.finalidade, props.observacoes, props.urgente, props.localizacaoFisica, props.criadoPorId, props.responsavelId, now, now, props.deletedAt);
    }
    static reconstruct(props) {
        return new DesarquivamentoDomain(props.id, props.codigoBarras, props.tipoSolicitacao, props.status, props.nomeSolicitante, props.nomeVitima, props.numeroRegistro, props.tipoDocumento, props.dataFato, props.prazoAtendimento, props.dataAtendimento, props.resultadoAtendimento, props.finalidade, props.observacoes, props.urgente, props.localizacaoFisica, props.criadoPorId, props.responsavelId, props.createdAt, props.updatedAt, props.deletedAt);
    }
    get id() {
        return this._id;
    }
    get codigoBarras() {
        return this._codigoBarras;
    }
    get tipoSolicitacao() {
        return this._tipoSolicitacao;
    }
    get status() {
        return this._status;
    }
    get nomeSolicitante() {
        return this._nomeSolicitante;
    }
    get nomeVitima() {
        return this._nomeVitima;
    }
    get numeroRegistro() {
        return this._numeroRegistro;
    }
    get tipoDocumento() {
        return this._tipoDocumento;
    }
    get dataFato() {
        return this._dataFato;
    }
    get prazoAtendimento() {
        return this._prazoAtendimento;
    }
    get dataAtendimento() {
        return this._dataAtendimento;
    }
    get resultadoAtendimento() {
        return this._resultadoAtendimento;
    }
    get finalidade() {
        return this._finalidade;
    }
    get observacoes() {
        return this._observacoes;
    }
    get urgente() {
        return this._urgente;
    }
    get localizacaoFisica() {
        return this._localizacaoFisica;
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
    static calculateDefaultDeadline(tipo, urgente) {
        const days = urgente ? Math.ceil(tipo.getDefaultDeadlineDays() / 2) : tipo.getDefaultDeadlineDays();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + days);
        return deadline;
    }
    canBeAccessedBy(userId, userRoles) {
        if (this._criadoPorId === userId) {
            return true;
        }
        if (this._responsavelId === userId) {
            return true;
        }
        if (userRoles.includes('ADMIN')) {
            return true;
        }
        if (userRoles.includes('NUGECID_VIEWER') || userRoles.includes('NUGECID_OPERATOR')) {
            return true;
        }
        return false;
    }
    canBeEditedBy(userId, userRoles) {
        if (this._status.isFinal()) {
            return false;
        }
        if (this._criadoPorId === userId && this._status.isPending()) {
            return true;
        }
        if (this._responsavelId === userId) {
            return true;
        }
        if (userRoles.includes('ADMIN') || userRoles.includes('NUGECID_OPERATOR')) {
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
        if (!this._prazoAtendimento || this._status.isFinal()) {
            return false;
        }
        return new Date() > this._prazoAtendimento;
    }
    getDaysUntilDeadline() {
        if (!this._prazoAtendimento || this._status.isFinal()) {
            return null;
        }
        const now = new Date();
        const diffTime = this._prazoAtendimento.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    changeStatus(newStatus) {
        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(`Não é possível alterar status de ${this._status.toString()} para ${newStatus.toString()}`);
        }
        this._status = newStatus;
        this._updatedAt = new Date();
        if (newStatus.value === value_objects_1.StatusDesarquivamentoEnum.CONCLUIDO && !this._dataAtendimento) {
            this._dataAtendimento = new Date();
        }
    }
    assignResponsible(responsavelId) {
        if (responsavelId <= 0) {
            throw new Error('ID do responsável deve ser válido');
        }
        this._responsavelId = responsavelId;
        this._updatedAt = new Date();
        if (this._status.isPending()) {
            this._status = value_objects_1.StatusDesarquivamento.createEmAndamento();
        }
    }
    setPhysicalLocation(localizacao) {
        if (localizacao && localizacao.length > 255) {
            throw new Error('Localização física deve ter no máximo 255 caracteres');
        }
        this._localizacaoFisica = localizacao;
        this._updatedAt = new Date();
    }
    complete(resultado) {
        if (!this._status.canBeCompleted()) {
            throw new Error('Desarquivamento não pode ser concluído no status atual');
        }
        if (!resultado || resultado.trim().length === 0) {
            throw new Error('Resultado do atendimento é obrigatório para conclusão');
        }
        this._status = value_objects_1.StatusDesarquivamento.createConcluido();
        this._resultadoAtendimento = resultado.trim();
        this._dataAtendimento = new Date();
        this._updatedAt = new Date();
    }
    cancel(motivo) {
        if (!this._status.canBeCancelled()) {
            throw new Error('Desarquivamento não pode ser cancelado no status atual');
        }
        this._status = value_objects_1.StatusDesarquivamento.createCancelado();
        if (motivo) {
            this._resultadoAtendimento = `Cancelado: ${motivo}`;
        }
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
    isDeleted() {
        return this._deletedAt !== undefined;
    }
    toPlainObject() {
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
exports.DesarquivamentoDomain = DesarquivamentoDomain;
//# sourceMappingURL=desarquivamento.entity.js.map