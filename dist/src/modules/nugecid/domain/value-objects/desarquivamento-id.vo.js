"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoId = void 0;
class DesarquivamentoId {
    constructor(value) {
        if (!value || value <= 0) {
            throw new Error('DesarquivamentoId deve ser um número positivo');
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
        return this._value.toString();
    }
    static create(value) {
        return new DesarquivamentoId(value);
    }
}
exports.DesarquivamentoId = DesarquivamentoId;
//# sourceMappingURL=desarquivamento-id.vo.js.map