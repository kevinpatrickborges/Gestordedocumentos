import { Repository } from 'typeorm';
import { Registro } from './entities/registro.entity';
export declare class RegistrosService {
    private readonly registroRepository;
    private readonly logger;
    constructor(registroRepository: Repository<Registro>);
    importFromXlsx(file: Express.Multer.File): Promise<{
        totalRows: number;
        successCount: number;
        errorCount: number;
        errors: any[];
    }>;
}
