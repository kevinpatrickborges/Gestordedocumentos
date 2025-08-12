import { Repository } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { Desarquivamento } from './modules/nugecid/entities/desarquivamento.entity';
export declare class AppService {
    private readonly userRepository;
    private readonly desarquivamentoRepository;
    constructor(userRepository: Repository<User>, desarquivamentoRepository: Repository<Desarquivamento>);
    getDashboardData(user: any): Promise<{
        stats: {
            total: number;
            doMes: number;
            daSemana: number;
            emPosse: number;
            urgentes: number;
        };
        ultimosDesarquivamentos: Desarquivamento[];
    }>;
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
    };
}
