import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, FindManyOptions } from 'typeorm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';
import { DesarquivamentoCommentTypeOrmEntity } from './infrastructure/entities/desarquivamento-comment.typeorm-entity';
import { TipoDesarquivamentoEnum } from './domain/enums/tipo-desarquivamento.enum';
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
import { ImportDesarquivamentoDto } from './dto/import-desarquivamento.dto';
import { ImportRegistroDto } from './dto/import-registro.dto';
import { validate } from 'class-validator';
import { StatusDesarquivamentoEnum } from './domain/enums/status-desarquivamento.enum';

export interface PaginatedDesarquivamentos {
  desarquivamentos: DesarquivamentoTypeOrmEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidos: number;
  vencidos: number;
  porStatus: { status: string; count: number; color: string }[];
  porTipo: { tipo: string; count: number }[];
  recentes: DesarquivamentoTypeOrmEntity[];
}

import { NugecidAuditService } from './nugecid-audit.service';

@Injectable()
export class NugecidService {
  private readonly logger = new Logger(NugecidService.name);

  constructor(
    @InjectRepository(DesarquivamentoTypeOrmEntity)
    private readonly desarquivamentoRepository: Repository<DesarquivamentoTypeOrmEntity>,
    @InjectRepository(DesarquivamentoCommentTypeOrmEntity)
    private readonly commentRepository: Repository<DesarquivamentoCommentTypeOrmEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly nugecidAuditService: NugecidAuditService,
  ) {}

  /**
   * Cria novo desarquivamento
   */
  async create(
    createDesarquivamentoDto: CreateDesarquivamentoDto,
    currentUser: User,
  ): Promise<DesarquivamentoTypeOrmEntity> {
    const desarquivamento = this.desarquivamentoRepository.create({
      ...createDesarquivamentoDto,
      criadoPorId: currentUser.id,
      status:
        (createDesarquivamentoDto as any).status ||
        StatusDesarquivamentoEnum.SOLICITADO,
    });

    const saved = (await this.desarquivamentoRepository.save(
      desarquivamento,
    )) as DesarquivamentoTypeOrmEntity;

    if (Array.isArray(saved)) {
      throw new Error(
        'A operação de salvar retornou um array, mas um único objeto era esperado.',
      );
    }

    // Salva auditoria detalhada
    await this.nugecidAuditService.saveDesarquivamentoAudit(
      currentUser.id,
      'CREATE',
      saved,
      null, // sem mudanças na criação
    );

    this.logger.log(
      `Desarquivamento criado: ${saved.numeroNicLaudoAuto} por ${currentUser.usuario}`,
    );

    return this.findOne(saved.id);
  }

  /**
   * Lista desarquivamentos com paginação e filtros
   */
  async findAll(
    queryDto: QueryDesarquivamentoDto,
  ): Promise<PaginatedDesarquivamentos> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

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
      'desarquivamentoFisicoDigital',
      'setorDemandante',
      'servidorResponsavel',
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : 'dataSolicitacao';
    queryBuilder.orderBy(
      `desarquivamento.${sortField}`,
      sortOrder as 'ASC' | 'DESC',
    );

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

  private applyFilters(
    queryBuilder: any,
    queryDto: QueryDesarquivamentoDto,
  ): void {
    const {
      search,
      status,
      tipoDesarquivamento,
      usuarioId,
      dataInicio,
      dataFim,
      startDate,
      endDate,
      vencidos,
    } = queryDto;

    if (search) {
      queryBuilder.andWhere(
        '(desarquivamento.nomeCompleto ILIKE :search OR ' +
          'desarquivamento.numeroNicLaudoAuto ILIKE :search OR ' +
          'desarquivamento.numeroProcesso ILIKE :search OR ' +
          'desarquivamento.setorDemandante ILIKE :search OR ' +
          'desarquivamento.servidorResponsavel ILIKE :search OR ' +
          'desarquivamento.tipoDocumento ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('desarquivamento.status IN (:...status)', {
        status,
      });
    }

