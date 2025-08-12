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
exports.QueryUsersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class QueryUsersDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'criadoEm';
        this.sortOrder = 'DESC';
    }
}
exports.QueryUsersDto = QueryUsersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número da página',
        example: 1,
        required: false,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Página deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'Página deve ser maior que 0' }),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número de itens por página',
        example: 10,
        required: false,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Limit deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'Limit deve ser maior que 0' }),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Termo de busca (nome ou usuario)',
        example: 'João',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search deve ser uma string' }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da role para filtrar',
        example: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Role ID deve ser um número' }),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filtrar por status ativo',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)({ message: 'Ativo deve ser um valor booleano' }),
    __metadata("design:type", Boolean)
], QueryUsersDto.prototype, "ativo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Campo para ordenação',
        example: 'criadoEm',
        required: false,
        enum: ['nome', 'usuario', 'criadoEm', 'ultimoLogin'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'SortBy deve ser uma string' }),
    (0, class_validator_1.IsIn)(['nome', 'usuario', 'criadoEm', 'ultimoLogin'], {
        message: 'SortBy deve ser um dos valores: nome, usuario, criadoEm, ultimoLogin',
    }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Direção da ordenação',
        example: 'DESC',
        required: false,
        enum: ['ASC', 'DESC'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'SortOrder deve ser uma string' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC'], {
        message: 'SortOrder deve ser ASC ou DESC',
    }),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-users.dto.js.map