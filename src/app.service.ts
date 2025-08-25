import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './modules/users/entities/user.entity';
import {
  Desarquivamento,
  StatusDesarquivamento,
} from './modules/nugecid/entities/desarquivamento.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Desarquivamento)
    private readonly desarquivamentoRepository: Repository<Desarquivamento>,
  ) {}

  /**
   * Obtém dados consolidados para o dashboard
   */
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
        createdAt: { $gte: startOfMonth } as any,
        deletedAt: null,
      },
    });

    const desarquivamentosDaSemana = await this.desarquivamentoRepository.count(
      {
        where: {
          createdAt: { $gte: startOfWeek } as any,
          deletedAt: null,
        },
      },
    );

    // Desarquivamentos em posse (status específicos)
    const emPosse = await this.desarquivamentoRepository.count({
      where: {
        status: StatusDesarquivamento.EM_ANDAMENTO,
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
      where: whereCondition,
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
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
