import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controller
import { UsersController } from './users.controller';

// Legacy Service (manter para compatibilidade)
// import { UsersService } from './users.service'; // Removido - arquivo contém UsersController

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';

// Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  RestoreUserUseCase,
  GetUserStatisticsUseCase,
  GetRolesUseCase,
} from './application/use-cases';

// Repository Interfaces
import { IUserRepository, IRoleRepository } from './domain/repositories';

// Repository Implementations
import {
  TypeOrmUserRepository,
  TypeOrmRoleRepository,
} from './infrastructure/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Auditoria])],
  controllers: [UsersController],
  providers: [
    // Legacy Service (manter para compatibilidade)
    // UsersService, // Removido - não existe essa classe

    // Repository Implementations
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: TypeOrmRoleRepository,
    },

    // Use Cases
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserByIdUseCase,
    GetUsersUseCase,
    RestoreUserUseCase,
    GetUserStatisticsUseCase,
    GetRolesUseCase,
  ],
  exports: [
    // UsersService, // Removido - não existe essa classe
    TypeOrmModule,
    // Exportar casos de uso para outros módulos se necessário
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserByIdUseCase,
    GetUsersUseCase,
    RestoreUserUseCase,
    GetUserStatisticsUseCase,
    GetRolesUseCase,
  ],
})
export class UsersModule {}
