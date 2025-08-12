"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleFactory = void 0;
class RoleFactory {
    static build(data = {}) {
        return {
            id: 1,
            name: 'user',
            description: 'Regular user',
            permissions: [],
            ativo: true,
            ...data,
        };
    }
}
exports.RoleFactory = RoleFactory;
//# sourceMappingURL=role.factory.js.map