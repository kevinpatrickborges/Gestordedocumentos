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
const VALID_STATUS = [
    'FINALIZADO',
    'DESARQUIVADO',
    'NAO_COLETADO',
    'SOLICITADO',
    'REARQUIVAMENTO_SOLICITADO',
    'RETIRADO_PELO_SETOR',
    'NAO_LOCALIZADO'
];
const VALID_TIPO_DESARQUIVAMENTO = [
    'FISICO',
    'DIGITAL',
    'NAO_LOCALIZADO'
];
class UpdateDesarquivamentoDto {
}
exports.UpdateDesarquivamentoDto = UpdateDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo de desarquivamento',
        example: 'FISICO',
        enum: VALID_TIPO_DESARQUIVAMENTO,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(VALID_TIPO_DESARQUIVAMENTO, {
        message: 'Tipo de desarquivamento deve ser: FISICO, DIGITAL ou NAO_LOCALIZADO'
    }),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "tipoDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Status da solicitação',
        enum: VALID_STATUS,
        example: 'SOLICITADO',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(VALID_STATUS, {
        message: 'Status deve ser um dos valores válidos: FINALIZADO, DESARQUIVADO, NAO_COLETADO, SOLICITADO, REARQUIVAMENTO_SOLICITADO, RETIRADO_PELO_SETOR, NAO_LOCALIZADO',
    }),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome completo do solicitante',
        example: 'João Silva Santos',
        minLength: 2,
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "nomeCompleto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número do NIC, Laudo, Auto ou Informação Técnica',
        example: 'NIC-2024-123456',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "numeroNicLaudoAuto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número do processo',
        example: '2025.001.123456',
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "numeroProcesso", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo do documento solicitado',
        example: 'Laudo Pericial',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data da solicitação',
        example: '2024-01-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data da solicitação deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : null)),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do desarquivamento pelo SAG',
        example: '2024-01-20T14:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data do desarquivamento SAG deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : null)),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "dataDesarquivamentoSAG", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data de devolução ao setor demandante',
        example: '2024-01-25T16:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de devolução ao setor deve estar no formato válido' }),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : null)),
    __metadata("design:type", Date)
], UpdateDesarquivamentoDto.prototype, "dataDevolucaoSetor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Setor que está solicitando o desarquivamento',
        example: 'Delegacia de Plantão da Zona Sul',
        minLength: 2,
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "setorDemandante", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Servidor do ITEP responsável pela solicitação',
        example: 'Maria Oliveira (mat. 654321)',
        minLength: 3,
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "servidorResponsavel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Finalidade e justificativa para o desarquivamento',
        example: 'Para instrução em processo judicial.',
        minLength: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateDesarquivamentoDto.prototype, "finalidadeDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se há uma solicitação de prorrogação de prazo',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDesarquivamentoDto.prototype, "solicitacaoProrrogacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se a solicitação é urgente',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
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
//# sourceMappingURL=update-desarquivamento.dto.js.map