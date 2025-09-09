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
exports.Desarquivamento = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../users/entities/user.entity");
const role_type_enum_1 = require("../../users/enums/role-type.enum");
const status_desarquivamento_enum_1 = require("../domain/enums/status-desarquivamento.enum");
const tipo_desarquivamento_enum_1 = require("../domain/enums/tipo-desarquivamento.enum");
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
        return this.status === status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO;
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
        if (this.status === status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO) {
            return false;
        }
        if (this.criadoPor.id === user.id &&
            this.status === status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO) {
            return true;
        }
        if (this.responsavelId === user.id &&
            this.status === status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO) {
            return true;
        }
        return false;
    }
    canBeDeletedBy(user) {
        return user.isAdmin() || user.id === this.criadoPor.id;
    }
    getStatusDisplay() {
        const statusMap = {
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO]: 'Finalizado',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO]: 'Desarquivado',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_COLETADO]: 'Não Coletado',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO]: 'Solicitado',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO]: 'Rearquivamento Solicitado',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR]: 'Retirado pelo Setor',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_LOCALIZADO]: 'Não Localizado',
        };
        return statusMap[this.status] || this.status;
    }
    getStatusColor() {
        const colors = {
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO]: 'success',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO]: 'info',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_COLETADO]: 'warning',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO]: 'primary',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO]: 'secondary',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR]: 'info',
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_LOCALIZADO]: 'danger',
        };
        return colors[this.status] || 'secondary';
    }
    getStatusLabel() {
        return this.getStatusDisplay();
    }
    canTransitionTo(newStatus) {
        const transitions = {
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO]: [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO, status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_LOCALIZADO],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO]: [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR, status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_COLETADO, status_desarquivamento_enum_1.StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.RETIRADO_PELO_SETOR]: [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_COLETADO]: [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.REARQUIVAMENTO_SOLICITADO]: [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.NAO_LOCALIZADO]: [],
            [status_desarquivamento_enum_1.StatusDesarquivamentoEnum.FINALIZADO]: [],
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
        description: 'Desarquivamento Físico/Digital ou não localizado',
        example: 'FISICO',
        enum: tipo_desarquivamento_enum_1.TipoDesarquivamentoEnum,
    }),
    (0, typeorm_1.Column)({
        name: 'desarquivamento_fisico_digital',
        type: 'enum',
        enum: tipo_desarquivamento_enum_1.TipoDesarquivamentoEnum,
        nullable: false
    }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "desarquivamentoFisicoDigital", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status atual da solicitação',
        enum: status_desarquivamento_enum_1.StatusDesarquivamentoEnum,
        example: status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_desarquivamento_enum_1.StatusDesarquivamentoEnum,
        default: status_desarquivamento_enum_1.StatusDesarquivamentoEnum.SOLICITADO
    }),
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
    (0, typeorm_1.Column)({ name: 'data_solicitacao', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do desarquivamento - SAG',
        example: '2024-02-10T14:30:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'data_desarquivamento_sag', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataDesarquivamentoSAG", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data da devolução pelo setor',
        example: '2024-02-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'data_devolucao_setor', type: 'timestamp', nullable: true }),
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
    (0, typeorm_1.Index)(['desarquivamentoFisicoDigital']),
    (0, typeorm_1.Index)(['dataSolicitacao']),
    (0, typeorm_1.Index)(['createdBy'])
], Desarquivamento);
//# sourceMappingURL=desarquivamento.entity.js.map