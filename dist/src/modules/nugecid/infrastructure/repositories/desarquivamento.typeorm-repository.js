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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DesarquivamentoTypeOrmRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoTypeOrmRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("@nestjs/common");
const desarquivamento_typeorm_entity_1 = require("../entities/desarquivamento.typeorm-entity");
const desarquivamento_mapper_1 = require("../mappers/desarquivamento.mapper");
let DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository_1 = class DesarquivamentoTypeOrmRepository {
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
        this.logger = new common_2.Logger(DesarquivamentoTypeOrmRepository_1.name);
    }
    async create(desarquivamento) {
        const entity = this.mapper.toTypeOrm(desarquivamento);
        const savedEntity = await this.repository.save(entity);
        return this.mapper.toDomain(savedEntity);
    }
    async update(desarquivamento) {
        const entity = this.mapper.toTypeOrm(desarquivamento);
        const savedEntity = await this.repository.save(entity);
        return this.mapper.toDomain(savedEntity);
    }
    async findById(id) {
        const entity = await this.repository.findOne({
            where: { id: id.value },
            relations: ['criadoPor', 'responsavel'],
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findByIdWithDeleted(id) {
        const entity = await this.repository.findOne({
            where: { id: id.value },
            relations: ['criadoPor', 'responsavel'],
            withDeleted: true,
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findAll(options) {
        const { page = 1, limit = 10, sortBy, sortOrder, filters } = options;
        const queryBuilder = this.repository.createQueryBuilder('d');
        const filtersWithDefaults = {
            ...filters,
            incluirExcluidos: filters?.incluirExcluidos ?? false
        };
        this.applyFilters(queryBuilder, filtersWithDefaults);
        if (sortBy) {
            queryBuilder.orderBy(`d.${sortBy}`, sortOrder || 'ASC');
        }
        else {
            queryBuilder.orderBy('d.createdAt', 'DESC');
        }
        const [entities, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: entities.map(e => this.mapper.toDomain(e)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async delete(id) {
        await this.repository.delete(id.value);
    }
    async softDelete(id) {
        this.logger.log(`[REPOSITORY] Iniciando soft delete para ID: ${id.value}`);
        try {
            const exists = await this.repository.findOne({
                where: { id: id.value },
                withDeleted: true
            });
            if (!exists) {
                this.logger.error(`[REPOSITORY] Registro com ID ${id.value} não encontrado para soft delete`);
                throw new Error(`Registro com ID ${id.value} não encontrado`);
            }
            this.logger.log(`[REPOSITORY] Registro encontrado, executando softDelete para ID: ${id.value}`);
            const result = await this.repository.softDelete(id.value);
            this.logger.log(`[REPOSITORY] Resultado do softDelete:`, {
                affected: result.affected,
                raw: result.raw
            });
            if (result.affected === 0) {
                this.logger.warn(`[REPOSITORY] ⚠️ Soft delete não afetou nenhum registro para ID: ${id.value}`);
            }
            else {
                this.logger.log(`[REPOSITORY] ✅ Soft delete executado com SUCESSO para ID: ${id.value}, ${result.affected} registro(s) afetado(s)`);
            }
            const afterDelete = await this.repository.findOne({
                where: { id: id.value },
                withDeleted: true
            });
            if (afterDelete && afterDelete.deletedAt) {
                this.logger.log(`[REPOSITORY] ✅ CONFIRMAÇÃO: Registro ID ${id.value} possui deletedAt = ${afterDelete.deletedAt}`);
            }
            else {
                this.logger.error(`[REPOSITORY] ❌ ERRO: Registro ID ${id.value} NÃO possui deletedAt após soft delete!`);
            }
        }
        catch (error) {
            this.logger.error(`[REPOSITORY] ❌ ERRO durante soft delete para ID ${id.value}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async restore(id) {
        await this.repository.restore(id.value);
    }
    async findByNumeroNicLaudoAuto(numeroNicLaudoAuto) {
        const entity = await this.repository.findOneBy({
            numeroNicLaudoAuto: numeroNicLaudoAuto,
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findByNumeroProcesso(numeroProcesso) {
        const entities = await this.repository.findBy({
            numeroProcesso: numeroProcesso,
        });
        return entities.map(e => this.mapper.toDomain(e));
    }
    async findByCriadoPor(userId, options) {
        return this.findAll({
            ...options,
            filters: { ...options?.filters, criadoPorId: userId },
        });
    }
    async findByResponsavel(userId, options) {
        return this.findAll({
            ...options,
            filters: { ...options?.filters, responsavelId: userId },
        });
    }
    async findOverdue() {
        const qb = this.repository.createQueryBuilder('d');
        const entities = await qb
            .where("d.dataSolicitacao + INTERVAL '30 days' < NOW() AND d.status NOT IN ('FINALIZADO', 'CANCELADO')")
            .getMany();
        return entities.map(e => this.mapper.toDomain(e));
    }
    async findUrgent() {
        const entities = await this.repository.findBy({ urgente: true });
        return entities.map(e => this.mapper.toDomain(e));
    }
    async getDashboardStats(userId, userRoles, dateRange) {
        const qb = this.repository.createQueryBuilder('d');
        if (dateRange) {
            qb.andWhere('d.createdAt BETWEEN :startDate AND :endDate', dateRange);
        }
        if (userId && userRoles && !userRoles.includes('ADMIN')) {
            qb.andWhere('d.criadoPorId = :userId', { userId });
        }
        const statsPromise = qb
            .select('COUNT(d.id)', 'totalRegistros')
            .addSelect("SUM(CASE WHEN d.status = 'SOLICITADO' THEN 1 ELSE 0 END)", 'pendentes')
            .addSelect("SUM(CASE WHEN d.status = 'DESARQUIVADO' THEN 1 ELSE 0 END)", 'emAndamento')
            .addSelect("SUM(CASE WHEN d.status = 'FINALIZADO' THEN 1 ELSE 0 END)", 'concluidos')
            .addSelect("SUM(CASE WHEN d.status = 'NAO_LOCALIZADO' THEN 1 ELSE 0 END)", 'naoLocalizados')
            .addSelect("SUM(CASE WHEN d.dataSolicitacao + INTERVAL '30 days' < NOW() AND d.status NOT IN ('FINALIZADO', 'NAO_LOCALIZADO') THEN 1 ELSE 0 END)", 'vencidos')
            .addSelect('SUM(CASE WHEN d.urgente = TRUE THEN 1 ELSE 0 END)', 'urgentes')
            .addSelect("AVG(CASE WHEN d.status = 'FINALIZADO' THEN EXTRACT(EPOCH FROM (d.dataDesarquivamentoSAG - d.dataSolicitacao)) ELSE NULL END)", 'tempoMedioAtendimentoSegundos')
            .addSelect("SUM(CASE WHEN d.dataSolicitacao + INTERVAL '30 days' BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END)", 'registrosVencendoEm7Dias')
            .getRawOne();
        const createFilteredQuery = () => {
            const queryBuilder = this.repository.createQueryBuilder('d');
            if (dateRange) {
                queryBuilder.where('d.createdAt BETWEEN :startDate AND :endDate', dateRange);
            }
            if (userId && userRoles && !userRoles.includes('ADMIN')) {
                const condition = dateRange ? 'andWhere' : 'where';
                queryBuilder[condition]('d.criadoPorId = :userId', { userId });
            }
            return queryBuilder;
        };
        const porTipoPromise = createFilteredQuery()
            .select('d.tipoDesarquivamento', 'tipo')
            .addSelect('COUNT(d.id)', 'count')
            .groupBy('d.tipoDesarquivamento')
            .getRawMany();
        const porMesPromise = createFilteredQuery()
            .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes')
            .addSelect('COUNT(d.id)', 'count')
            .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
            .orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
            .getRawMany();
        let eficienciaPorResponsavelPromise = Promise.resolve([]);
        if (userRoles?.includes('ADMIN')) {
            eficienciaPorResponsavelPromise = this.repository
                .createQueryBuilder('d')
                .select('d.responsavelId', 'responsavelId')
                .addSelect('u.nome', 'responsavelNome')
                .addSelect('COUNT(d.id)', 'total')
                .addSelect("SUM(CASE WHEN d.status = 'FINALIZADO' THEN 1 ELSE 0 END)", 'concluidos')
                .addSelect('AVG(EXTRACT(EPOCH FROM (d.dataDesarquivamentoSAG - d.createdAt)))', 'tempoMedio')
                .leftJoin('d.responsavel', 'u')
                .where('d.responsavelId IS NOT NULL')
                .groupBy('d.responsavelId, u.nome')
                .getRawMany();
        }
        const [stats, porTipo, porMes, eficienciaPorResponsavel] = await Promise.all([
            statsPromise,
            porTipoPromise,
            porMesPromise,
            eficienciaPorResponsavelPromise,
        ]);
        const totalRegistros = Number(stats.totalRegistros) || 0;
        const concluidos = Number(stats.concluidos) || 0;
        const taxaConclusao = totalRegistros > 0 ? (concluidos / totalRegistros) * 100 : 0;
        const tempoMedioAtendimento = (stats.tempoMedioAtendimentoSegundos || 0) / (24 * 60 * 60);
        return {
            totalRegistros,
            pendentes: Number(stats.pendentes) || 0,
            emAndamento: Number(stats.emAndamento) || 0,
            concluidos,
            naoLocalizados: Number(stats.naoLocalizados) || 0,
            cancelados: 0,
            vencidos: Number(stats.vencidos) || 0,
            urgentes: Number(stats.urgentes) || 0,
            porTipo: porTipo.reduce((acc, item) => ({ ...acc, [item.tipo]: Number(item.count) }), {}),
            porMes: porMes.reduce((acc, item) => ({ ...acc, [item.mes]: Number(item.count) }), {}),
            taxaConclusao: Math.round(taxaConclusao * 100) / 100,
            tempoMedioAtendimento: Math.round(tempoMedioAtendimento * 100) / 100,
            registrosVencendoEm7Dias: Number(stats.registrosVencendoEm7Dias) || 0,
            eficienciaPorResponsavel: eficienciaPorResponsavel?.reduce((acc, item) => ({
                ...acc,
                [item.responsavelNome || `ID: ${item.responsavelId}`]: {
                    total: Number(item.total),
                    concluidos: Number(item.concluidos),
                    tempoMedio: Math.round((Number(item.tempoMedio) / (24 * 60 * 60)) * 100) / 100,
                },
            }), {}),
        };
    }
    async countByStatus(status) {
        return this.repository.count({ where: { status } });
    }
    async countByTipo(tipo) {
        return this.repository.count({ where: { tipoDesarquivamento: tipo } });
    }
    async findByCodigoBarras(codigoBarras) {
        const entity = await this.repository.findOne({
            where: { numeroNicLaudoAuto: codigoBarras },
            relations: ['criadoPor', 'responsavel'],
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findByNumeroRegistro(numeroRegistro) {
        const entities = await this.repository.findBy({
            numeroProcesso: numeroRegistro,
        });
        return entities.map(e => this.mapper.toDomain(e));
    }
    async existsByCodigoBarras(codigoBarras) {
        const count = await this.repository.count({ where: { numeroNicLaudoAuto: codigoBarras } });
        return count > 0;
    }
    async existsByNumeroNicLaudoAuto(numeroNicLaudoAuto) {
        return this.repository.exist({ where: { numeroNicLaudoAuto: numeroNicLaudoAuto } });
    }
    async getNextSequenceNumber() {
        const result = await this.repository
            .createQueryBuilder('d')
            .select('MAX(d.id)', 'maxId')
            .withDeleted()
            .getRawOne();
        return (result.maxId || 0) + 1;
    }
    async createMany(desarquivamentos) {
        const entities = desarquivamentos.map(d => this.mapper.toTypeOrm(d));
        const saved = await this.repository.save(entities);
        return saved.map(e => this.mapper.toDomain(e));
    }
    async updateMany(desarquivamentos) {
        const entities = desarquivamentos.map(d => this.mapper.toTypeOrm(d));
        const saved = await this.repository.save(entities);
        return saved.map(e => this.mapper.toDomain(e));
    }
    applyFilters(qb, filters) {
        if (!filters)
            return;
        const { status, tipoDesarquivamento, search, criadoPorId, responsavelId, urgente, dataInicio, dataFim, incluirExcluidos, } = filters;
        if (status)
            qb.andWhere('d.status = :status', { status });
        if (tipoDesarquivamento)
            qb.andWhere('d.tipoDesarquivamento = :tipoDesarquivamento', { tipoDesarquivamento });
        if (criadoPorId)
            qb.andWhere('d.criadoPorId = :criadoPorId', { criadoPorId });
        if (responsavelId)
            qb.andWhere('d.responsavelId = :responsavelId', { responsavelId });
        if (urgente !== undefined)
            qb.andWhere('d.urgente = :urgente', { urgente });
        if (dataInicio && dataFim)
            qb.andWhere('d.createdAt BETWEEN :dataInicio AND :dataFim', {
                dataInicio,
                dataFim,
            });
        if (search) {
            qb.andWhere(new typeorm_2.Brackets(qb => {
                qb.where('d.nomeCompleto ILIKE :search', { search: `%${search}%` })
                    .orWhere('d.numeroProcesso ILIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('d.numeroNicLaudoAuto ILIKE :search', { search: `%${search}%` });
            }));
        }
        if (incluirExcluidos) {
            qb.withDeleted();
        }
    }
};
exports.DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository;
exports.DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        desarquivamento_mapper_1.DesarquivamentoMapper])
], DesarquivamentoTypeOrmRepository);
//# sourceMappingURL=desarquivamento.typeorm-repository.js.map