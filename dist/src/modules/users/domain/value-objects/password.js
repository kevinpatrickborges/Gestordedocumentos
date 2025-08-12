"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const bcrypt = require("bcrypt");
class Password {
    constructor(hashedValue) {
        this._hashedValue = hashedValue;
    }
    static async create(plainPassword) {
        if (!plainPassword) {
            throw new Error('Senha não pode estar vazia');
        }
        if (plainPassword.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        const saltRounds = 10;
        const hashedValue = await bcrypt.hash(plainPassword, saltRounds);
        return new Password(hashedValue);
    }
    static fromHash(hashedValue) {
        if (!hashedValue) {
            throw new Error('Hash da senha não pode estar vazio');
        }
        return new Password(hashedValue);
    }
    get hashedValue() {
        return this._hashedValue;
    }
    async isValid(plainPassword) {
        if (!plainPassword) {
            return false;
        }
        return bcrypt.compare(plainPassword, this._hashedValue);
    }
    equals(other) {
        return this._hashedValue === other._hashedValue;
    }
}
exports.Password = Password;
//# sourceMappingURL=password.js.map