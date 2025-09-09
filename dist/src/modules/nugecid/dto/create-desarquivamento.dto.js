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
const tipo_desarquivamento_enum_1 = require("../domain/enums/tipo-desarquivamento.enum");
class CreateDesarquivamentoDto {
    constructor() {
        this.urgente = false;
    }
}
exports.CreateDesarquivamentoDto = CreateDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Desarquivamento Físico/Digital ou não localizado',
        example: 'FISICO',
        enum: ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'],
    }),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        let v = value ?? obj?.desarquivamentoFisicoDigital;
        if (typeof v !== 'string')
            return v;
        return v.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipo de desarquivamento é obrigatório' }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Desarquivamento Físico/Digital ou não localizado (compatibilidade)',
        example: tipo_desarquivamento_enum_1.TipoDesarquivamentoEnum.FISICO,
        enum: tipo_desarquivamento_enum_1.TipoDesarquivamentoEnum,
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value !== 'string')
            return value;
        return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tipo_desarquivamento_enum_1.TipoDesarquivamentoEnum, { message: 'Tipo de desarquivamento deve ser FISICO, DIGITAL ou NAO_LOCALIZADO' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipo de desarquivamento é obrigatório' }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "desarquivamentoFisicoDigital", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do solicitante',
        example: 'João da Silva Santos',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome completo é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "nomeCompleto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do NIC, Laudo, Auto ou Informação Técnica',
        example: 'NIC-123456/2025',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Número NIC/Laudo/Auto é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "numeroNicLaudoAuto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do processo',
        example: '2025.001.123456',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Número do processo é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "numeroProcesso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo do documento',
        example: 'Laudo de Perícia Criminal',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipo de documento é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data da solicitação',
        example: '2025-01-15T10:30:00Z',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de solicitação deve estar em formato válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Data de solicitação é obrigatória' }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do desarquivamento no sistema SAG',
        example: '2025-01-20T14:30:00Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de desarquivamento SAG deve estar em formato válido' }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "dataDesarquivamentoSAG", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data da devolução pelo setor',
        example: '2025-01-25T16:00:00Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de devolução deve estar em formato válido' }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "dataDevolucaoSetor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Setor que está solicitando o desarquivamento',
        example: 'Instituto de Identificação',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Setor demandante é obrigatório' }),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "setorDemandante", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Servidor do ITEP responsável pela solicitação (Nome e Matrícula)',
        example: 'Maria Oliveira (mat. 654321)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Servidor responsável é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "servidorResponsavel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Finalidade e justificativa para o desarquivamento',
        example: 'Para instrução em processo judicial.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Finalidade é obrigatória' }),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "finalidadeDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica se há uma solicitação de prorrogação de prazo',
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Solicitação de prorrogação é obrigatória' }),
    __metadata("design:type", Boolean)
], CreateDesarquivamentoDto.prototype, "solicitacaoProrrogacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se a solicitação é urgente',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDesarquivamentoDto.prototype, "urgente", void 0);
//# sourceMappingURL=create-desarquivamento.dto.js.map