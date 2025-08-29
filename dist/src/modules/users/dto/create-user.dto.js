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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateUserDto {
    constructor() {
        this.ativo = true;
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do usuário',
        example: 'João Silva',
    }),
    (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome de usuário',
        example: 'usuario123',
    }),
    (0, class_validator_1.IsString)({ message: 'Usuário deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Usuário é obrigatório' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Senha do usuário',
        example: 'senha123',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "senha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role do usuário',
        example: 'admin',
        enum: ['admin', 'coordenador', 'usuario'],
    }),
    (0, class_validator_1.IsString)({ message: 'Role deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Role é obrigatória' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Se o usuário está ativo',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Ativo deve ser um valor booleano' }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "ativo", void 0);
//# sourceMappingURL=create-user.dto.js.map