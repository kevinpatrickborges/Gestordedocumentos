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
exports.Desarquivamento = exports.StatusDesarquivamento = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../users/entities/user.entity");
const role_type_enum_1 = require("../../users/enums/role-type.enum");
const tipo_solicitacao_vo_1 = require("../domain/value-objects/tipo-solicitacao.vo");
var StatusDesarquivamento;
(function (StatusDesarquivamento) {
    StatusDesarquivamento["PENDENTE"] = "PENDENTE";
    StatusDesarquivamento["EM_ANDAMENTO"] = "EM_ANDAMENTO";
    StatusDesarquivamento["CONCLUIDO"] = "CONCLUIDO";
    StatusDesarquivamento["CANCELADO"] = "CANCELADO";
})(StatusDesarquivamento || (exports.StatusDesarquivamento = StatusDesarquivamento = {}));
let Desarquivamento = class Desarquivamento {
    setDefaultValues() {
        if (!this.codigoBarras) {
            this.codigoBarras = this.generateBarcode();
        }
    }
    updateTimestamp() {
    }
    generateBarcode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = now.getTime().toString().slice(-4);
        return `DES${year}${month}${day}${timestamp}`;
    }
    isOverdue() {
        if (!this.prazoAtendimento)
            return false;
        return new Date() > this.prazoAtendimento &&
            this.status !== StatusDesarquivamento.CONCLUIDO &&
            this.status !== StatusDesarquivamento.CANCELADO;
    }
    canBeAccessedBy(user) {
        if (user.role?.name === role_type_enum_1.RoleType.ADMIN || user.role?.name === role_type_enum_1.RoleType.COORDENADOR) {
            return true;
        }
        if (this.criadoPor.id === user.id)
            return true;
        if (this.responsavelId === user.id)
            return true;
        return false;
    }
    canBeEditedBy(user) {
        if (user.role?.name === role_type_enum_1.RoleType.ADMIN || user.role?.name === role_type_enum_1.RoleType.COORDENADOR) {
            return true;
        }
        if (this.status === StatusDesarquivamento.CONCLUIDO ||
            this.status === StatusDesarquivamento.CANCELADO) {
            return false;
        }
        if (this.criadoPor.id === user.id && this.status === StatusDesarquivamento.PENDENTE) {
            return true;
        }
        if (this.responsavelId === user.id && this.status === StatusDesarquivamento.EM_ANDAMENTO) {
            return true;
        }
        return false;
    }
    canBeDeletedBy(user) {
        return user.isAdmin() || user.id === this.criadoPor.id;
    }
    getStatusDisplay() {
        const statusMap = {
            [StatusDesarquivamento.PENDENTE]: 'Pendente',
            [StatusDesarquivamento.EM_ANDAMENTO]: 'Em Andamento',
            [StatusDesarquivamento.CONCLUIDO]: 'Concluído',
            [StatusDesarquivamento.CANCELADO]: 'Cancelado',
        };
        return statusMap[this.status] || this.status;
    }
    getStatusColor() {
        const colors = {
            [StatusDesarquivamento.PENDENTE]: 'warning',
            [StatusDesarquivamento.EM_ANDAMENTO]: 'info',
            [StatusDesarquivamento.CONCLUIDO]: 'success',
            [StatusDesarquivamento.CANCELADO]: 'danger',
        };
        return colors[this.status] || 'secondary';
    }
    getStatusLabel() {
        const labels = {
            [StatusDesarquivamento.PENDENTE]: 'Pendente',
            [StatusDesarquivamento.EM_ANDAMENTO]: 'Em Andamento',
            [StatusDesarquivamento.CONCLUIDO]: 'Concluído',
            [StatusDesarquivamento.CANCELADO]: 'Cancelado',
        };
        return labels[this.status] || 'Desconhecido';
    }
    canTransitionTo(newStatus) {
        const transitions = {
            [StatusDesarquivamento.PENDENTE]: [
                StatusDesarquivamento.EM_ANDAMENTO,
                StatusDesarquivamento.CANCELADO
            ],
            [StatusDesarquivamento.EM_ANDAMENTO]: [
                StatusDesarquivamento.CONCLUIDO,
                StatusDesarquivamento.CANCELADO
            ],
            [StatusDesarquivamento.CONCLUIDO]: [],
            [StatusDesarquivamento.CANCELADO]: []
        };
        return transitions[this.status]?.includes(newStatus) || false;
    }
    getDaysUntilDeadline() {
        if (!this.prazoAtendimento)
            return null;
        const now = new Date();
        const deadline = new Date(this.prazoAtendimento);
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    getPriority() {
        if (this.urgente)
            return 'ALTA';
        const daysUntilDeadline = this.getDaysUntilDeadline();
        if (daysUntilDeadline === null)
            return 'BAIXA';
        if (daysUntilDeadline <= 3)
            return 'ALTA';
        if (daysUntilDeadline <= 7)
            return 'MEDIA';
        return 'BAIXA';
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
        description: 'Código de barras único gerado automaticamente',
        example: 'DES202401150001',
    }),
    (0, typeorm_1.Column)({ name: 'codigo_barras', unique: true, length: 20 }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "codigoBarras", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo da solicitação',
        enum: tipo_solicitacao_vo_1.TipoSolicitacaoEnum,
        example: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
    }),
    (0, typeorm_1.Column)({ name: 'tipo_solicitacao', type: 'varchar', default: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "tipoSolicitacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status atual da solicitação',
        enum: StatusDesarquivamento,
        example: StatusDesarquivamento.PENDENTE,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', default: StatusDesarquivamento.PENDENTE }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome completo do requerente',
        example: 'João Silva Santos',
    }),
    (0, typeorm_1.Column)({ name: 'nome_solicitante', length: 255, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "nomeSolicitante", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome da vítima (quando aplicável)',
        example: 'Maria Oliveira',
    }),
    (0, typeorm_1.Column)({ name: 'nome_vitima', length: 255, nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "nomeVitima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número do registro/processo',
        example: '2024.001.123456',
    }),
    (0, typeorm_1.Column)({ name: 'numero_registro', length: 50, nullable: false }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "numeroRegistro", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo do documento solicitado',
        example: 'Laudo Pericial',
    }),
    (0, typeorm_1.Column)({ name: 'tipo_documento', length: 100, nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data do fato/ocorrência',
        example: '2024-01-15',
        type: 'string',
        format: 'date',
    }),
    (0, typeorm_1.Column)({ name: 'data_fato', type: 'date', nullable: true }),
    (0, class_transformer_1.Transform)(({ value }) => value ? value.toISOString().split('T')[0] : null),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataFato", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data limite para atendimento',
        example: '2024-02-15T10:00:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'prazo_atendimento', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "prazoAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data de conclusão da solicitação',
        example: '2024-02-10T14:30:00Z',
        type: 'string',
        format: 'date-time',
    }),
    (0, typeorm_1.Column)({ name: 'data_atendimento', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Desarquivamento.prototype, "dataAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resultado ou observações do atendimento',
        example: 'Documento localizado e disponibilizado',
    }),
    (0, typeorm_1.Column)({ name: 'resultado_atendimento', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "resultadoAtendimento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Finalidade da solicitação',
        example: 'Processo judicial em andamento',
    }),
    (0, typeorm_1.Column)({ name: 'finalidade', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "finalidade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observações adicionais',
        example: 'Solicitação urgente para audiência',
    }),
    (0, typeorm_1.Column)({ name: 'observacoes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "observacoes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica se a solicitação é urgente',
        example: false,
    }),
    (0, typeorm_1.Column)({ name: 'urgente', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Desarquivamento.prototype, "urgente", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Localização física do documento/processo',
        example: 'Arquivo Central - Estante 15, Prateleira 3',
    }),
    (0, typeorm_1.Column)({ name: 'localizacao_fisica', length: 255, nullable: true }),
    __metadata("design:type", String)
], Desarquivamento.prototype, "localizacaoFisica", void 0);
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
    (0, typeorm_1.Index)(['codigoBarras'], { unique: true }),
    (0, typeorm_1.Index)(['numeroRegistro']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['tipoSolicitacao']),
    (0, typeorm_1.Index)(['createdAt'])
], Desarquivamento);
//# sourceMappingURL=desarquivamento.entity.js.map