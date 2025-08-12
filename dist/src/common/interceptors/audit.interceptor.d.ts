import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Auditoria } from '../../modules/audit/entities/auditoria.entity';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditoriaRepository;
    constructor(auditoriaRepository: Repository<Auditoria>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private saveAudit;
    private getActionFromMethod;
    private getResourceFromUrl;
    private sanitizeBody;
    private sanitizeResponse;
}
