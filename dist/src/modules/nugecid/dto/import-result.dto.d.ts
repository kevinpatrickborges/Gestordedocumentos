export declare class ImportResultDto {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: {
        row: number;
        details: any;
    }[];
    processingTime?: number;
    fileName?: string;
    fileSize?: number;
    importedAt?: Date;
    importedBy?: string;
}
