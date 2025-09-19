import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { User } from './modules/users/entities/user.entity';
import { DesarquivamentoTypeOrmEntity } from './modules/nugecid/infrastructure/entities/desarquivamento.typeorm-entity';
import { StatusDesarquivamentoEnum } from './modules/nugecid/domain/enums/status-desarquivamento.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DesarquivamentoTypeOrmEntity)
    private readonly desarquivamentoRepository: Repository<DesarquivamentoTypeOrmEntity>,
  ) {}

  async getDashboardData(user: any) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Estatísticas gerais
    const totalDesarquivamentos = await this.desarquivamentoRepository.count({
      where: { deletedAt: null },
    });

    const desarquivamentosDoMes = await this.desarquivamentoRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth),
        deletedAt: null,
      },
    });

    const desarquivamentosDaSemana = await this.desarquivamentoRepository.count(
      {
        where: {
          createdAt: MoreThanOrEqual(startOfWeek),
          deletedAt: null,
        },
      },
    );

    // Desarquivamentos em posse (status específicos)
    const emPosse = await this.desarquivamentoRepository.count({
      where: {
        status: StatusDesarquivamentoEnum.DESARQUIVADO,
        deletedAt: null,
      },
    });

    // Desarquivamentos urgentes
    const urgentes = await this.desarquivamentoRepository.count({
      where: {
        urgente: true,
        deletedAt: null,
      },
    });

    // Últimos desarquivamentos (apenas para o usuário se não for admin)
    const whereCondition =
      user.role?.name === 'admin'
        ? { deletedAt: null }
        : { createdBy: user.id, deletedAt: null };

    const ultimosDesarquivamentos = await this.desarquivamentoRepository.find({
      where: whereCondition as any,
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['createdByUser'],
    });

    return {
      stats: {
        total: totalDesarquivamentos,
        doMes: desarquivamentosDoMes,
        daSemana: desarquivamentosDaSemana,
        emPosse,
        urgentes,
      },
      ultimosDesarquivamentos,
    };
  }

  /**
   * Health check da aplicação
   */
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
