import { IDesarquivamentoRepository } from '../../../domain';
export interface GetDashboardStatsRequest {
    userId?: number;
    userRoles?: string[];
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
}
export interface GetDashboardStatsResponse {
    totalRegistros: number;
    pendentes: number;
    emAndamento: number;
    concluidos: number;
    cancelados: number;
    vencidos: number;
    urgentes: number;
    porTipo: {
        desarquivamento: number;
        copia: number;
        vista: number;
        certidao: number;
    };
    porMes: Record<string, number>;
    taxaConclusao: number;
    tempoMedioAtendimento: number;
    registrosVencendoEm7Dias: number;
    eficienciaPorResponsavel?: Record<string, {
        total: number;
        concluidos: number;
        tempoMedio: number;
    }>;
}
export declare class GetDashboardStatsUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: GetDashboardStatsRequest): Promise<GetDashboardStatsResponse>;
    private validateRequest;
    private formatResponse;
}
