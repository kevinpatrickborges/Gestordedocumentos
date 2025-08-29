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
var NugecidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NugecidService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const desarquivamento_typeorm_entity_1 = require("./infrastructure/entities/desarquivamento.typeorm-entity");
const user_entity_1 = require("../users/entities/user.entity");
const nugecid_audit_service_1 = require("./nugecid-audit.service");
let NugecidService = NugecidService_1 = class NugecidService {
    constructor(desarquivamentoRepository, userRepository, nugecidAuditService) {
        this.desarquivamentoRepository = desarquivamentoRepository;
        this.userRepository = userRepository;
        this.nugecidAuditService = nugecidAuditService;
        this.logger = new common_1.Logger(NugecidService_1.name);
    }
    async create(createDesarquivamentoDto, currentUser) {
        const desarquivamento = this.desarquivamentoRepository.create({
            ...createDesarquivamentoDto,
            criadoPorId: currentUser.id,
            status: 'SOLICITADO',
        });
        const saved = await this.desarquivamentoRepository.save(desarquivamento);
        if (Array.isArray(saved)) {
            throw new Error('A operação de salvar retornou um array, mas um único objeto era esperado.');
        }
        await this.nugecidAuditService.saveDesarquivamentoAudit(currentUser.id, 'CREATE', saved, null);
        this.logger.log(`Desarquivamento criado: ${saved.numeroNicLaudoAuto} por ${currentUser.usuario}`);
        return this.findOne(saved.id);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
            .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel');
        this.applyFilters(queryBuilder, queryDto);
        const validSortFields = [
            'dataSolicitacao',
            'nomeCompleto',
            'numeroNicLaudoAuto',
            'numeroProcesso',
            'status',
            'tipoDesarquivamento',
        ];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'dataSolicitacao';
        queryBuilder.orderBy(`desarquivamento.${sortField}`, sortOrder);
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [desarquivamentos, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            desarquivamentos,
            total,
            page,
            limit,
            totalPages,
        };
    }
    applyFilters(queryBuilder, queryDto) {
        const { search, status, tipoDesarquivamento, usuarioId, dataInicio, dataFim, startDate, endDate, vencidos, } = queryDto;
        if (search) {
            queryBuilder.andWhere('(desarquivamento.nomeCompleto ILIKE :search OR ' +
                'desarquivamento.numeroNicLaudoAuto ILIKE :search OR ' +
                'desarquivamento.numeroProcesso ILIKE :search)', { search: `%${search}%` });
        }
        if (status && status.length > 0) {
            queryBuilder.andWhere('desarquivamento.status IN (:...status)', {
                status,
            });
        }
        if (tipoDesarquivamento && tipoDesarquivamento.length > 0) {
            queryBuilder.andWhere('desarquivamento.tipoDesarquivamento IN (:...tipoDesarquivamento)', { tipoDesarquivamento });
        }
        if (usuarioId) {
            queryBuilder.andWhere('desarquivamento.criadoPor.id = :usuarioId', {
                usuarioId,
            });
        }
        if (dataInicio) {
            queryBuilder.andWhere('desarquivamento.createdAt >= :dataInicio', {
                dataInicio: new Date(dataInicio),
            });
        }
        if (dataFim) {
            queryBuilder.andWhere('desarquivamento.createdAt <= :dataFim', {
                dataFim: new Date(dataFim),
            });
        }
        if (startDate) {
            queryBuilder.andWhere('desarquivamento.dataSolicitacao >= :startDate', {
                startDate: new Date(startDate),
            });
        }
        if (endDate) {
            queryBuilder.andWhere('desarquivamento.dataSolicitacao <= :endDate', {
                endDate: new Date(endDate),
            });
        }
        if (vencidos) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            queryBuilder.andWhere('desarquivamento.dataSolicitacao < :thirtyDaysAgo', {
                thirtyDaysAgo,
            });
            queryBuilder.andWhere('desarquivamento.status != :finalizado', {
                finalizado: 'FINALIZADO',
            });
        }
    }
    async findOne(id) {
        const desarquivamento = await this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
            .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel')
            .where('desarquivamento.id = :id', { id })
            .getOne();
        if (!desarquivamento) {
            throw new common_1.NotFoundException('Desarquivamento não encontrado');
        }
        return desarquivamento;
    }
    async findByBarcode(numeroNicLaudoAuto) {
        const desarquivamento = await this.desarquivamentoRepository.findOne({
            where: { numeroNicLaudoAuto },
            relations: ['usuario', 'responsavel'],
        });
        if (!desarquivamento) {
            throw new common_1.NotFoundException('Desarquivamento não encontrado');
        }
        return desarquivamento;
    }
    async update(id, updateDesarquivamentoDto, currentUser) {
        const desarquivamento = await this.findOne(id);
        if (!currentUser.isAdmin() && desarquivamento.criadoPorId !== currentUser.id) {
            throw new common_1.ForbiddenException('Você não tem permissão para editar este desarquivamento');
        }
        Object.assign(desarquivamento, updateDesarquivamentoDto);
        if (updateDesarquivamentoDto.responsavelId) {
            const responsavel = await this.userRepository.findOne({
                where: { id: updateDesarquivamentoDto.responsavelId },
            });
            if (!responsavel) {
                throw new common_1.BadRequestException('Responsável não encontrado');
            }
            desarquivamento.responsavelId = responsavel.id;
        }
        const updated = await this.desarquivamentoRepository.save(desarquivamento);
        await this.nugecidAuditService.saveDesarquivamentoAudit(currentUser.id, 'UPDATE', updated, updateDesarquivamentoDto);
        this.logger.log(`Desarquivamento atualizado: ${updated.numeroNicLaudoAuto} por ${currentUser.usuario}`);
        return this.findOne(updated.id);
    }
    async remove(id, currentUser) {
        const desarquivamento = await this.findOne(id);
        if (!currentUser.isAdmin() && desarquivamento.criadoPorId !== currentUser.id) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover este desarquivamento');
        }
        await this.desarquivamentoRepository.softDelete(id);
        await this.nugecidAuditService.saveAudit(currentUser.id, 'DELETE', 'DESARQUIVAMENTO', `Desarquivamento removido: ${desarquivamento.numeroNicLaudoAuto}`, { desarquivamentoId: desarquivamento.id });
        this.logger.log(`Desarquivamento removido: ${desarquivamento.numeroNicLaudoAuto} por ${currentUser.usuario}`);
    }
};
exports.NugecidService = NugecidService;
exports.NugecidService = NugecidService = NugecidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        nugecid_audit_service_1.NugecidAuditService])
], NugecidService);
//# sourceMappingURL=nugecid.service.js.map