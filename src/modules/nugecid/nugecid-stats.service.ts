import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';
import { StatusDesarquivamentoEnum } from './domain/enums/status-desarquivamento.enum';

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

@Injectable()
export class NugecidStatsService {
  private readonly logger = new Logger(NugecidStatsService.name);

  constructor(
    @InjectRepository(DesarquivamentoTypeOrmEntity)
    private readonly desarquivamentoRepository: Repository<DesarquivamentoTypeOrmEntity>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const total = await this.desarquivamentoRepository.count();

    const pendentes = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamentoEnum.SOLICITADO },
    });

    const emAndamento = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamentoEnum.DESARQUIVADO },
    });

    const concluidos = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamentoEnum.FINALIZADO },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const vencidos = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .where('desarquivamento.dataSolicitacao < :thirtyDaysAgo', {
        thirtyDaysAgo,
      })
      .andWhere('desarquivamento.status != :finalizado', {
        finalizado: 'FINALIZADO',
      })
      .getCount();

    const porStatus = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .select('desarquivamento.status', 'status')
      .addSelect('COUNT(desarquivamento.id)', 'count')
      .groupBy('desarquivamento.status')
      .getRawMany();

    const porTipo = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .select('desarquivamento.tipoDesarquivamento', 'tipo')
      .addSelect('COUNT(desarquivamento.id)', 'count')
      .groupBy('desarquivamento.tipoDesarquivamento')
      .getRawMany();

    const recentes = await this.desarquivamentoRepository.find({
      relations: ['criadoPor'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      total,
      pendentes,
      emAndamento,
      concluidos,
      vencidos,
      porStatus: porStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
        color: this.getStatusColor(item.status),
      })),
      porTipo: porTipo.map(item => ({
        tipo: item.tipo,
        count: parseInt(item.count),
      })),
      recentes,
    };
  }

  private getStatusColor(status: string): string {
    const colors = {
      FINALIZADO: '#10b981',
      DESARQUIVADO: '#3b82f6',
      NAO_COLETADO: '#f59e0b',
      SOLICITADO: '#8b5cf6',
      REARQUIVAMENTO_SOLICITADO: '#6b7280',
      RETIRADO_PELO_SETOR: '#06b6d4',
      NAO_LOCALIZADO: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }
}
