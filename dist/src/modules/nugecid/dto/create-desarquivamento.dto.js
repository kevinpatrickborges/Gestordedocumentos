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
const tipo_desarquivamento_vo_1 = require("../domain/value-objects/tipo-desarquivamento.vo");
const tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
class CreateDesarquivamentoDto {
    constructor() {
        this.solicitacaoProrrogacao = false;
        this.urgente = false;
    }
}
exports.CreateDesarquivamentoDto = CreateDesarquivamentoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de solicitação',
        enum: tipo_solicitacao_vo_1.TipoSolicitacaoEnum,
        example: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
    }),
    (0, class_validator_1.IsEnum)(tipo_solicitacao_vo_1.TipoSolicitacaoEnum),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do solicitante',
        example: 'João da Silva',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome do solicitante é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "nomeSolicitante", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requerente',
        example: 'João da Silva',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Requerente é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "requerente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número de registro (Processo, NIC, etc.)',
        example: '0800123-45.2025.8.20.0001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Número de registro é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "numeroRegistro", void 0);
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
        description: 'Tipo de desarquivamento (Físico ou Digital)',
        enum: tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum,
        example: tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum.FISICO,
    }),
    (0, class_validator_1.IsEnum)(tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum, {
        message: 'Tipo de desarquivamento deve ser FÍSICO ou DIGITAL',
    }),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "tipoDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número do NIC, Laudo, Auto ou Informação Técnica',
        example: 'NIC 123456',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateDesarquivamentoDto.prototype, "numeroNicLaudoAuto", void 0);
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
        description: 'Setor que está solicitando o desarquivamento',
        example: 'Delegacia de Plantão da Zona Sul',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Setor demandante é obrigatório' }),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
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
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se há uma solicitação de prorrogação de prazo',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
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