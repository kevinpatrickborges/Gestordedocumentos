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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auditoria = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["IMPORT"] = "IMPORT";
    AuditAction["VIEW"] = "VIEW";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let Auditoria = class Auditoria {
    static createLoginAudit(userId, ipAddress, userAgent, success, error) {
        return {
            userId,
            action: AuditAction.LOGIN,
            entityName: 'auth',
            ipAddress,
            userAgent,
            success,
            error,
            details: {
                loginAttempt: true,
                timestamp: new Date(),
            },
        };
    }
    static createLogoutAudit(userId, ipAddress, userAgent) {
        return {
            userId,
            action: AuditAction.LOGOUT,
            entityName: 'auth',
            ipAddress,
            userAgent,
            success: true,
            details: {
                logoutAction: true,
                timestamp: new Date(),
            },
        };
    }
    static createResourceAudit(userId, action, entityName, entityId, details, ipAddress, userAgent) {
        return {
            userId,
            action,
            entityName,
            entityId,
            details,
            ipAddress,
            userAgent,
            success: true,
        };
    }
    getActionLabel() {
        const labels = {
            [AuditAction.CREATE]: 'Criação',
            [AuditAction.UPDATE]: 'Atualização',
            [AuditAction.DELETE]: 'Exclusão',
            [AuditAction.LOGIN]: 'Login',
            [AuditAction.LOGOUT]: 'Logout',
            [AuditAction.EXPORT]: 'Exportação',
            [AuditAction.IMPORT]: 'Importação',
            [AuditAction.VIEW]: 'Visualização',
        };
        return labels[this.action] || 'Desconhecido';
    }
    getResourceLabel() {
        const labels = {
            auth: 'Autenticação',
            users: 'Usuários',
            nugecid: 'Desarquivamentos',
            dashboard: 'Dashboard',
            files: 'Arquivos',
        };
        return labels[this.entityName] || this.entityName;
    }
    isSuccessful() {
        return this.success;
    }
    hasError() {
        return !this.success && !!this.error;
    }
};
exports.Auditoria = Auditoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Auditoria.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", Number)
], Auditoria.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', enum: AuditAction, nullable: false }),
    __metadata("design:type", String)
], Auditoria.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_name', length: 100, nullable: false }),
    __metadata("design:type", String)
], Auditoria.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', nullable: true }),
    __metadata("design:type", Number)
], Auditoria.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Auditoria.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Auditoria.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Auditoria.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'timestamp' }),
    __metadata("design:type", Date)
], Auditoria.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.auditorias, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Auditoria.prototype, "user", void 0);
exports.Auditoria = Auditoria = __decorate([
    (0, typeorm_1.Entity)('auditorias')
], Auditoria);
//# sourceMappingURL=auditoria.entity.js.map