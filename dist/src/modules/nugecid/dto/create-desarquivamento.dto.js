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
exports.CreateDesarquivamentoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
class CreateDesarquivamentoDto {
    constructor() {
        this.urgente = false;
    }
}
exports.CreateDesarquivamentoDto = CreateDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo da solicitação',
        enum: tipo_solicitacao_vo_1.TipoSolicitacaoEnum,
        example: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
    }),
    (0, class_validator_1.IsEnum)(tipo_solicitacao_vo_1.TipoSolicitacaoEnum, {
        message: 'Tipo deve ser um dos valores válidos: DESARQUIVAMENTO, COPIA, VISTA, CERTIDAO',
    }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do requerente',
        example: 'João Silva Santos',
        minLength: 2,
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)({ message: 'Nome do requerente deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome do requerente é obrigatório' }),
    (0, class_validator_1.MinLength)(2, {
        message: 'Nome do solicitante deve ter pelo menos 2 caracteres',
    }),
    (0, class_validator_1.MaxLength)(255, {
        message: 'Nome do solicitante deve ter no máximo 255 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "nomeSolicitante", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome da vítima (quando aplicável)',
        example: 'Maria Oliveira',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Nome da vítima deve ser uma string' }),
    (0, class_validator_1.MaxLength)(255, {
        message: 'Nome da vítima deve ter no máximo 255 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "nomeVitima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do registro/processo',
        example: '2024.001.123456',
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)({ message: 'Número do registro deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Número do registro é obrigatório' }),
    (0, class_validator_1.MinLength)(3, {
        message: 'Número do registro deve ter pelo menos 3 caracteres',
    }),
    (0, class_validator_1.MaxLength)(50, {
        message: 'Número do registro deve ter no máximo 50 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "numeroRegistro", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo do documento solicitado',
        example: 'Laudo Pericial',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tipo do documento deve ser uma string' }),
    (0, class_validator_1.MaxLength)(100, {
        message: 'Tipo do documento deve ter no máximo 100 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do fato/ocorrência',
        example: '2024-01-15',
        type: 'string',
        format: 'date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data do fato deve estar no formato válido (YYYY-MM-DD)' }),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : null)),
    __metadata("design:type", Date)
], CreateDesarquivamentoDto.prototype, "dataFato", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Finalidade da solicitação',
        example: 'Processo judicial em andamento',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Finalidade deve ser uma string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Finalidade deve ter no máximo 500 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "finalidade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observações adicionais',
        example: 'Solicitação urgente para audiência',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Observações deve ser uma string' }),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Observações deve ter no máximo 1000 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "observacoes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se a solicitação é urgente',
        example: false,
        default: false,
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
], CreateDesarquivamentoDto.prototype, "urgente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Localização física do documento/processo',
        example: 'Arquivo Central - Estante 15, Prateleira 3',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Localização física deve ser uma string' }),
    (0, class_validator_1.MaxLength)(255, {
        message: 'Localização física deve ter no máximo 255 caracteres',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "localizacaoFisica", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data limite para atendimento',
        example: '2024-02-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Prazo de atendimento deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : null)),
    __metadata("design:type", Date)
], CreateDesarquivamentoDto.prototype, "prazoAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID do usuário responsável pelo atendimento',
        example: 2,
        type: 'integer',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDesarquivamentoDto.prototype, "responsavelId", void 0);
//# sourceMappingURL=create-desarquivamento.dto.js.map