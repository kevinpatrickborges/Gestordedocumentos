import { RegistrosService } from './registros.service';
export declare class RegistrosController {
    private readonly registrosService;
    constructor(registrosService: RegistrosService);
    importRegistros(file: Express.Multer.File): Promise<{
        totalRows: number;
        successCount: number;
        errorCount: number;
        errors: any[];
    }>;
}
