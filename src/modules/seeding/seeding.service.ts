import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleType } from '../users/enums/role-type.enum';

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando o processo de seeding do banco de dados...');
    await this.seedRoles();
    await this.updateExistingRoles();
    await this.seedAdminUser();
    this.logger.log('Seeding do banco de dados concluído.');
  }

  private async updateExistingRoles() {
    const rolePermissions = {
      [RoleType.ADMIN]: ['users:create', 'users:read', 'users:update', 'users:delete', 'roles:manage', 'system:admin', 'nugecid:manage', 'audit:read'],
      [RoleType.USUARIO]: ['nugecid:read', 'nugecid:create', 'nugecid:update', 'profile:read', 'dashboard:read', 'reports:read']
    };

    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName }
      });

      if (existingRole && (!existingRole.permissions || existingRole.permissions.length === 0)) {
        this.logger.log(`Atualizando permissões para a role: ${roleName}`);
        existingRole.permissions = permissions;
        await this.roleRepository.save(existingRole);
        this.logger.log(`Permissões atualizadas para a role: ${roleName}`);
      }
    }
  }

  private async seedRoles() {
    const existingRoles = await this.roleRepository.find();
    const existingRoleNames = existingRoles.map(role => role.name);

    const rolesToCreate = [
      { 
        name: RoleType.ADMIN, 
        description: 'Administrador do sistema',
        permissions: ['users:create', 'users:read', 'users:update', 'users:delete', 'roles:manage', 'system:admin', 'nugecid:manage', 'audit:read']
      },
      { 
        name: RoleType.USUARIO, 
        description: 'Usuário padrão',
        permissions: ['nugecid:read', 'nugecid:create', 'nugecid:update', 'profile:read', 'dashboard:read', 'reports:read']
      },
    ];

    const newRoles = rolesToCreate.filter(
      role => !existingRoleNames.includes(role.name),
    );

    if (newRoles.length > 0) {
      this.logger.log(`Criando ${newRoles.length} roles faltantes...`);
      const roleEntities = newRoles.map(role =>
        this.roleRepository.create(role),
      );
      await this.roleRepository.save(roleEntities);
      this.logger.log(
        'Roles criadas com sucesso:',
        newRoles.map(r => r.name).join(', '),
      );
    } else {
      this.logger.log('Todas as roles já existem.');
    }
  }

  private async seedAdminUser() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: RoleType.ADMIN },
    });
    if (!adminRole) {
      this.logger.error(
        'Role de Admin não encontrada. Não foi possível criar ou atualizar o usuário admin.',
      );
      return;
    }

    const adminUser = await this.userRepository.findOne({
      where: { usuario: 'admin' },
    });
    const hashedPassword = await bcrypt.hash('admin123', 12);

    if (adminUser) {
      this.logger.log('Usuário admin encontrado. Atualizando a senha...');
      adminUser.senha = hashedPassword;
      adminUser.role = adminRole;
      await this.userRepository.save(adminUser);
      this.logger.log('Usuário admin atualizado com sucesso.');
    } else {
      this.logger.log('Usuário admin não encontrado. Criando usuário admin...');
      const newAdminUser = this.userRepository.create({
        nome: 'Administrador',
        usuario: 'admin',
        senha: hashedPassword,
        ativo: true,
        role: adminRole,
      });
      await this.userRepository.save(newAdminUser);
      this.logger.log('Usuário admin criado com sucesso.');
    }
  }
}
