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
exports.UpdateDesarquivamentoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const desarquivamento_entity_1 = require("../entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
class UpdateDesarquivamentoDto {
}
exports.UpdateDesarquivamentoDto = UpdateDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo da solicitação',
        enum: tipo_solicitacao_vo_1.TipoSolicitacaoEnum,
        example: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tipo_solicitacao_vo_1.TipoSolicitacaoEnum, {
        message: 'Tipo deve ser um dos valores válidos: DESARQUIVAMENTO, COPIA, VISTA, CERTIDAO',
    }),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Status da solicitação',
        enum: desarquivamento_entity_1.StatusDesarquivamento,
        example: desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(desarquivamento_entity_1.StatusDesarquivamento, {
        message: 'Status deve ser um dos valores válidos: PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO',
    }),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome completo do requerente',
        example: 'João Silva Santos',
        minLength: 2,
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Nome do requerente deve ser uma string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Nome do requerente deve ter pelo menos 2 caracteres' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Nome do requerente deve ter no máximo 255 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "nomeRequerente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome da vítima (quando aplicável)',
        example: 'Maria Oliveira',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Nome da vítima deve ser uma string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Nome da vítima deve ter no máximo 255 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "nomeVitima", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número do registro/processo',
        example: '2024.001.123456',
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Número do registro deve ser uma string' }),
    (0, class_validator_1.MinLength)(3, { message: 'Número do registro deve ter pelo menos 3 caracteres' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Número do registro deve ter no máximo 50 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "numeroRegistro", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo do documento solicitado',
        example: 'Laudo Pericial',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tipo do documento deve ser uma string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Tipo do documento deve ter no máximo 100 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do fato/ocorrência',
        example: '2024-01-15',
        type: 'string',
        format: 'date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data do fato deve estar no formato válido (YYYY-MM-DD)' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "dataFato", void 0);
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
], UpdateDesarquivamentoDto.prototype, "finalidade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observações adicionais',
        example: 'Solicitação urgente para audiência',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Observações devem ser uma string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Observações devem ter no máximo 1000 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "observacoes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se a solicitação é urgente',
        example: false,
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
], UpdateDesarquivamentoDto.prototype, "urgente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Localização física do documento/processo',
        example: 'Arquivo Central - Estante 15, Prateleira 3',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Localização física deve ser uma string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Localização física deve ter no máximo 255 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "localizacaoFisica", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data limite para atendimento',
        example: '2024-02-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Prazo de atendimento deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "prazoAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID do usuário responsável pelo atendimento',
        example: 2,
        type: 'integer',
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'ID do responsável deve ser um número' }),
    (0, class_validator_1.Min)(1, { message: 'ID do responsável deve ser maior que 0' }),
    __metadata("design:type", Number)
], UpdateDesarquivamentoDto.prototype, "responsavelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data de conclusão da solicitação',
        example: '2024-02-10T14:30:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de conclusão deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : null),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "dataAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resultado ou observações do atendimento',
        example: 'Documento localizado e disponibilizado',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Resultado do atendimento deve ser uma string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Resultado do atendimento deve ter no máximo 1000 caracteres' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "resultadoAtendimento", void 0);
//# sourceMappingURL=update-desarquivamento.dto.js.map