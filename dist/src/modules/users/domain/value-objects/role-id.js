"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleId = void 0;
class RoleId {
    constructor(value) {
        if (!value || value <= 0) {
            throw new Error('ID da role deve ser um número positivo');
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
exports.RoleId = RoleId;
//# sourceMappingURL=role-id.js.map