"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusDesarquivamento = exports.StatusDesarquivamentoEnum = void 0;
var StatusDesarquivamentoEnum;
(function (StatusDesarquivamentoEnum) {
    StatusDesarquivamentoEnum["FINALIZADO"] = "FINALIZADO";
    StatusDesarquivamentoEnum["DESARQUIVADO"] = "DESARQUIVADO";
    StatusDesarquivamentoEnum["NAO_COLETADO"] = "NAO_COLETADO";
    StatusDesarquivamentoEnum["SOLICITADO"] = "SOLICITADO";
    StatusDesarquivamentoEnum["REARQUIVAMENTO_SOLICITADO"] = "REARQUIVAMENTO_SOLICITADO";
    StatusDesarquivamentoEnum["RETIRADO_PELO_SETOR"] = "RETIRADO_PELO_SETOR";
    StatusDesarquivamentoEnum["NAO_LOCALIZADO"] = "NAO_LOCALIZADO";
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
    static createSolicitado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.SOLICITADO);
    }
    static createDesarquivado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.DESARQUIVADO);
    }
    static createFinalizado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.FINALIZADO);
    }
    static createNaoLocalizado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.NAO_LOCALIZADO);
    }
    static createNaoColetado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.NAO_COLETADO);
    }
    static createRetiradoPeloSetor() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR);
    }
    static createRearquivamentoSolicitado() {
        return new StatusDesarquivamento(StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO);
    }
    canTransitionTo(newStatus) {
        const allowedTransitions = StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
        return allowedTransitions.includes(newStatus._value);
    }
    getValidTransitions() {
        return StatusDesarquivamento.VALID_TRANSITIONS.get(this._value) || [];
    }
    isFinal() {
        return this._value === StatusDesarquivamentoEnum.FINALIZADO ||
            this._value === StatusDesarquivamentoEnum.NAO_LOCALIZADO;
    }
    isFinalized() {
        return this._value === StatusDesarquivamentoEnum.FINALIZADO;
    }
    isDesarquivado() {
        return this._value === StatusDesarquivamentoEnum.DESARQUIVADO;
    }
    isPending() {
        return this._value === StatusDesarquivamentoEnum.SOLICITADO;
    }
    isInProgress() {
        return this._value === StatusDesarquivamentoEnum.DESARQUIVADO ||
            this._value === StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR ||
            this._value === StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO;
    }
    canBeCancelled() {
        return false;
    }
    canBeCompleted() {
        return this.canTransitionTo(StatusDesarquivamento.createFinalizado());
    }
    getColor() {
        switch (this._value) {
            case StatusDesarquivamentoEnum.SOLICITADO:
                return '#8b5cf6';
            case StatusDesarquivamentoEnum.DESARQUIVADO:
                return '#3b82f6';
            case StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR:
                return '#06b6d4';
            case StatusDesarquivamentoEnum.FINALIZADO:
                return '#10b981';
            case StatusDesarquivamentoEnum.NAO_COLETADO:
                return '#f59e0b';
            case StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO:
                return '#6b7280';
            case StatusDesarquivamentoEnum.NAO_LOCALIZADO:
                return '#ef4444';
            default:
                return '#6b7280';
        }
    }
    getDescription() {
        switch (this._value) {
            case StatusDesarquivamentoEnum.SOLICITADO:
                return 'Aguardando desarquivamento';
            case StatusDesarquivamentoEnum.DESARQUIVADO:
                return 'Desarquivado e disponível';
            case StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR:
                return 'Retirado pelo setor solicitante';
            case StatusDesarquivamentoEnum.FINALIZADO:
                return 'Processo finalizado';
            case StatusDesarquivamentoEnum.NAO_COLETADO:
                return 'Não coletado pelo setor';
            case StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO:
                return 'Rearquivamento solicitado';
            case StatusDesarquivamentoEnum.NAO_LOCALIZADO:
                return 'Documento não localizado';
            default:
                return 'Status desconhecido';
        }
    }
}
exports.StatusDesarquivamento = StatusDesarquivamento;
StatusDesarquivamento.VALID_TRANSITIONS = new Map([
    [
        StatusDesarquivamentoEnum.SOLICITADO,
        [
            StatusDesarquivamentoEnum.DESARQUIVADO,
            StatusDesarquivamentoEnum.NAO_LOCALIZADO,
        ],
    ],
    [
        StatusDesarquivamentoEnum.DESARQUIVADO,
        [
            StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR,
            StatusDesarquivamentoEnum.NAO_COLETADO,
            StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO,
        ],
    ],
    [
        StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR,
        [StatusDesarquivamentoEnum.FINALIZADO],
    ],
    [
        StatusDesarquivamentoEnum.NAO_COLETADO,
        [StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO],
    ],
    [
        StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO,
        [StatusDesarquivamentoEnum.FINALIZADO],
    ],
    [StatusDesarquivamentoEnum.NAO_LOCALIZADO, []],
    [StatusDesarquivamentoEnum.FINALIZADO, []],
]);
//# sourceMappingURL=status-desarquivamento.vo.js.map