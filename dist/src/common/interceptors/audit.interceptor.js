"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auditoria_entity_1 = require("../../modules/audit/entities/auditoria.entity");
let AuditInterceptor = class AuditInterceptor {
    constructor(auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, params, query, ip } = request;
        const user = request.user;
        const shouldAudit = ['POST', 'PUT', 'DELETE'].includes(method) &&
            !url.includes('/auth/') &&
            !url.includes('/health');
        if (!shouldAudit || !user) {
            return next.handle();
        }
        const auditData = {
            userId: user.id,
            action: this.getActionFromMethod(method),
            resource: this.getResourceFromUrl(url),
            details: {
                method,
                url,
                body: this.sanitizeBody(body),
                params,
                query,
                ip,
                userAgent: request.get('User-Agent'),
            },
            timestamp: new Date(),
        };
        return next.handle().pipe((0, operators_1.tap)({
            next: response => {
                this.saveAudit({
                    ...auditData,
                    success: true,
                    response: this.sanitizeResponse(response),
                });
            },
            error: error => {
                this.saveAudit({
                    ...auditData,
                    success: false,
                    error: error.message || 'Erro desconhecido',
                });
            },
        }));
    }
    async saveAudit(auditData) {
        try {
            const audit = this.auditoriaRepository.create(auditData);
            await this.auditoriaRepository.save(audit);
        }
        catch (error) {
            console.error('Erro ao salvar auditoria:', error);
        }
    }
    getActionFromMethod(method) {
        const actions = {
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };
        return actions[method] || 'UNKNOWN';
    }
    getResourceFromUrl(url) {
        const parts = url.split('/').filter(Boolean);
        if (parts.length >= 2 && parts[0] === 'api') {
            return parts[1];
        }
        return parts[0] || 'unknown';
    }
    sanitizeBody(body) {
        if (!body)
            return null;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'senha', 'token', 'secret'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    sanitizeResponse(response) {
        if (!response)
            return null;
        const responseStr = JSON.stringify(response);
        if (responseStr.length > 1000) {
            return { message: 'Response too large to store' };
        }
        return response;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auditoria_entity_1.Auditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map