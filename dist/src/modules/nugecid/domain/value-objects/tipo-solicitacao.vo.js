"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoSolicitacao = exports.TipoSolicitacaoEnum = void 0;
var TipoSolicitacaoEnum;
(function (TipoSolicitacaoEnum) {
    TipoSolicitacaoEnum["DESARQUIVAMENTO"] = "DESARQUIVAMENTO";
    TipoSolicitacaoEnum["COPIA"] = "COPIA";
    TipoSolicitacaoEnum["VISTA"] = "VISTA";
    TipoSolicitacaoEnum["CERTIDAO"] = "CERTIDAO";
})(TipoSolicitacaoEnum || (exports.TipoSolicitacaoEnum = TipoSolicitacaoEnum = {}));
class TipoSolicitacao {
    constructor(value) {
        if (!Object.values(TipoSolicitacaoEnum).includes(value)) {
            throw new Error(`Tipo de solicitação inválido: ${value}`);
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
        return new TipoSolicitacao(value);
    }
    static createDesarquivamento() {
        return new TipoSolicitacao(TipoSolicitacaoEnum.DESARQUIVAMENTO);
    }
    static createCopia() {
        return new TipoSolicitacao(TipoSolicitacaoEnum.COPIA);
    }
    static createVista() {
        return new TipoSolicitacao(TipoSolicitacaoEnum.VISTA);
    }
    static createCertidao() {
        return new TipoSolicitacao(TipoSolicitacaoEnum.CERTIDAO);
    }
    isDesarquivamento() {
        return this._value === TipoSolicitacaoEnum.DESARQUIVAMENTO;
    }
    isCopia() {
        return this._value === TipoSolicitacaoEnum.COPIA;
    }
    isVista() {
        return this._value === TipoSolicitacaoEnum.VISTA;
    }
    isCertidao() {
        return this._value === TipoSolicitacaoEnum.CERTIDAO;
    }
    getDescription() {
        switch (this._value) {
            case TipoSolicitacaoEnum.DESARQUIVAMENTO:
                return 'Solicitação de desarquivamento de documento';
            case TipoSolicitacaoEnum.COPIA:
                return 'Solicitação de cópia de documento';
            case TipoSolicitacaoEnum.VISTA:
                return 'Solicitação de vista de documento';
            case TipoSolicitacaoEnum.CERTIDAO:
                return 'Solicitação de certidão';
            default:
                return 'Tipo de solicitação desconhecido';
        }
    }
    getDefaultDeadlineDays() {
        switch (this._value) {
            case TipoSolicitacaoEnum.DESARQUIVAMENTO:
                return 30;
            case TipoSolicitacaoEnum.COPIA:
                return 15;
            case TipoSolicitacaoEnum.VISTA:
                return 10;
            case TipoSolicitacaoEnum.CERTIDAO:
                return 20;
            default:
                return 30;
        }
    }
    requiresPhysicalLocation() {
        return this._value === TipoSolicitacaoEnum.DESARQUIVAMENTO ||
            this._value === TipoSolicitacaoEnum.VISTA;
    }
    allowsUrgency() {
        return true;
    }
    getColor() {
        switch (this._value) {
            case TipoSolicitacaoEnum.DESARQUIVAMENTO:
                return '#3b82f6';
            case TipoSolicitacaoEnum.COPIA:
                return '#10b981';
            case TipoSolicitacaoEnum.VISTA:
                return '#f59e0b';
            case TipoSolicitacaoEnum.CERTIDAO:
                return '#8b5cf6';
            default:
                return '#6b7280';
        }
    }
}
exports.TipoSolicitacao = TipoSolicitacao;
//# sourceMappingURL=tipo-solicitacao.vo.js.map