    if (tipoDesarquivamento && tipoDesarquivamento.length > 0) {
      queryBuilder.andWhere(
        'desarquivamento.desarquivamentoFisicoDigital IN (:...tipoDesarquivamento)',
        { tipoDesarquivamento },
      );
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
      queryBuilder.andWhere(
        'desarquivamento.dataSolicitacao < :thirtyDaysAgo',
        {
          thirtyDaysAgo,
        },
      );
      queryBuilder.andWhere('desarquivamento.status != :finalizado', {
        finalizado: StatusDesarquivamentoEnum.FINALIZADO,
      });
    }
  }

  private async ensureExists(
    id: number,
  ): Promise<DesarquivamentoTypeOrmEntity> {
    const found = await this.desarquivamentoRepository.findOne({
      where: { id },
    });
    if (!found) {
      throw new NotFoundException(
        `Desarquivamento com ID ${id} não encontrado.`,
      );
    }
    return found;
  }

  async listComments(
    desarquivamentoId: number,
  ): Promise<DesarquivamentoCommentTypeOrmEntity[]> {
    await this.ensureExists(desarquivamentoId);
    return this.commentRepository.find({
      where: { desarquivamentoId },
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(
    desarquivamentoId: number,
    user: User,
    comment: string,
  ): Promise<DesarquivamentoCommentTypeOrmEntity> {
    if (!comment || !comment.trim()) {
      throw new BadRequestException('O comentário não pode ser vazio.');
    }

    await this.ensureExists(desarquivamentoId);

    const entity = this.commentRepository.create({
      desarquivamentoId,
      userId: user?.id ?? null,
      authorName: user?.nome || user?.usuario || 'Usuário',
      comment: comment.trim(),
    });

    return this.commentRepository.save(entity);
  }

  /**
   * Busca desarquivamento por ID
   */
  async findOne(id: number): Promise<DesarquivamentoTypeOrmEntity> {
    const desarquivamento = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
      .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel')
      .where('desarquivamento.id = :id', { id })
      .getOne();

    if (!desarquivamento) {
      throw new NotFoundException('Desarquivamento não encontrado');
    }

    return desarquivamento;
  }

  /**
   * Busca desarquivamento por código de barras
   */
  async findByBarcode(
    numeroNicLaudoAuto: string,
  ): Promise<DesarquivamentoTypeOrmEntity> {
    const desarquivamento = await this.desarquivamentoRepository.findOne({
      where: { numeroNicLaudoAuto },
      relations: ['usuario', 'responsavel'],
    });

    if (!desarquivamento) {
      throw new NotFoundException('Desarquivamento não encontrado');
    }

    return desarquivamento;
  }

  /**
   * Atualiza desarquivamento
   */
  async update(
    id: number,
    updateDesarquivamentoDto: UpdateDesarquivamentoDto,
    currentUser: User,
  ): Promise<DesarquivamentoTypeOrmEntity> {
    const desarquivamento = await this.findOne(id);

    // Verifica permissões - apenas admin ou criador pode editar
    if (
      !currentUser.isAdmin() &&
      desarquivamento.criadoPorId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este desarquivamento',
      );
    }

    // Atualiza os campos
    Object.assign(desarquivamento, updateDesarquivamentoDto);

    // Se mudou o responsável, atualiza
    if (updateDesarquivamentoDto.responsavelId) {
      const responsavel = await this.userRepository.findOne({
        where: { id: updateDesarquivamentoDto.responsavelId },
      });
      if (!responsavel) {
        throw new BadRequestException('Responsável não encontrado');
      }
      desarquivamento.responsavelId = responsavel.id;
    }

    const updated = await this.desarquivamentoRepository.save(desarquivamento);

    // Salva auditoria detalhada
    await this.nugecidAuditService.saveDesarquivamentoAudit(
      currentUser.id,
      'UPDATE',
      updated,
      updateDesarquivamentoDto,
    );

    this.logger.log(
      `Desarquivamento atualizado: ${updated.numeroNicLaudoAuto} por ${currentUser.usuario}`,
    );

    return this.findOne(updated.id);
  }

  /**
   * Remove desarquivamento (soft delete)
   */
  async remove(id: number, currentUser: User): Promise<void> {
    const desarquivamento = await this.findOne(id);

    // Verifica permissões - apenas admin ou criador pode deletar
    if (
      !currentUser.isAdmin() &&
      desarquivamento.criadoPorId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este desarquivamento',
      );
    }

    const result = await this.desarquivamentoRepository.softDelete(id);

    if (result.affected === 0) {
      this.logger.warn(
        `Tentativa de soft delete sem efeito para o ID: ${id}. O registro pode não ter sido encontrado.`,
      );
      throw new NotFoundException(
        `Desarquivamento com ID ${id} não encontrado para remoção.`,
      );
    }

    // Salva auditoria
    await this.nugecidAuditService.saveAudit(
      currentUser.id,
      'DELETE',
      'DESARQUIVAMENTO',
      `Desarquivamento removido: ${desarquivamento.numeroNicLaudoAuto}`,
      { desarquivamentoId: desarquivamento.id },
    );

    this.logger.log(
      `Desarquivamento removido: ${desarquivamento.numeroNicLaudoAuto} por ${currentUser.usuario}`,
    );
  }

  /**
   * Lista desarquivamentos removidos (lixeira)
   */
  async findAllDeleted(
    queryDto: QueryDesarquivamentoDto,
  ): Promise<PaginatedDesarquivamentos> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'deletedAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .withDeleted() // Adicionado para incluir os soft-deleted
      .where('desarquivamento.deletedAt IS NOT NULL')
      .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
      .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel');

    this.applyFilters(queryBuilder, queryDto);

    const validSortFields = ['deletedAt', 'nomeCompleto', 'numeroNicLaudoAuto'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'deletedAt';
    queryBuilder.orderBy(
      `desarquivamento.${sortField}`,
      sortOrder as 'ASC' | 'DESC',
    );

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

  /**
   * Restaura um desarquivamento removido (soft delete)
   */
  async restore(id: number, currentUser: User): Promise<void> {
    // Apenas admins podem restaurar
    if (!currentUser.isAdmin()) {
      throw new ForbiddenException(
        'Você não tem permissão para restaurar este desarquivamento',
      );
    }

    const restoreResult = await this.desarquivamentoRepository.restore(id);

    if (restoreResult.affected === 0) {
      throw new NotFoundException('Desarquivamento não encontrado na lixeira');
    }

    const desarquivamento = await this.findOne(id);

    // Salva auditoria
    await this.nugecidAuditService.saveAudit(
      currentUser.id,
      'RESTORE',
      'DESARQUIVamento',
      `Desarquivamento restaurado: ${desarquivamento.numeroNicLaudoAuto}`,
      { desarquivamentoId: id },
    );

    this.logger.log(
      `Desarquivamento restaurado: ${desarquivamento.numeroNicLaudoAuto} por ${currentUser.usuario}`,
    );
  }
}
