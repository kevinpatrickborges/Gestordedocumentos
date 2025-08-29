import { Repository } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { DesarquivamentoTypeOrmEntity } from './modules/nugecid/infrastructure/entities/desarquivamento.typeorm-entity';
export declare class AppService {
    private readonly userRepository;
    private readonly desarquivamentoRepository;
    constructor(userRepository: Repository<User>, desarquivamentoRepository: Repository<DesarquivamentoTypeOrmEntity>);
    getDashboardData(user: any): Promise<{
        stats: {
            total: number;
            doMes: number;
            daSemana: number;
            emPosse: number;
            urgentes: number;
        };
        ultimosDesarquivamentos: DesarquivamentoTypeOrmEntity[];
    }>;
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
    };
}
