import { Response, Request } from 'express';
import { CreateDesarquivamentoUseCase, FindAllDesarquivamentosUseCase, FindDesarquivamentoByIdUseCase, UpdateDesarquivamentoUseCase, DeleteDesarquivamentoUseCase, RestoreDesarquivamentoUseCase } from './application/use-cases';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { NugecidImportService } from './nugecid-import.service';
import { NugecidStatsService } from './nugecid-stats.service';
import { NugecidPdfService } from './nugecid-pdf.service';
import { NugecidExportService } from './nugecid-export.service';
import { User } from '../users/entities/user.entity';
export declare class NugecidController {
    private readonly createDesarquivamentoUseCase;
    private readonly findAllDesarquivamentosUseCase;
    private readonly findDesarquivamentoByIdUseCase;
    private readonly updateDesarquivamentoUseCase;
    private readonly deleteDesarquivamentoUseCase;
    private readonly restoreDesarquivamentoUseCase;
    private readonly nugecidImportService;
    private readonly nugecidStatsService;
    private readonly nugecidPdfService;
    private readonly nugecidExportService;
    private readonly logger;
    constructor(createDesarquivamentoUseCase: CreateDesarquivamentoUseCase, findAllDesarquivamentosUseCase: FindAllDesarquivamentosUseCase, findDesarquivamentoByIdUseCase: FindDesarquivamentoByIdUseCase, updateDesarquivamentoUseCase: UpdateDesarquivamentoUseCase, deleteDesarquivamentoUseCase: DeleteDesarquivamentoUseCase, restoreDesarquivamentoUseCase: RestoreDesarquivamentoUseCase, nugecidImportService: NugecidImportService, nugecidStatsService: NugecidStatsService, nugecidPdfService: NugecidPdfService, nugecidExportService: NugecidExportService);
    create(createDesarquivamentoDto: CreateDesarquivamentoDto, currentUser: User, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    importDesarquivamentos(file: Express.Multer.File, currentUser: User, res: Response): Promise<Response<any, Record<string, any>>>;
    importRegistros(file: Express.Multer.File, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/import-result.dto").ImportResultDto;
    }>;
    getTermoDeEntrega(id: number, res: Response, currentUser: User): Promise<void>;
    findAll(queryDto: QueryDesarquivamentoDto, currentUser: User): Promise<{
        success: boolean;
        data: {
            id: number;
            codigoBarras?: string;
            tipoDesarquivamento: string;
            status: string;
            nomeCompleto: string;
            numeroNicLaudoAuto: string;
            numeroProcesso: string;
            tipoDocumento?: string;
            dataSolicitacao: Date;
            dataDesarquivamentoSAG?: Date;
            dataDevolucaoSetor?: Date;
            setorDemandante: string;
            servidorResponsavel: string;
            finalidadeDesarquivamento: string;
            solicitacaoProrrogacao: boolean;
            urgente?: boolean;
            criadoPorId: number;
            responsavelId?: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
            isOverdue?: boolean;
            daysUntilDeadline?: number;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findDeleted(queryDto: QueryDesarquivamentoDto, currentUser: User, req: any): Promise<{
        success: boolean;
        data: {
            id: number;
            codigoBarras?: string;
            tipoDesarquivamento: string;
            status: string;
            nomeCompleto: string;
            numeroNicLaudoAuto: string;
            numeroProcesso: string;
            tipoDocumento?: string;
            dataSolicitacao: Date;
            dataDesarquivamentoSAG?: Date;
            dataDevolucaoSetor?: Date;
            setorDemandante: string;
            servidorResponsavel: string;
            finalidadeDesarquivamento: string;
            solicitacaoProrrogacao: boolean;
            urgente?: boolean;
            criadoPorId: number;
            responsavelId?: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
            isOverdue?: boolean;
            daysUntilDeadline?: number;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    restore(id: string, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            message: string;
        };
        restoredAt: string;
        restoredBy: string;
    }>;
    getDashboard(): Promise<{
        success: boolean;
        data: import("./nugecid-stats.service").DashboardStats;
    }>;
    hardDelete(idParam: string, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: import("./application/use-cases").DeleteDesarquivamentoResponse;
    }>;
    exportToExcel(queryDto: QueryDesarquivamentoDto, currentUser: User, res: Response): Promise<void>;
    findOne(id: number, currentUser: User): Promise<{
        success: boolean;
        data: import("./application/use-cases").FindDesarquivamentoByIdResponse;
    }>;
    findByBarcode(codigo: string, currentUser: User): Promise<{
        success: boolean;
        data: {
            id: number;
            codigoBarras?: string;
            tipoDesarquivamento: string;
            status: string;
            nomeCompleto: string;
            numeroNicLaudoAuto: string;
            numeroProcesso: string;
            tipoDocumento?: string;
            dataSolicitacao: Date;
            dataDesarquivamentoSAG?: Date;
            dataDevolucaoSetor?: Date;
            setorDemandante: string;
            servidorResponsavel: string;
            finalidadeDesarquivamento: string;
            solicitacaoProrrogacao: boolean;
            urgente?: boolean;
            criadoPorId: number;
            responsavelId?: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
            isOverdue?: boolean;
            daysUntilDeadline?: number;
        };
    }>;
    update(id: number, updateDesarquivamentoDto: UpdateDesarquivamentoDto, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: import("./application/use-cases").UpdateDesarquivamentoResponse;
    }>;
    remove(idParam: string, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            deletedAt: string;
            deletedBy: number;
            type: string;
        };
    }>;
}
