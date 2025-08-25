import { EstatisticasService } from './estatisticas.service';
export declare class EstatisticasController {
    private readonly estatisticasService;
    constructor(estatisticasService: EstatisticasService);
    getCardData(): Promise<{
        success: boolean;
        data: import("./estatisticas.service").CardData;
    }>;
    getAtendimentosPorMes(): Promise<{
        success: boolean;
        data: import("./estatisticas.service").ChartData[];
    }>;
    getStatusDistribuicao(): Promise<{
        success: boolean;
        data: import("./estatisticas.service").ChartData[];
    }>;
}
