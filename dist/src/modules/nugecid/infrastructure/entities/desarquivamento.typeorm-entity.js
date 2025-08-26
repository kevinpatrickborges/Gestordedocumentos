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
            entity.id = domain.id.value;
        }
        entity.codigoBarras = domain.codigoBarras.value;
        entity.tipoSolicitacao = domain.tipoSolicitacao.value;
        entity.status = domain.status.value;
        entity.nomeSolicitante = domain.nomeSolicitante;
        entity.nomeVitima = domain.nomeVitima;
        entity.numeroRegistro = domain.numeroRegistro.value;
        entity.numeroProcesso = domain.numeroProcesso;
        entity.tipoDocumento = domain.tipoDocumento;
        entity.dataFato = domain.dataFato;
        entity.prazoAtendimento = domain.prazoAtendimento;
        entity.dataAtendimento = domain.dataAtendimento;
        entity.resultadoAtendimento = domain.resultadoAtendimento;
        entity.finalidade = domain.finalidade;
        entity.observacoes = domain.observacoes;
        entity.urgente = domain.urgente;
        entity.localizacaoFisica = domain.localizacaoFisica;
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
            codigoBarras: this.codigoBarras,
            tipoSolicitacao: this.tipoSolicitacao,
            status: this.status,
            nomeSolicitante: this.nomeSolicitante,
            nomeVitima: this.nomeVitima,
            numeroRegistro: this.numeroRegistro,
            numeroProcesso: this.numeroProcesso,
            tipoDocumento: this.tipoDocumento,
            dataFato: this.dataFato,
            prazoAtendimento: this.prazoAtendimento,
            dataAtendimento: this.dataAtendimento,
            resultadoAtendimento: this.resultadoAtendimento,
            finalidade: this.finalidade,
            observacoes: this.observacoes,
            urgente: this.urgente,
            localizacaoFisica: this.localizacaoFisica,
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
    (0, typeorm_1.Column)({ name: 'codigo_barras', unique: true, length: 20 }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "codigoBarras", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tipo_solicitacao',
        type: 'varchar',
        default: 'DESARQUIVAMENTO',
    }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "tipoSolicitacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'PENDENTE' }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_solicitante', length: 255, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "nomeSolicitante", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requerente', length: 255, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "requerente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_vitima', length: 255, nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "nomeVitima", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_registro', length: 50, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "numeroRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_processo', length: 50, nullable: false }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "numeroProcesso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_documento', length: 100, nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "tipoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_fato', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "dataFato", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prazo_atendimento', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "prazoAtendimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_atendimento', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DesarquivamentoTypeOrmEntity.prototype, "dataAtendimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resultado_atendimento', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "resultadoAtendimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'finalidade', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "finalidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observacoes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'urgente', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DesarquivamentoTypeOrmEntity.prototype, "urgente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'localizacao_fisica', length: 255, nullable: true }),
    __metadata("design:type", String)
], DesarquivamentoTypeOrmEntity.prototype, "localizacaoFisica", void 0);
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
    (0, typeorm_1.Index)(['codigoBarras'], { unique: true }),
    (0, typeorm_1.Index)(['numeroRegistro']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['tipoSolicitacao']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['criadoPorId']),
    (0, typeorm_1.Index)(['responsavelId'])
], DesarquivamentoTypeOrmEntity);
//# sourceMappingURL=desarquivamento.typeorm-entity.js.map