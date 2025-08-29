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
exports.Desarquivamento = exports.TipoDesarquivamentoEnum = exports.TipoDesarquivamento = exports.TipoSolicitacaoEnum = exports.TipoSolicitacao = exports.StatusDesarquivamentoEnum = exports.StatusDesarquivamento = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../users/entities/user.entity");
const role_type_enum_1 = require("../../users/enums/role-type.enum");
var status_desarquivamento_vo_1 = require("../domain/value-objects/status-desarquivamento.vo");
Object.defineProperty(exports, "StatusDesarquivamento", { enumerable: true, get: function () { return status_desarquivamento_vo_1.StatusDesarquivamento; } });
Object.defineProperty(exports, "StatusDesarquivamentoEnum", { enumerable: true, get: function () { return status_desarquivamento_vo_1.StatusDesarquivamentoEnum; } });
var tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
Object.defineProperty(exports, "TipoSolicitacao", { enumerable: true, get: function () { return tipo_solicitacao_vo_1.TipoSolicitacao; } });
Object.defineProperty(exports, "TipoSolicitacaoEnum", { enumerable: true, get: function () { return tipo_solicitacao_vo_1.TipoSolicitacaoEnum; } });
var tipo_desarquivamento_vo_1 = require("../domain/value-objects/tipo-desarquivamento.vo");
Object.defineProperty(exports, "TipoDesarquivamento", { enumerable: true, get: function () { return tipo_desarquivamento_vo_1.TipoDesarquivamento; } });
Object.defineProperty(exports, "TipoDesarquivamentoEnum", { enumerable: true, get: function () { return tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum; } });
let Desarquivamento = class Desarquivamento {
    get criadoPorId() {
        return this.createdBy;
    }
    set criadoPorId(value) {
        this.createdBy = value;
    }
    setDefaultValues() {
    }
    updateTimestamp() {
    }
    isFinalized() {
        return this.status === 'FINALIZADO';
    }
    canBeAccessedBy(user) {
        if (user.role?.name === role_type_enum_1.RoleType.ADMIN) {
            return true;
        }
        if (this.criadoPor.id === user.id)
            return true;
        if (this.responsavelId === user.id)
            return true;
        return false;
    }
    canBeEditedBy(user) {
        if (user.role?.name === role_type_enum_1.RoleType.ADMIN) {
            return true;
        }
        if (this.status === 'FINALIZADO') {
            return false;
        }
        if (this.criadoPor.id === user.id &&
            this.status === 'SOLICITADO') {
            return true;
        }
        if (this.responsavelId === user.id &&
            this.status === 'DESARQUIVADO') {
            return true;
        }
        return false;
    }
    canBeDeletedBy(user) {
        return user.isAdmin() || user.id === this.criadoPor.id;
    }
    getStatusDisplay() {
        const statusMap = {
            'FINALIZADO': 'Finalizado',
            'DESARQUIVADO': 'Desarquivado',
            'NAO_COLETADO': 'Não Coletado',
            'SOLICITADO': 'Solicitado',
            'REARQUIVAMENTO_SOLICITADO': 'Rearquivamento Solicitado',
            'RETIRADO_PELO_SETOR': 'Retirado pelo Setor',
            'NAO_LOCALIZADO': 'Não Localizado',
        };
        return statusMap[this.status] || this.status;
    }
    getStatusColor() {
        const colors = {
            'FINALIZADO': 'success',
            'DESARQUIVADO': 'info',
            'NAO_COLETADO': 'warning',
            'SOLICITADO': 'primary',
            'REARQUIVAMENTO_SOLICITADO': 'secondary',
            'RETIRADO_PELO_SETOR': 'info',
            'NAO_LOCALIZADO': 'danger',
        };
        return colors[this.status] || 'secondary';
    }
    getStatusLabel() {
        return this.getStatusDisplay();
    }
    canTransitionTo(newStatus) {
        const transitions = {
            'SOLICITADO': ['DESARQUIVADO', 'NAO_LOCALIZADO'],
            'DESARQUIVADO': ['RETIRADO_PELO_SETOR', 'NAO_COLETADO', 'REARQUIVAMENTO_SOLICITADO'],
            'RETIRADO_PELO_SETOR': ['FINALIZADO'],
            'NAO_COLETADO': ['REARQUIVAMENTO_SOLICITADO'],
            'REARQUIVAMENTO_SOLICITADO': ['FINALIZADO'],
            'NAO_LOCALIZADO': [],
            'FINALIZADO': [],
        };
        return transitions[this.status]?.includes(newStatus) || false;
    }
    getPriority() {
        if (this.urgente)
            return 'ALTA';
        return 'MEDIA';
    }
};
exports.Desarquivamento = Desarquivamento;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID único do desarquivamento',
        example: 1,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Desarquivamento.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo do desarquivamento',
        example: 'FISICO',
        enum: ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'],
    }),
    (0, typeorm_1.Column)({ name: 'tipo_desarquivamento', type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "tipoDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status atual da solicitação',
        enum: ['FINALIZADO', 'DESARQUIVADO', 'NAO_COLETADO', 'SOLICITADO', 'REARQUIVAMENTO_SOLICITADO', 'RETIRADO_PELO_SETOR', 'NAO_LOCALIZADO'],
        example: 'SOLICITADO',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', default: 'SOLICITADO' }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do solicitante',
        example: 'João Silva Santos',
    }),
    (0, typeorm_1.Column)({ name: 'nome_completo', length: 255, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "nomeCompleto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA',
        example: '2024.001.123456',
    }),
    (0, typeorm_1.Column)({ name: 'numero_nic_laudo_auto', length: 100, nullable: false, unique: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "numeroNicLaudoAuto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do processo',
        example: '2024.001.123456',
    }),
    (0, typeorm_1.Column)({ name: 'numero_processo', length: 100, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "numeroProcesso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo do documento',
        example: 'Laudo Pericial',
    }),
    (0, typeorm_1.Column)({ name: 'tipo_documento', length: 100, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data de solicitação',
        example: '2024-01-15T08:30:00Z',
    }),
    (0, typeorm_1.Column)({ name: 'data_solicitacao', type: 'timestamptz', nullable: false }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do desarquivamento - SAG',
        example: '2024-02-10T14:30:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'data_desarquivamento_sag', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataDesarquivamentoSAG", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data da devolução pelo setor',
        example: '2024-02-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'data_devolucao_setor', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataDevolucaoSetor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Setor demandante',
        example: 'Perícia Criminal',
    }),
    (0, typeorm_1.Column)({ name: 'setor_demandante', length: 255, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "setorDemandante", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Servidor do ITEP responsável (matrícula)',
        example: '12345',
    }),
    (0, typeorm_1.Column)({ name: 'servidor_responsavel', length: 255, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "servidorResponsavel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Finalidade do desarquivamento',
        example: 'Processo judicial em andamento',
    }),
    (0, typeorm_1.Column)({ name: 'finalidade_desarquivamento', type: 'text', nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "finalidadeDesarquivamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Solicitação de prorrogação de prazo',
        example: false,
    }),
    (0, typeorm_1.Column)({ name: 'solicitacao_prorrogacao', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Desarquivamento.prototype, "solicitacaoProrrogacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica se a solicitação é urgente',
        example: false,
    }),
    (0, typeorm_1.Column)({ name: 'urgente', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Desarquivamento.prototype, "urgente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID do usuário responsável pelo atendimento',
        example: 2,
    }),
    (0, typeorm_1.Column)({ name: 'responsavel_id', nullable: true }),
    __metadata("design:type", Number)
], Desarquivamento.prototype, "responsavelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do usuário que criou o registro',
        example: 1,
    }),
    (0, typeorm_1.Column)({ name: 'created_by', nullable: false }),
    __metadata("design:type", Number)
], Desarquivamento.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data de criação do registro',
        example: '2024-01-15T08:30:00Z',
    }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data da última atualização',
        example: '2024-01-15T10:45:00Z',
    }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data de exclusão (soft delete)',
        example: null,
    }),
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Usuário solicitante',
        type: () => user_entity_1.User,
    }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Desarquivamento.prototype, "criadoPor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Usuário responsável pelo atendimento',
        type: () => user_entity_1.User,
    }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'responsavel_id' }),
    __metadata("design:type", user_entity_1.User)
], Desarquivamento.prototype, "responsavel", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Desarquivamento.prototype, "setDefaultValues", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Desarquivamento.prototype, "updateTimestamp", null);
exports.Desarquivamento = Desarquivamento = __decorate([
    (0, typeorm_1.Entity)('desarquivamentos'),
    (0, typeorm_1.Index)(['numeroNicLaudoAuto'], { unique: true }),
    (0, typeorm_1.Index)(['numeroProcesso']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['tipoDesarquivamento']),
    (0, typeorm_1.Index)(['dataSolicitacao']),
    (0, typeorm_1.Index)(['createdBy'])
], Desarquivamento);
//# sourceMappingURL=desarquivamento.entity.js.map