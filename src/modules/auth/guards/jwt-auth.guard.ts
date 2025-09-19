import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      let message = 'Token JWT inválido ou expirado';

      // Provide more specific error messages
      if (info) {
        if (info.name === 'TokenExpiredError') {
          message = 'jwt expired';
        } else if (info.name === 'JsonWebTokenError') {
          message = 'jwt malformed';
        } else if (info.message) {
          message = info.message;
        }
      } else if (err && err.message) {
        message = err.message;
      }

      throw new UnauthorizedException(message);
    }
    return user;
  }
}
