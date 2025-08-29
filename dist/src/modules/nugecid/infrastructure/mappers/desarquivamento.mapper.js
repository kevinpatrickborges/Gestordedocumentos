"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoMapper = void 0;
const common_1 = require("@nestjs/common");
const desarquivamento_entity_1 = require("../../domain/entities/desarquivamento.entity");
const desarquivamento_typeorm_entity_1 = require("../entities/desarquivamento.typeorm-entity");
const value_objects_1 = require("../../domain/value-objects");
const status_desarquivamento_vo_1 = require("../../domain/value-objects/status-desarquivamento.vo");
let DesarquivamentoMapper = class DesarquivamentoMapper {
    toTypeOrm(domain) {
        const entity = new desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity();
        if (domain.id) {
            entity.id = domain.id.value;
        }
        entity.tipoDesarquivamento = domain.tipoDesarquivamento;
        entity.status = domain.status.value;
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
    toDomain(entity) {
        const id = entity.id ? value_objects_1.DesarquivamentoId.create(entity.id) : undefined;
        const status = value_objects_1.StatusDesarquivamento.create(entity.status);
        return desarquivamento_entity_1.DesarquivamentoDomain.reconstruct({
            id,
            tipoDesarquivamento: entity.tipoDesarquivamento,
            status,
            nomeCompleto: entity.nomeCompleto,
            numeroNicLaudoAuto: entity.numeroNicLaudoAuto,
            numeroProcesso: entity.numeroProcesso,
            tipoDocumento: entity.tipoDocumento,
            dataSolicitacao: entity.dataSolicitacao,
            dataDesarquivamentoSAG: entity.dataDesarquivamentoSAG,
            dataDevolucaoSetor: entity.dataDevolucaoSetor,
            setorDemandante: entity.setorDemandante,
            servidorResponsavel: entity.servidorResponsavel,
            finalidadeDesarquivamento: entity.finalidadeDesarquivamento,
            solicitacaoProrrogacao: entity.solicitacaoProrrogacao,
            urgente: entity.urgente,
            criadoPorId: entity.criadoPorId,
            responsavelId: entity.responsavelId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
        });
    }
    toDomainList(entities) {
        return entities.map(entity => this.toDomain(entity));
    }
    toTypeOrmList(domains) {
        return domains.map(domain => this.toTypeOrm(domain));
    }
    toPlainObject(domain) {
        return {
            id: domain.id?.value,
            tipoDesarquivamento: domain.tipoDesarquivamento,
            status: domain.status.value,
            nomeCompleto: domain.nomeCompleto,
            numeroNicLaudoAuto: domain.numeroNicLaudoAuto,
            numeroProcesso: domain.numeroProcesso,
            tipoDocumento: domain.tipoDocumento,
            dataSolicitacao: domain.dataSolicitacao,
            dataDesarquivamentoSAG: domain.dataDesarquivamentoSAG,
            dataDevolucaoSetor: domain.dataDevolucaoSetor,
            setorDemandante: domain.setorDemandante,
            servidorResponsavel: domain.servidorResponsavel,
            finalidadeDesarquivamento: domain.finalidadeDesarquivamento,
            solicitacaoProrrogacao: domain.solicitacaoProrrogacao,
            urgente: domain.urgente,
            criadoPorId: domain.criadoPorId,
            responsavelId: domain.responsavelId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
            isOverdue: domain.isOverdue(),
            daysUntilDeadline: domain.getDaysUntilDeadline(),
        };
    }
    toPlainObjectList(domains) {
        return domains.map(domain => this.toPlainObject(domain));
    }
    fromCreateDto(dto) {
        const status = value_objects_1.StatusDesarquivamento.create(status_desarquivamento_vo_1.StatusDesarquivamentoEnum.SOLICITADO);
        return desarquivamento_entity_1.DesarquivamentoDomain.create({
            tipoDesarquivamento: dto.tipoDesarquivamento,
            status,
            nomeCompleto: dto.nomeCompleto,
            numeroNicLaudoAuto: dto.numeroNicLaudoAuto,
            numeroProcesso: dto.numeroProcesso,
            tipoDocumento: dto.tipoDocumento,
            dataSolicitacao: dto.dataSolicitacao ? new Date(dto.dataSolicitacao) : new Date(),
            setorDemandante: dto.setorDemandante,
            servidorResponsavel: dto.servidorResponsavel,
            finalidadeDesarquivamento: dto.finalidadeDesarquivamento,
            solicitacaoProrrogacao: dto.solicitacaoProrrogacao || false,
            urgente: dto.urgente || false,
            criadoPorId: dto.criadoPorId,
        });
    }
    applyUpdateDto(domain, dto) {
        const currentData = domain.toPlainObject();
        const updatedData = {
            ...currentData,
            ...(dto.tipoDesarquivamento !== undefined && {
                tipoDesarquivamento: dto.tipoDesarquivamento,
            }),
            ...(dto.nomeCompleto !== undefined && {
                nomeCompleto: dto.nomeCompleto,
            }),
            ...(dto.numeroProcesso !== undefined && {
                numeroProcesso: dto.numeroProcesso,
            }),
            ...(dto.tipoDocumento !== undefined && {
                tipoDocumento: dto.tipoDocumento,
            }),
            ...(dto.setorDemandante !== undefined && {
                setorDemandante: dto.setorDemandante,
            }),
            ...(dto.servidorResponsavel !== undefined && {
                servidorResponsavel: dto.servidorResponsavel,
            }),
            ...(dto.finalidadeDesarquivamento !== undefined && {
                finalidadeDesarquivamento: dto.finalidadeDesarquivamento,
            }),
            ...(dto.solicitacaoProrrogacao !== undefined && {
                solicitacaoProrrogacao: dto.solicitacaoProrrogacao,
            }),
            ...(dto.urgente !== undefined && {
                urgente: dto.urgente,
            }),
            updatedAt: new Date(),
        };
        return desarquivamento_entity_1.DesarquivamentoDomain.reconstruct(updatedData);
    }
};
exports.DesarquivamentoMapper = DesarquivamentoMapper;
exports.DesarquivamentoMapper = DesarquivamentoMapper = __decorate([
    (0, common_1.Injectable)()
], DesarquivamentoMapper);
//# sourceMappingURL=desarquivamento.mapper.js.map