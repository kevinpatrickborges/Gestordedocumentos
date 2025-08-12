import { CreateDesarquivamentoUseCase } from '../create-desarquivamento/create-desarquivamento.use-case';
interface ImportResult {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: {
        row: number;
        details: any;
    }[];
}
export declare class ImportDesarquivamentoUseCase {
    private readonly createDesarquivamentoUseCase;
    constructor(createDesarquivamentoUseCase: CreateDesarquivamentoUseCase);
    execute(fileBuffer: Buffer, criadoPorId?: number): Promise<ImportResult>;
}
export {};
