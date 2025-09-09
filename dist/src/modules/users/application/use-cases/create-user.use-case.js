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
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_1 = require("../../domain/entities/user");
const usuario_1 = require("../../domain/value-objects/usuario");
const password_1 = require("../../domain/value-objects/password");
let CreateUserUseCase = class CreateUserUseCase {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async execute(dto) {
        const usuario = new usuario_1.Usuario(dto.usuario);
        const existingUser = await this.userRepository.findByUsuario(usuario);
        if (existingUser && !existingUser.isDeleted) {
            throw new Error('Usuário já está em uso');
        }
        if (existingUser && existingUser.isDeleted) {
            const role = await this.roleRepository.findByName(dto.role);
            if (!role) {
                throw new Error('Role não encontrada');
            }
            existingUser.updateNome(dto.nome);
            existingUser.updateRole(role.id, role);
            await existingUser.updatePassword(dto.senha);
            existingUser.restore();
            return await this.userRepository.update(existingUser);
        }
        const role = await this.roleRepository.findByName(dto.role);
        if (!role) {
            throw new Error('Role não encontrada');
        }
        const roleId = role.id;
        const password = await password_1.Password.create(dto.senha);
        const user = new user_1.User({
            nome: dto.nome,
            usuario,
            password,
            roleId,
            role,
        });
        return await this.userRepository.save(user);
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('IRoleRepository')),
    __metadata("design:paramtypes", [Object, Object])
], CreateUserUseCase);
//# sourceMappingURL=create-user.use-case.js.map