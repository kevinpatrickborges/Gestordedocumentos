"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
class UserId {
    constructor(value) {
        if (!value || value <= 0) {
            throw new Error('ID do usuário deve ser um número positivo');
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
}
exports.UserId = UserId;
//# sourceMappingURL=user-id.js.map