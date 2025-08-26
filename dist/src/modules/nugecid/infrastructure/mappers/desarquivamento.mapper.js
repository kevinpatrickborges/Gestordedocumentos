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
        entity.codigoBarras = domain.codigoBarras.value;
        entity.tipoSolicitacao = domain.tipoSolicitacao.value;
        entity.status = domain.status.value;
        entity.numeroRegistro = domain.numeroRegistro.value;
        entity.nomeSolicitante = domain.nomeSolicitante;
        entity.requerente = domain.requerente;
        entity.nomeVitima = domain.nomeVitima;
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
    toDomain(entity) {
        const id = entity.id ? value_objects_1.DesarquivamentoId.create(entity.id) : undefined;
        const codigoBarras = value_objects_1.CodigoBarras.create(entity.codigoBarras);
        const numeroRegistro = value_objects_1.NumeroRegistro.create(entity.numeroRegistro);
        const status = value_objects_1.StatusDesarquivamento.create(entity.status);
        const tipoSolicitacao = value_objects_1.TipoSolicitacao.create(entity.tipoSolicitacao);
        return desarquivamento_entity_1.DesarquivamentoDomain.reconstruct({
            id,
            codigoBarras,
            tipoSolicitacao,
            status,
            nomeSolicitante: entity.nomeSolicitante,
            requerente: entity.requerente,
            nomeVitima: entity.nomeVitima,
            numeroRegistro,
            numeroProcesso: entity.numeroProcesso,
            tipoDocumento: entity.tipoDocumento,
            dataFato: entity.dataFato,
            prazoAtendimento: entity.prazoAtendimento,
            dataAtendimento: entity.dataAtendimento,
            resultadoAtendimento: entity.resultadoAtendimento,
            finalidade: entity.finalidade,
            observacoes: entity.observacoes,
            urgente: entity.urgente,
            localizacaoFisica: entity.localizacaoFisica,
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
            codigoBarras: domain.codigoBarras.value,
            tipoSolicitacao: domain.tipoSolicitacao.value,
            status: domain.status.value,
            nomeSolicitante: domain.nomeSolicitante,
            requerente: domain.requerente,
            nomeVitima: domain.nomeVitima,
            numeroRegistro: domain.numeroRegistro.value,
            tipoDocumento: domain.tipoDocumento,
            dataFato: domain.dataFato,
            prazoAtendimento: domain.prazoAtendimento,
            dataAtendimento: domain.dataAtendimento,
            resultadoAtendimento: domain.resultadoAtendimento,
            finalidade: domain.finalidade,
            observacoes: domain.observacoes,
            urgente: domain.urgente,
            localizacaoFisica: domain.localizacaoFisica,
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
        const codigoBarras = value_objects_1.CodigoBarras.generateNew();
        const numeroRegistro = value_objects_1.NumeroRegistro.create(dto.numeroRegistro);
        const status = value_objects_1.StatusDesarquivamento.create(status_desarquivamento_vo_1.StatusDesarquivamentoEnum.PENDENTE);
        const tipoSolicitacao = value_objects_1.TipoSolicitacao.create(dto.tipoSolicitacao);
        return desarquivamento_entity_1.DesarquivamentoDomain.create({
            codigoBarras,
            tipoSolicitacao,
            status,
            nomeSolicitante: dto.nomeSolicitante,
            requerente: dto.requerente,
            nomeVitima: dto.nomeVitima,
            numeroRegistro,
            tipoDocumento: dto.tipoDocumento,
            dataFato: dto.dataFato ? new Date(dto.dataFato) : undefined,
            finalidade: dto.finalidade,
            observacoes: dto.observacoes,
            urgente: dto.urgente || false,
            criadoPorId: dto.criadoPorId,
        });
    }
    applyUpdateDto(domain, dto) {
        const updates = {};
        if (dto.nomeSolicitante !== undefined) {
            updates.nomeSolicitante = dto.nomeSolicitante;
        }
        if (dto.requerente !== undefined) {
            updates.requerente = dto.requerente;
        }
        if (dto.nomeVitima !== undefined) {
            updates.nomeVitima = dto.nomeVitima;
        }
        if (dto.tipoDocumento !== undefined) {
            updates.tipoDocumento = dto.tipoDocumento;
        }
        if (dto.dataFato !== undefined) {
            updates.dataFato = dto.dataFato ? new Date(dto.dataFato) : undefined;
        }
        if (dto.finalidade !== undefined) {
            updates.finalidade = dto.finalidade;
        }
        if (dto.observacoes !== undefined) {
            updates.observacoes = dto.observacoes;
        }
        if (dto.urgente !== undefined) {
            updates.urgente = dto.urgente;
        }
        if (dto.localizacaoFisica !== undefined) {
            updates.localizacaoFisica = dto.localizacaoFisica;
        }
        if (dto.responsavelId !== undefined) {
            updates.responsavelId = dto.responsavelId;
        }
        if (dto.resultadoAtendimento !== undefined) {
            updates.resultadoAtendimento = dto.resultadoAtendimento;
        }
        if (dto.dataAtendimento !== undefined) {
            updates.dataAtendimento = dto.dataAtendimento
                ? new Date(dto.dataAtendimento)
                : undefined;
        }
        Object.keys(updates).forEach(key => {
            domain[key] = updates[key];
        });
        if (dto.status && dto.status !== domain.status.value) {
            const newStatus = value_objects_1.StatusDesarquivamento.create(dto.status);
            domain.changeStatus(newStatus);
        }
        return domain;
    }
};
exports.DesarquivamentoMapper = DesarquivamentoMapper;
exports.DesarquivamentoMapper = DesarquivamentoMapper = __decorate([
    (0, common_1.Injectable)()
], DesarquivamentoMapper);
//# sourceMappingURL=desarquivamento.mapper.js.map