export interface ImportRegistrosRequest {
    file: Express.Multer.File;
    userId: number;
}
export interface ImportRegistrosResponse {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
        row: number;
        data: any;
        errors: Array<{
            property: string;
            constraints: Record<string, string>;
        }>;
    }>;
    summary: {
        message: string;
        details: string;
    };
}
export declare class ImportRegistrosUseCase {
    private readonly logger;
    execute(request: ImportRegistrosRequest): Promise<ImportRegistrosResponse>;
    private validateFile;
    private mapRowToDto;
    private mapTipoDesarquivamento;
    private mapStatusDesarquivamento;
    private sanitizeString;
    private formatDate;
    private mapBoolean;
    private saveRegistro;
    private generateSummaryMessage;
    private generateSummaryDetails;
}
