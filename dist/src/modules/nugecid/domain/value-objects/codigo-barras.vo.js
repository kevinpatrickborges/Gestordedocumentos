"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoBarras = void 0;
class CodigoBarras {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Código de barras deve ser uma string válida');
        }
        const trimmedValue = value.trim();
        if (!CodigoBarras.PATTERN.test(trimmedValue)) {
            throw new Error('Código de barras deve seguir o formato DES + 10 dígitos (ex: DES2024010001)');
        }
        this._value = trimmedValue;
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
        return new CodigoBarras(value);
    }
    static generateNew() {
        const year = String(new Date().getFullYear()).slice(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const codigo = `DES${year}${month}${day}${random}`;
        return new CodigoBarras(codigo);
    }
    getYear() {
        return parseInt(this._value.substring(3, 7));
    }
    getMonth() {
        return parseInt(this._value.substring(7, 9));
    }
    getDay() {
        return parseInt(this._value.substring(9, 11));
    }
    getSequence() {
        return this._value.substring(11);
    }
}
exports.CodigoBarras = CodigoBarras;
CodigoBarras.PATTERN = /^DES\d{10}$/;
//# sourceMappingURL=codigo-barras.vo.js.map