"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumeroRegistro = void 0;
class NumeroRegistro {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Número de registro deve ser uma string válida');
        }
        const trimmedValue = value.trim();
        if (trimmedValue.length < NumeroRegistro.MIN_LENGTH) {
            throw new Error(`Número de registro deve ter pelo menos ${NumeroRegistro.MIN_LENGTH} caracteres`);
        }
        if (trimmedValue.length > NumeroRegistro.MAX_LENGTH) {
            throw new Error(`Número de registro deve ter no máximo ${NumeroRegistro.MAX_LENGTH} caracteres`);
        }
        const validPattern = /^[A-Za-z0-9.\-\/\s]+$/;
        if (!validPattern.test(trimmedValue)) {
            throw new Error('Número de registro contém caracteres inválidos');
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
        return new NumeroRegistro(value);
    }
    static normalize(value) {
        return value.trim().replace(/\s+/g, ' ');
    }
    isYearFormat() {
        const yearPattern = /^\d{4}\.\d{3}\.\d+$/;
        return yearPattern.test(this._value);
    }
    getYear() {
        if (this.isYearFormat()) {
            return parseInt(this._value.substring(0, 4));
        }
        return null;
    }
    getSequentialNumber() {
        if (this.isYearFormat()) {
            const parts = this._value.split('.');
            return parts.length >= 2 ? parts[1] : null;
        }
        return null;
    }
}
exports.NumeroRegistro = NumeroRegistro;
NumeroRegistro.MIN_LENGTH = 5;
NumeroRegistro.MAX_LENGTH = 50;
//# sourceMappingURL=numero-registro.vo.js.map