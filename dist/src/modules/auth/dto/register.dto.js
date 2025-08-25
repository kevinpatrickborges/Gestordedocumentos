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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do usuário',
        example: 'João Silva',
    }),
    (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome de usuário',
        example: 'joao.silva',
    }),
    (0, class_validator_1.IsString)({ message: 'Usuário deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Usuário é obrigatório' }),
    (0, class_validator_1.MinLength)(3, { message: 'Usuário deve ter pelo menos 3 caracteres' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Usuário deve ter no máximo 50 caracteres' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._-]+$/, {
        message: 'Usuário deve conter apenas letras, números, pontos, hífens e underscores',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Senha do usuário',
        example: 'senha123',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "senha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da role do usuário',
        example: 2,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Role ID deve ser um número' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Role ID é obrigatório' }),
    __metadata("design:type", Number)
], RegisterDto.prototype, "roleId", void 0);
//# sourceMappingURL=register.dto.js.map