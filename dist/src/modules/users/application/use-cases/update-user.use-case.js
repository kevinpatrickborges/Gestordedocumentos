"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_id_1 = require("../../domain/value-objects/user-id");
const usuario_1 = require("../../domain/value-objects/usuario");
const role_id_1 = require("../../domain/value-objects/role-id");
let UpdateUserUseCase = class UpdateUserUseCase {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async execute(id, dto) {
        const userId = new user_id_1.UserId(id);
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        if (dto.nome !== undefined) {
            user.updateNome(dto.nome);
        }
        if (dto.usuario !== undefined) {
            const newUsuario = new usuario_1.Usuario(dto.usuario);
            if (!user.usuario.equals(newUsuario)) {
                const usuarioExists = await this.userRepository.exists(newUsuario);
                if (usuarioExists) {
                    throw new Error('Usuário já está em uso');
                }
                user.updateUsuario(newUsuario);
            }
        }
        if (dto.senha !== undefined) {
            await user.updatePassword(dto.senha);
        }
        if (dto.roleId !== undefined) {
            const roleId = new role_id_1.RoleId(dto.roleId);
            const role = await this.roleRepository.findById(roleId);
            if (!role) {
                throw new Error('Role não encontrada');
            }
            user.updateRole(roleId, role);
        }
        if (dto.ativo !== undefined) {
            if (dto.ativo) {
                user.activate();
            }
            else {
                user.deactivate();
            }
        }
        return this.userRepository.update(user);
    }
};
exports.UpdateUserUseCase = UpdateUserUseCase;
exports.UpdateUserUseCase = UpdateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('IRoleRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateUserUseCase);
//# sourceMappingURL=update-user.use-case.js.map