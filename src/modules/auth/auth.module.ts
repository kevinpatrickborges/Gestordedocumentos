import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Auditoria]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
      property: 'user',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Use the same config namespace as JwtStrategy to avoid secret mismatch
        secret:
          configService.get<string>('auth.jwt.secret') ||
          configService.get<string>(
            'JWT_SECRET',
            'sgc-itep-secret-key-change-in-production',
          ),
        signOptions: {
          expiresIn:
            configService.get<string>('auth.jwt.expiresIn') ||
            configService.get<string>('JWT_EXPIRES_IN', '50m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
