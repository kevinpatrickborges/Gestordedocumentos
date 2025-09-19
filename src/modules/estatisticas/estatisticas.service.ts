import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesarquivamentoTypeOrmEntity } from '../nugecid/infrastructure/entities/desarquivamento.typeorm-entity';
import { StatusDesarquivamentoEnum } from '../nugecid/domain/enums/status-desarquivamento.enum';

export interface CardData {
  totalAtendimentos: number;
  totalDesarquivamentos: number;
  atendimentosPendentes: number;
  atendimentosEsteMes: number;
}

export interface ChartData {
  name: string;
  total?: number;
  value?: number;
}

@Injectable()
export class EstatisticasService {
  constructor(
    @InjectRepository(DesarquivamentoTypeOrmEntity)
    private readonly desarquivamentoRepo: Repository<DesarquivamentoTypeOrmEntity>,
  ) {}

  async getCardData(): Promise<CardData> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [total, pendentes, esteMes] = await Promise.all([
      this.desarquivamentoRepo.count(),
      this.desarquivamentoRepo.count({
        where: { status: StatusDesarquivamentoEnum.SOLICITADO },
      }),
      this.desarquivamentoRepo
        .createQueryBuilder('d')
        .where('d.createdAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getCount(),
    ]);

    return {
      totalAtendimentos: total,
      totalDesarquivamentos: total,
      atendimentosPendentes: pendentes,
      atendimentosEsteMes: esteMes,
    };
  }

  async getAtendimentosPorMes(): Promise<ChartData[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Obter contagens por mês (últimos 12 meses)
    const rows: Array<{ mes: string; total: number }> =
      await this.desarquivamentoRepo
        .createQueryBuilder('d')
        .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes')
        .addSelect('COUNT(d.id)', 'total')
        .where('d.createdAt >= :start', { start })
        .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
        .orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')", 'ASC')
        .getRawMany();

    // Normalizar para incluir meses sem registros
    const result: ChartData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = rows.find(r => r.mes === key);
      const label = d.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
      result.push({ name: label, total: Number(found?.total || 0) });
    }

    return result;
  }

  async getStatusDistribuicao(): Promise<ChartData[]> {
    const rows: Array<{ status: string; total: number }> =
      await this.desarquivamentoRepo
        .createQueryBuilder('d')
        .select('d.status', 'status')
        .addSelect('COUNT(d.id)', 'total')
        .groupBy('d.status')
        .getRawMany();

    const mapNome: Record<string, string> = {
      ['SOLICITADO']: 'Solicitado',
      ['DESARQUIVADO']: 'Desarquivado',
      ['FINALIZADO']: 'Finalizado',
      ['NAO_LOCALIZADO']: 'Não Localizado',
      ['NAO_COLETADO']: 'Não Coletado',
      ['RETIRADO_PELO_SETOR']: 'Retirado pelo Setor',
      ['REARQUIVAMENTO_SOLICITADO']: 'Rearquivamento Solicitado',
    };

    return rows.map(r => ({
      name: mapNome[r.status] || r.status,
      value: Number(r.total),
    }));
  }
}
