import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../../../common/decorators/is-public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      classRef,
    ]);

    if (isPublic) {
      return true;
    }

    // Obter roles necessárias
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      handler,
      classRef,
    ]);

    console.log('🔍 [RolesGuard] Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const user = request.user;
    console.log('👤 [RolesGuard] User object:', {
      id: user?.id,
      nome: user?.nome,
      role: user?.role,
      roleId: user?.roleId,
    });

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.role) {
      console.log('❌ [RolesGuard] User role is null/undefined');
      throw new ForbiddenException('Usuário sem role definida');
    }

    console.log('🎭 [RolesGuard] User role details:', {
      id: user.role.id,
      name: user.role.name,
      nameType: typeof user.role.name,
      nameLength: user.role.name?.length,
    });

    // Verificar se o usuário tem uma das roles necessárias
    const userRoleName = user.role.name?.toLowerCase()?.trim();
    console.log('🔄 [RolesGuard] Normalized user role:', userRoleName);

    const hasRole = requiredRoles.some(role => {
      const normalizedRequiredRole = role?.toLowerCase()?.trim();
      console.log(
        `🔍 [RolesGuard] Comparing '${userRoleName}' === '${normalizedRequiredRole}'`,
      );
      return userRoleName === normalizedRequiredRole;
    });

    console.log('✅ [RolesGuard] Has required role:', hasRole);

    if (!hasRole) {
      console.log('❌ [RolesGuard] Access denied - role mismatch');
      throw new ForbiddenException(
        `Acesso negado. Role atual: '${user.role.name}'. Roles necessárias: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
