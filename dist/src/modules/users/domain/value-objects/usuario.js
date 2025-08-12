"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(value) {
        this.validate(value);
        this._value = value.trim().toLowerCase();
    }
    validate(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Usuário não pode estar vazio');
        }
        const trimmedValue = value.trim();
        if (trimmedValue.length < 3) {
            throw new Error('Usuário deve ter pelo menos 3 caracteres');
        }
        if (trimmedValue.length > 50) {
            throw new Error('Usuário não pode ter mais de 50 caracteres');
        }
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(trimmedValue)) {
            throw new Error('Usuário pode conter apenas letras, números, underscore e hífen');
        }
        if (trimmedValue.startsWith('_') || trimmedValue.startsWith('-') ||
            trimmedValue.endsWith('_') || trimmedValue.endsWith('-')) {
            throw new Error('Usuário não pode começar ou terminar com underscore ou hífen');
        }
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
        return new Usuario(value);
    }
}
exports.Usuario = Usuario;
//# sourceMappingURL=usuario.js.map