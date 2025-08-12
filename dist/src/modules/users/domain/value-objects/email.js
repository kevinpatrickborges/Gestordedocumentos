"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(value) {
        if (!value) {
            throw new Error('Email não pode estar vazio');
        }
        if (!this.isValidEmail(value)) {
            throw new Error('Email inválido');
        }
        this._value = value.toLowerCase().trim();
    }
    get value() {
        return this._value;
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
}
exports.Email = Email;
//# sourceMappingURL=email.js.map