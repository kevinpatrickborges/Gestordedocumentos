import { Request, Response } from 'express';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(res: Response): Response<any, Record<string, any>>;
    getDashboard(req: Request): Promise<{
        stats: {
            total: number;
            doMes: number;
            daSemana: number;
            emPosse: number;
            urgentes: number;
        };
        ultimosDesarquivamentos: import("./modules/nugecid/entities/desarquivamento.entity").Desarquivamento[];
        title: string;
        user: Express.User;
    }>;
    getSobre(req: Request): {
        title: string;
        version: string;
        description: string;
        user: Express.User;
    };
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
    };
}
