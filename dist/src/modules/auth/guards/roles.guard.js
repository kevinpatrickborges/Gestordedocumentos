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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const is_public_decorator_1 = require("../../../common/decorators/is-public.decorator");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const classRef = context.getClass();
        const isPublic = this.reflector.getAllAndOverride(is_public_decorator_1.IS_PUBLIC_KEY, [handler, classRef]);
        if (isPublic) {
            return true;
        }
        const requiredRoles = this.reflector.getAllAndOverride('roles', [handler, classRef]);
        console.log('🔍 [RolesGuard] Required roles:', requiredRoles);
        if (!requiredRoles) {
            return true;
        }
        const user = request.user;
        console.log('👤 [RolesGuard] User object:', {
            id: user?.id,
            nome: user?.nome,
            role: user?.role,
            roleId: user?.roleId
        });
        if (!user) {
            throw new common_1.ForbiddenException('Usuário não autenticado');
        }
        if (!user.role) {
            console.log('❌ [RolesGuard] User role is null/undefined');
            throw new common_1.ForbiddenException('Usuário sem role definida');
        }
        console.log('🎭 [RolesGuard] User role details:', {
            id: user.role.id,
            name: user.role.name,
            nameType: typeof user.role.name,
            nameLength: user.role.name?.length
        });
        const userRoleName = user.role.name?.toLowerCase()?.trim();
        console.log('🔄 [RolesGuard] Normalized user role:', userRoleName);
        const hasRole = requiredRoles.some(role => {
            const normalizedRequiredRole = role?.toLowerCase()?.trim();
            console.log(`🔍 [RolesGuard] Comparing '${userRoleName}' === '${normalizedRequiredRole}'`);
            return userRoleName === normalizedRequiredRole;
        });
        console.log('✅ [RolesGuard] Has required role:', hasRole);
        if (!hasRole) {
            console.log('❌ [RolesGuard] Access denied - role mismatch');
            throw new common_1.ForbiddenException(`Acesso negado. Role atual: '${user.role.name}'. Roles necessárias: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map