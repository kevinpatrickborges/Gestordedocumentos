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
var DesarquivamentoTypeOrmEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoTypeOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../users/entities/user.entity");
let DesarquivamentoTypeOrmEntity = DesarquivamentoTypeOrmEntity_1 = class DesarquivamentoTypeOrmEntity {
    get createdBy() {
        return this.criadoPorId;
    }
    set createdBy(value) {
        this.criadoPorId = value;
    }
    static fromDomain(domain) {
        const entity = new DesarquivamentoTypeOrmEntity_1();
        if (domain.id) {
            entity.id = domain.id.value || domain.id;
        }
        entity.tipoDesarquivamento = domain.tipoDesarquivamento;
        entity.status = domain.status.value || domain.status;
        entity.nomeCompleto = domain.nomeCompleto;
        entity.numeroNicLaudoAuto = domain.numeroNicLaudoAuto;
        entity.numeroProcesso = domain.numeroProcesso;
        entity.tipoDocumento = domain.tipoDocumento;
        entity.dataSolicitacao = domain.dataSolicitacao;
        entity.dataDesarquivamentoSAG = domain.dataDesarquivamentoSAG;
        entity.dataDevolucaoSetor = domain.dataDevolucaoSetor;
        entity.setorDemandante = domain.setorDemandante;
        entity.servidorResponsavel = domain.servidorResponsavel;
        entity.finalidadeDesarquivamento = domain.finalidadeDesarquivamento;
        entity.solicitacaoProrrogacao = domain.solicitacaoProrrogacao;
        entity.urgente = domain.urgente;
        entity.criadoPorId = domain.criadoPorId;
        entity.responsavelId = domain.responsavelId;
        entity.createdAt = domain.createdAt;
        entity.updatedAt = domain.updatedAt;
        entity.deletedAt = domain.deletedAt;
        return entity;
    }
    toDomain() {
        return {
            id: this.id,
            tipoDesarquivamento: this.tipoDesarquivamento,
            status: this.status,
            nomeCompleto: this.nomeCompleto,
            numeroNicLaudoAuto: this.numeroNicLaudoAuto,
            numeroProcesso: this.numeroProcesso,
            tipoDocumento: this.tipoDocumento,
            dataSolicitacao: this.dataSolicitacao,
            dataDesarquivamentoSAG: this.dataDesarquivamentoSAG,
            dataDevolucaoSetor: this.dataDevolucaoSetor,
            setorDemandante: this.setorDemandante,
            servidorResponsavel: this.servidorResponsavel,
            finalidadeDesarquivamento: this.finalidadeDesarquivamento,
            solicitacaoProrrogacao: this.solicitacaoProrrogacao,
            urgente: this.urgente,
            criadoPorId: this.criadoPorId,
            responsavelId: this.responsavelId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt,
        };
    }
};
exports.DesarquivamentoTypeOrmEntity = DesarquivamentoTypeOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DesarquivamentoTypeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_desarquivamento', type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "tipoDesarquivamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'SOLICITADO' }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_completo', length: 255, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "nomeCompleto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_nic_laudo_auto', length: 100, nullable: false, unique: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "numeroNicLaudoAuto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_processo', length: 50, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "numeroProcesso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_documento', length: 100, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "tipoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_solicitacao', type: 'timestamptz', nullable: false }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_desarquivamento_sag', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "dataDesarquivamentoSAG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_devolucao_setor', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "dataDevolucaoSetor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'setor_demandante', length: 255, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "setorDemandante", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'servidor_responsavel', length: 255, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "servidorResponsavel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'finalidade_desarquivamento', type: 'text', nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "finalidadeDesarquivamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'solicitacao_prorrogacao', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DesarquivamentoTypeOrmEntity.prototype, "solicitacaoProrrogacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'urgente', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], DesarquivamentoTypeOrmEntity.prototype, "urgente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: false }),
    __metadata("design:type", Number)
], DesarquivamentoTypeOrmEntity.prototype, "criadoPorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsavel_id', nullable: true }),
    __metadata("design:type", Number)
], DesarquivamentoTypeOrmEntity.prototype, "responsavelId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Promise)
], DesarquivamentoTypeOrmEntity.prototype, "criadoPor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'responsavel_id' }),
    __metadata("design:type", Promise)
], DesarquivamentoTypeOrmEntity.prototype, "responsavel", void 0);
exports.DesarquivamentoTypeOrmEntity = DesarquivamentoTypeOrmEntity = DesarquivamentoTypeOrmEntity_1 = __decorate([
    (0, typeorm_1.Entity)('desarquivamentos'),
    (0, typeorm_1.Index)(['numeroNicLaudoAuto'], { unique: true }),
    (0, typeorm_1.Index)(['numeroProcesso']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['tipoDesarquivamento']),
    (0, typeorm_1.Index)(['dataSolicitacao']),
    (0, typeorm_1.Index)(['criadoPorId']),
    (0, typeorm_1.Index)(['responsavelId'])
], DesarquivamentoTypeOrmEntity);
//# sourceMappingURL=desarquivamento.typeorm-entity.js.map