import { Repository } from 'typeorm';
import { DesarquivamentoTypeOrmEntity } from '../nugecid/infrastructure/entities/desarquivamento.typeorm-entity';
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
export declare class EstatisticasService {
    private readonly desarquivamentoRepo;
    constructor(desarquivamentoRepo: Repository<DesarquivamentoTypeOrmEntity>);
    getCardData(): Promise<CardData>;
    getAtendimentosPorMes(): Promise<ChartData[]>;
    getStatusDistribuicao(): Promise<ChartData[]>;
}
