"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const role_factory_1 = require("./role.factory");
class UserFactory {
    static build(data = {}) {
        const role = data.role || role_factory_1.RoleFactory.build();
        return {
            id: 1,
            nome: 'Test User',
            usuario: 'testuser',
            senha: 'password123',
            role: role,
            ativo: true,
            ...data,
        };
    }
}
exports.UserFactory = UserFactory;
//# sourceMappingURL=user.factory.js.map