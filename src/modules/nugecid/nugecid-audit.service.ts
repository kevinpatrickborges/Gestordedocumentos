import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auditoria } from '../audit/entities/auditoria.entity';
import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';

@Injectable()
export class NugecidAuditService {
  private readonly logger = new Logger(NugecidAuditService.name);

  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async saveAudit(
    userId: number,
    action: string,
    resource: string,
    details: string,
    data?: any,
    resourceId?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const enrichedData = {
        details,
        originalData: data,
        timestamp: new Date().toISOString(),
        action,
        resource,
        userId,
        resourceId: resourceId || data?.desarquivamentoId || 0,
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          service: 'nugecid-service',
        },
      };

      const auditData = Auditoria.createResourceAudit(
        userId,
        action as any,
        resource as any,
        resourceId || data?.desarquivamentoId || 0,
        enrichedData,
        ipAddress || 'system',
        userAgent || 'nugecid-service',
      );

      const audit = this.auditoriaRepository.create(auditData);
      await this.auditoriaRepository.save(audit);

      this.logger.debug(
        `Auditoria salva: ${action} em ${resource} por usuário ${userId}`,
        { enrichedData },
      );
    } catch (error) {
      this.logger.error(
        `Erro ao salvar auditoria: ${error.message}`,
        error.stack,
      );
    }
  }

  async saveDesarquivamentoAudit(
    userId: number,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'VIEW',
    desarquivamento: Partial<DesarquivamentoTypeOrmEntity>,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const details = this.buildAuditDetails(action, desarquivamento, changes);

    const auditData = {
      desarquivamentoId: desarquivamento.id,
      numeroNicLaudoAuto: desarquivamento.numeroNicLaudoAuto,
      numeroProcesso: desarquivamento.numeroProcesso,
      nomeCompleto: desarquivamento.nomeCompleto,
      tipoDesarquivamento: desarquivamento.tipoDesarquivamento,
      status: desarquivamento.status,
      changes,
      previousValues: changes ? this.extractPreviousValues(changes) : null,
    };

    await this.saveAudit(
      userId,
      action,
      'DESARQUIVAMENTO',
      details,
      auditData,
      desarquivamento.id,
      ipAddress,
      userAgent,
    );
  }

  private buildAuditDetails(
    action: string,
    desarquivamento: Partial<DesarquivamentoTypeOrmEntity>,
    changes?: any,
  ): string {
    const baseInfo = `${desarquivamento.numeroNicLaudoAuto || 'N/A'} - ${desarquivamento.nomeCompleto || 'N/A'}`;

    switch (action) {
      case 'CREATE':
        return `Novo desarquivamento criado: ${baseInfo} (Tipo: ${desarquivamento.tipoDesarquivamento}, Status: ${desarquivamento.status})`;
      case 'UPDATE':
        const changedFields = changes ? Object.keys(changes).join(', ') : 'N/A';
        return `Desarquivamento atualizado: ${baseInfo} (Campos alterados: ${changedFields})`;
      case 'DELETE':
        return `Desarquivamento removido: ${baseInfo}`;
      case 'RESTORE':
        return `Desarquivamento restaurado: ${baseInfo}`;
      case 'VIEW':
        return `Desarquivamento visualizado: ${baseInfo}`;
      default:
        return `Ação ${action} executada em desarquivamento: ${baseInfo}`;
    }
  }

  private extractPreviousValues(changes: any): any {
    return null;
  }
}
