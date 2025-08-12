import { Repository } from 'typeorm';
import { Desarquivamento } from './entities/desarquivamento.entity';
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
export interface PaginatedDesarquivamentos {
    desarquivamentos: Desarquivamento[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DashboardStats {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidos: number;
    vencidos: number;
    porStatus: {
        status: string;
        count: number;
        color: string;
    }[];
    porTipo: {
        tipo: string;
        count: number;
    }[];
    recentes: Desarquivamento[];
}
export declare class NugecidService {
    private readonly desarquivamentoRepository;
    private readonly userRepository;
    private readonly auditoriaRepository;
    private readonly logger;
    constructor(desarquivamentoRepository: Repository<Desarquivamento>, userRepository: Repository<User>, auditoriaRepository: Repository<Auditoria>);
    create(createDesarquivamentoDto: CreateDesarquivamentoDto, currentUser: User): Promise<Desarquivamento>;
    findAll(queryDto: QueryDesarquivamentoDto): Promise<PaginatedDesarquivamentos>;
    findOne(id: number): Promise<Desarquivamento>;
    importFromXLSX(file: Express.Multer.File, currentUser: User): Promise<ImportResultDto>;
    findByBarcode(codigoBarras: string): Promise<Desarquivamento>;
    update(id: number, updateDesarquivamentoDto: UpdateDesarquivamentoDto, currentUser: User): Promise<Desarquivamento>;
    importRegistros(file: Express.Multer.File, currentUser: User): Promise<ImportResultDto>;
    remove(id: number, currentUser: User): Promise<void>;
    importFromExcel(filePath: string, currentUser: User): Promise<ImportResultDto>;
    getDashboardStats(): Promise<DashboardStats>;
    private createFromExcelRow;
    private mapTipoFromExcel;
    private parseBooleanFromExcel;
    private getStatusColor;
    generatePdf(desarquivamento: Desarquivamento): Promise<Buffer>;
    private saveAudit;
}
