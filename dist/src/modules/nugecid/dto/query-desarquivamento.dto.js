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
exports.QueryDesarquivamentoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const desarquivamento_entity_1 = require("../entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
class QueryDesarquivamentoDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'createdAt';
        this.sortOrder = 'DESC';
        this.incluirExcluidos = false;
        this.formato = 'json';
    }
}
exports.QueryDesarquivamentoDto = QueryDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número da página',
        example: 1,
        minimum: 1,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Página deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'Página deve ser maior que 0' }),
    __metadata("design:type", Number)
], QueryDesarquivamentoDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Quantidade de itens por página',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Limite deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'Limite deve ser maior que 0' }),
    (0, class_validator_1.Max)(100, { message: 'Limite deve ser no máximo 100' }),
    __metadata("design:type", Number)
], QueryDesarquivamentoDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Termo de busca (nome requerente, vítima, número registro, código barras)',
        example: 'João Silva',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Termo de busca deve ser uma string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtro por status (múltiplos valores permitidos)',
        enum: desarquivamento_entity_1.StatusDesarquivamento,
        isArray: true,
        example: [
            desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO,
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Status deve ser um array' }),
    (0, class_validator_1.IsEnum)(desarquivamento_entity_1.StatusDesarquivamento, {
        each: true,
        message: 'Cada status deve ser um valor válido: PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return [value];
        }
        return Array.isArray(value) ? value : [];
    }),
    __metadata("design:type", Array)
], QueryDesarquivamentoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtro por tipo de solicitação (múltiplos valores permitidos)',
        enum: tipo_solicitacao_vo_1.TipoSolicitacaoEnum,
        isArray: true,
        example: [tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO, tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Tipo deve ser um array' }),
    (0, class_validator_1.IsEnum)(tipo_solicitacao_vo_1.TipoSolicitacaoEnum, {
        each: true,
        message: 'Cada tipo deve ser um valor válido: DESARQUIVAMENTO, COPIA, VISTA, CERTIDAO',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return [value];
        }
        return Array.isArray(value) ? value : [];
    }),
    __metadata("design:type", Array)
], QueryDesarquivamentoDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtro por usuário solicitante',
        example: 1,
        type: 'integer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'ID do usuário deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'ID do usuário deve ser maior que 0' }),
    __metadata("design:type", Number)
], QueryDesarquivamentoDto.prototype, "usuarioId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtro por usuário responsável',
        example: 2,
        type: 'integer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'ID do responsável deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'ID do responsável deve ser maior que 0' }),
    __metadata("design:type", Number)
], QueryDesarquivamentoDto.prototype, "responsavelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data inicial para filtro (formato: YYYY-MM-DD)',
        example: '2024-01-01',
        type: 'string',
        format: 'date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data inicial deve estar no formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "dataInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data final para filtro (formato: YYYY-MM-DD)',
        example: '2024-12-31',
        type: 'string',
        format: 'date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data final deve estar no formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "dataFim", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrar apenas solicitações urgentes',
        example: true,
        type: 'boolean',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Urgente deve ser um valor booleano' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }),
    __metadata("design:type", Boolean)
], QueryDesarquivamentoDto.prototype, "urgente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrar apenas solicitações vencidas',
        example: false,
        type: 'boolean',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Vencidos deve ser um valor booleano' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }),
    __metadata("design:type", Boolean)
], QueryDesarquivamentoDto.prototype, "vencidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Campo para ordenação',
        example: 'createdAt',
        enum: [
            'createdAt',
            'nomeRequerente',
            'nomeVitima',
            'numeroRegistro',
            'status',
            'tipo',
            'prazoAtendimento',
            'dataAtendimento',
        ],
        default: 'createdAt',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Campo de ordenação deve ser uma string' }),
    (0, class_validator_1.IsIn)([
        'createdAt',
        'nomeRequerente',
        'nomeVitima',
        'numeroRegistro',
        'status',
        'tipo',
        'prazoAtendimento',
        'dataAtendimento',
    ], {
        message: 'Campo de ordenação deve ser um dos valores válidos',
    }),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Direção da ordenação',
        example: 'DESC',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Direção da ordenação deve ser uma string' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC'], {
        message: 'Direção da ordenação deve ser ASC ou DESC',
    }),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Incluir registros excluídos (soft delete)',
        example: false,
        type: 'boolean',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Incluir excluídos deve ser um valor booleano' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }),
    __metadata("design:type", Boolean)
], QueryDesarquivamentoDto.prototype, "incluirExcluidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Formato de resposta (para endpoints que suportam múltiplos formatos)',
        example: 'json',
        enum: ['json', 'excel', 'pdf'],
        default: 'json',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Formato deve ser uma string' }),
    (0, class_validator_1.IsIn)(['json', 'excel', 'pdf'], {
        message: 'Formato deve ser json, excel ou pdf',
    }),
    __metadata("design:type", String)
], QueryDesarquivamentoDto.prototype, "formato", void 0);
//# sourceMappingURL=query-desarquivamento.dto.js.map