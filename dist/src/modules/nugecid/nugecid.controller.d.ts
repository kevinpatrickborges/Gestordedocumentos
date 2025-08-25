import { Response, Request } from 'express';
import { CreateDesarquivamentoUseCase, FindAllDesarquivamentosUseCase, FindDesarquivamentoByIdUseCase, UpdateDesarquivamentoUseCase, DeleteDesarquivamentoUseCase, RestoreDesarquivamentoUseCase, GenerateTermoEntregaUseCase, GetDashboardStatsUseCase, ImportDesarquivamentoUseCase, ImportRegistrosUseCase } from './application/use-cases';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { User } from '../users/entities/user.entity';
export declare class NugecidController {
    private readonly createDesarquivamentoUseCase;
    private readonly findAllDesarquivamentosUseCase;
    private readonly findDesarquivamentoByIdUseCase;
    private readonly updateDesarquivamentoUseCase;
    private readonly deleteDesarquivamentoUseCase;
    private readonly restoreDesarquivamentoUseCase;
    private readonly generateTermoEntregaUseCase;
    private readonly getDashboardStatsUseCase;
    private readonly importDesarquivamentoUseCase;
    private readonly importRegistrosUseCase;
    private readonly logger;
    constructor(createDesarquivamentoUseCase: CreateDesarquivamentoUseCase, findAllDesarquivamentosUseCase: FindAllDesarquivamentosUseCase, findDesarquivamentoByIdUseCase: FindDesarquivamentoByIdUseCase, updateDesarquivamentoUseCase: UpdateDesarquivamentoUseCase, deleteDesarquivamentoUseCase: DeleteDesarquivamentoUseCase, restoreDesarquivamentoUseCase: RestoreDesarquivamentoUseCase, generateTermoEntregaUseCase: GenerateTermoEntregaUseCase, getDashboardStatsUseCase: GetDashboardStatsUseCase, importDesarquivamentoUseCase: ImportDesarquivamentoUseCase, importRegistrosUseCase: ImportRegistrosUseCase);
    create(createDesarquivamentoDto: CreateDesarquivamentoDto, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    importDesarquivamentos(file: Express.Multer.File, currentUser: User, res: Response): Promise<Response<any, Record<string, any>>>;
    importRegistros(file: Express.Multer.File, currentUser: User): Promise<{
        success: boolean;
        message: string;
        data: {
            totalRows: number;
            successCount: number;
            errorCount: number;
            errors: {
                row: number;
                data: any;
                errors: Array<{
                    property: string;
                    constraints: Record<string, string>;
                }>;
            }[];
            summary: {
                message: string;
                details: string;
            };
        };
    }>;
    getTermoDeEntrega(id: number, res: Response, currentUser: User): Promise<void>;
    findAll(queryDto: QueryDesarquivamentoDto, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    getDashboard(currentUser: User, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    exportToExcel(queryDto: QueryDesarquivamentoDto, currentUser: User, res: Response): Promise<Response<any, Record<string, any>>>;
    findOne(id: number, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    findByBarcode(codigo: string, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    update(id: number, updateDesarquivamentoDto: UpdateDesarquivamentoDto, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    remove(id: number, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    restore(id: number, currentUser: User, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
