"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusDesarquivamento = exports.StatusDesarquivamentoEnum = void 0;
var StatusDesarquivamentoEnum;
(function (StatusDesarquivamentoEnum) {
    StatusDesarquivamentoEnum["PENDENTE"] = "PENDENTE";
    StatusDesarquivamentoEnum["EM_ANDAMENTO"] = "EM_ANDAMENTO";
    StatusDesarquivamentoEnum["CONCLUIDO"] = "CONCLUIDO";
    StatusDesarquivamentoEnum["CANCELADO"] = "CANCELADO";
})(StatusDesarquivamentoEnum || (exports.StatusDesarquivamentoEnum = StatusDesarquivamentoEnum = {}));
class StatusDesarquivamento {
    constructor(value) {
        if (!Object.values(StatusDesarquivamentoEnum).includes(value)) {
            throw new Error(`Status inválido: ${value}`);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
    static create(value) {
        return new StatusDesarquivamento(value);
    }
    static createPendente() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.PENDENTE);
    }
    static createEmAndamento() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.EM_ANDAMENTO);
    }
    static createConcluido() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.CONCLUIDO);
    }
    static createCancelado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.CANCELADO);
    }
    canTransitionTo(newStatus) {
        const allowedTransitions = StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
        return allowedTransitions.includes(newStatus._value);
    }
    getValidTransitions() {
        return StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
    }
    isFinal() {
        return this._value === StatusDesarquivamentoEnum.CONCLUIDO;
    }
    isCancelled() {
        return this._value === StatusDesarquivamentoEnum.CANCELADO;
    }
    isInProgress() {
        return this._value === StatusDesarquivamentoEnum.EM_ANDAMENTO;
    }
    isPending() {
        return this._value === StatusDesarquivamentoEnum.PENDENTE;
    }
    canBeCancelled() {
        return this.canTransitionTo(StatusDesarquivamento.createCancelado());
    }
    canBeCompleted() {
        return this.canTransitionTo(StatusDesarquivamento.createConcluido());
    }
    getColor() {
        switch (this._value) {
            case StatusDesarquivamentoEnum.PENDENTE:
                return '#fbbf24';
            case StatusDesarquivamentoEnum.EM_ANDAMENTO:
                return '#3b82f6';
            case StatusDesarquivamentoEnum.CONCLUIDO:
                return '#10b981';
            case StatusDesarquivamentoEnum.CANCELADO:
                return '#ef4444';
            default:
                return '#6b7280';
        }
    }
    getDescription() {
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
exports.StatusDesarquivamento = StatusDesarquivamento;
StatusDesarquivamento.VALID_TRANSITIONS = new Map([
    [
        StatusDesarquivamentoEnum.PENDENTE,
        [
            StatusDesarquivamentoEnum.EM_ANDAMENTO,
            StatusDesarquivamentoEnum.CANCELADO,
        ],
    ],
    [
        StatusDesarquivamentoEnum.EM_ANDAMENTO,
        [
            StatusDesarquivamentoEnum.CONCLUIDO,
            StatusDesarquivamentoEnum.CANCELADO,
            StatusDesarquivamentoEnum.PENDENTE,
        ],
    ],
    [StatusDesarquivamentoEnum.CONCLUIDO, []],
    [StatusDesarquivamentoEnum.CANCELADO, [StatusDesarquivamentoEnum.PENDENTE]],
]);
//# sourceMappingURL=status-desarquivamento.vo.js.map