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
exports.RestoreUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_id_1 = require("../../domain/value-objects/user-id");
let RestoreUserUseCase = class RestoreUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const userId = new user_id_1.UserId(id);
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        if (!user.isDeleted) {
            throw new Error('Usuário não está deletado');
        }
        await this.userRepository.restore(userId);
        const restoredUser = await this.userRepository.findById(userId);
        if (!restoredUser) {
            throw new Error('Erro ao restaurar usuário');
        }
        return restoredUser;
    }
};
exports.RestoreUserUseCase = RestoreUserUseCase;
exports.RestoreUserUseCase = RestoreUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], RestoreUserUseCase);
//# sourceMappingURL=restore-user.use-case.js.map